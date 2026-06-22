import sys
import os
import time
import json
import re
import sqlite3
import requests
import unicodedata

# Configure console to support Vietnamese Unicode print out on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add current directory to path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)

from v1 import (
    API_BASE_URL, 
    API_MODEL, 
    API_TIMEOUT_CONNECT, 
    API_TIMEOUT_READ, 
    API_RETRY_DELAY, 
    API_TOKENS, 
    parse_ai_json, 
    normalize_ai_rows, 
    extract_completion_content,
    extract_stream_content
)
from map1 import save_room_to_sqlite, DEFAULT_DB_PATH

# Specialized system prompt to help AI correct room prices under 1 million
SYSTEM_PROMPT_FIX = """Bạn là chuyên gia bóc tách và sửa đổi dữ liệu bất động sản.
Nhiệm vụ của bạn là nhận vào văn bản tin đăng phòng trọ và trích xuất lại thông tin chính xác dưới dạng JSON.

== BỐI CẢNH QUAN TRỌNG ==
Tin đăng này có giá phòng trọ đang bị bóc tách sai lệch (dưới 1 triệu VNĐ, ví dụ: '11tr' bị nhận diện thành '11000' hoặc '5.5tr' bị thành '550000').
Vui lòng phân tích kỹ văn bản để lấy đúng giá phòng trọ thực tế.

== QUY TẮC BẮT BUỘC ==
1. Giá phòng trọ ở Hà Nội thường từ 1.5 triệu đến hàng chục triệu đồng. Hãy chắc chắn quy đổi giá phòng về đúng đơn vị VNĐ đầy đủ chữ số (VÍ DỤ: '11tr' = 11000000, '5.5tr' = 5500000, '4.5 triệu' = 4500000, '4500k' = 4500000).
2. Nếu tin đăng ghi giá bằng USD (Ví dụ: '$1500' hoặc '1500$'), hãy quy đổi sang VNĐ bằng cách nhân với 25000 (Ví dụ: 1500$ = 37500000 VNĐ) và điền vào price1, price2.
3. Output bắt buộc là một MẢNG chứa ĐÚNG 1 OBJECT duy nhất có các trường: "id", "address", "price", "price1", "price2", "type".
4. "price" phải ghi rõ dạng chuỗi (VD: "5.5tr", "11tr"). "price1" và "price2" phải là các chuỗi số nguyên VND đầy đủ (VD: "5500000", "11000000").
5. "type" là dạng phòng hợp lệ: "studio", "1pn", "2n1k", "2n1b", "duplex", "gác xép". Null nếu không có.
6. Chỉ trả về JSON hợp lệ, không markdown, không giải thích."""

def remove_accents(input_str):
    if not input_str:
        return ""
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    only_ascii = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    return only_ascii.replace('đ', 'd').replace('Đ', 'D')

def parse_price_string(price_str):
    """Parse common Vietnamese price formats like '5.5tr', '11tr', '7tr5', '4500k', '5-6tr' to absolute integers."""
    if not price_str:
        return None
    
    # Normalize string: lowercase, remove spaces, convert commas to dots
    s = price_str.lower().strip().replace(" ", "").replace(",", ".")
    
    # Strip Vietnamese accents to make regex matching robust (e.g. triệu -> trieu)
    s = remove_accents(s)
    
    # Clean trailing dots before tr or trieu (e.g. '3.tr' -> '3tr')
    s = s.replace(".tr", "tr").replace(".trieu", "trieu")
    
    # Match USD: e.g. "1500$", "$1500", "1500-1600$"
    if "$" in price_str or "usd" in s:
        s_usd = s.replace("$", "").replace("usd", "")
        m_usd_range = re.match(r"^(\d+)-(\d+)$", s_usd)
        if m_usd_range:
            p1 = float(m_usd_range.group(1)) * 25000
            p2 = float(m_usd_range.group(2)) * 25000
            return int(p1), int(p2)
        m_usd_single = re.match(r"^(\d+)$", s_usd)
        if m_usd_single:
            p = float(m_usd_single.group(1)) * 25000
            return int(p), int(p)

    # Match ranges: e.g. "5.2-6.5tr", "5.2-6.5tr/tháng"
    m_range = re.match(r"^(\d+(\.\d+)?)-(\d+(\.\d+)?)(tr|trieu|tr/thang|trieu/thang)$", s)
    if m_range:
        p1 = float(m_range.group(1)) * 1000000
        p2 = float(m_range.group(3)) * 1000000
        return int(p1), int(p2)

    # Match single value: e.g. "5.5tr", "11tr", "5tr"
    m_single = re.match(r"^(\d+(\.\d+)?)(tr|trieu|tr/thang|trieu/thang)$", s)
    if m_single:
        p = float(m_single.group(1)) * 1000000
        return int(p), int(p)

    # Match format like '7tr5'
    m_split = re.match(r"^(\d+)(tr|trieu)(\d+)$", s)
    if m_split:
        p = float(m_split.group(1)) * 1000000 + float(m_split.group(3)) * 100000
        return int(p), int(p)

    # Match format like '4500k'
    m_k = re.match(r"^(\d+)(k|ngan|k/thang)$", s)
    if m_k:
        p = float(m_k.group(1)) * 1000
        if p < 100000:
            return int(p), int(p)
        return int(p), int(p)

    # Match format like '4000-5000k'
    m_k_range = re.match(r"^(\d+)-(\d+)(k|ngan|k/thang)$", s)
    if m_k_range:
        p1 = float(m_k_range.group(1)) * 1000
        p2 = float(m_k_range.group(2)) * 1000
        return int(p1), int(p2)

    # Match format like '11.000' or '5.500' (abbreviated millions)
    m_dot_abbr = re.match(r"^(\d{1,2})\.(\d{3})(d|đ|d/thang|đ/thang)?$", s)
    if m_dot_abbr:
        p = (float(m_dot_abbr.group(1)) + float(m_dot_abbr.group(2)) / 1000.0) * 1000000
        return int(p), int(p)

    return None

def format_price_to_text(p1, p2):
    if p1 == p2:
        val = p1 / 1000000.0
        if val.is_integer():
            return f"{int(val)}tr"
        else:
            return f"{val:.1f}tr"
    else:
        v1 = p1 / 1000000.0
        v2 = p2 / 1000000.0
        s1 = f"{int(v1)}" if v1.is_integer() else f"{v1:.1f}"
        s2 = f"{int(v2)}" if v2.is_integer() else f"{v2:.1f}"
        return f"{s1}-{s2}tr"

def fix_price_value(val):
    """Smart fallback safeguard: if price is under 1 million, scale it up to millions."""
    try:
        num = int(val)
        if num <= 0:
            return num
        if num < 100:  # e.g. 11 or 5 -> scale to millions
            return num * 1000000
        if num < 1000:  # e.g. 500 -> scale to thousands
            return num * 1000
        if num < 10000:  # e.g. 4500 or 1500 -> scale to millions
            return num * 1000
        if num < 100000:  # e.g. 11000 or 45000
            if num < 30000:  # 11000 -> 11,000,000
                return num * 1000
            else:  # 45000 -> 4,500,000
                return num * 100
        return num
    except (ValueError, TypeError):
        return 0

def process_single_item_for_fix(session_id: str, raw_text: str, max_retries: int = 3) -> list[dict[str, Any]] | None:
    payload = {
        "model": API_MODEL,
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT_FIX
            },
            {
                "role": "user",
                "content": raw_text
            }
        ],
        "stream": True
    }

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    last_error = ""
    attempt = 0
    attempt_429 = 0
    while attempt < max_retries:
        try:
            current_headers = dict(headers)
            if API_TOKENS:
                import random
                token = random.choice(API_TOKENS)
                current_headers["Authorization"] = f"Bearer {token}"

            api_url = f"{API_BASE_URL.rstrip('/')}/chat/completions"
            response = requests.post(
                api_url,
                headers=current_headers,
                json=payload,
                timeout=(API_TIMEOUT_CONNECT, API_TIMEOUT_READ)
            )

            if response.status_code == 429:
                attempt_429 += 1
                if attempt_429 > 3:
                    last_error = f"HTTP 429: Too Many Requests (exceeded max 429 retries)"
                    break
                sleep_time = min(15 * attempt_429, 120)
                last_error = f"HTTP 429: {response.text}"
                print(f"  [AI-FIX] HTTP 429: Too Many Requests. Sleeping for {sleep_time}s before retry (attempt {attempt_429})...")
                time.sleep(sleep_time)
                continue

            if response.status_code >= 400:
                last_error = f"HTTP {response.status_code}: {response.text}"
                attempt += 1
                if attempt < max_retries:
                    time.sleep(API_RETRY_DELAY)
                continue

            res_json = None
            content_type = response.headers.get("Content-Type", "")
            is_stream = "text/event-stream" in content_type or response.text.strip().startswith("data:")
            if is_stream:
                content = extract_stream_content(response)
            else:
                try:
                    res_json = response.json()
                    content = extract_completion_content(res_json)
                except Exception as json_err:
                    if response.text.strip().startswith("data:"):
                        content = extract_stream_content(response)
                    else:
                        raise json_err

            if not content:
                last_error = f"Empty response or parsing failure from AI. Response: {res_json or response.text}"
                attempt += 1
                if attempt < max_retries:
                    time.sleep(API_RETRY_DELAY)
                continue

            parsed = parse_ai_json(content)
            if isinstance(parsed, dict):
                parsed = [parsed]

            if isinstance(parsed, list):
                dict_rows = [row for row in parsed if isinstance(row, dict)]
                normalized = normalize_ai_rows(dict_rows, session_id)
                return normalized
            else:
                last_error = f"AI returned non-list JSON: {type(parsed).__name__}"

        except Exception as e:
            last_error = f"{type(e).__name__}: {e}"

        attempt += 1
        if attempt < max_retries:
            time.sleep(API_RETRY_DELAY)

    print(f"  [AI-FIX] Bóc tách qua AI thất bại cho session {session_id}. Lỗi cuối cùng: {last_error}")
    return None

def check_and_fix_rooms():
    print(f"[CRON] Bắt đầu quét các phòng có giá dưới 1 triệu từ {DEFAULT_DB_PATH}...")
    if not os.path.exists(DEFAULT_DB_PATH):
        print(f"[CRON] Lỗi: Không tìm thấy database tại {DEFAULT_DB_PATH}")
        return

    # Track processed IDs to prevent repeating AI calls
    checked_file = os.path.join(SCRIPT_DIR, 'scratch', 'price_fix_checked.json')
    os.makedirs(os.path.dirname(checked_file), exist_ok=True)
    
    checked_ids = set()
    if os.path.exists(checked_file):
        try:
            with open(checked_file, 'r', encoding='utf-8') as f:
                checked_ids = set(json.load(f))
        except Exception:
            pass

    conn = sqlite3.connect(DEFAULT_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        # Query rooms with price > 0 and price < 1,000,000 and not manual
        cursor.execute("""
            SELECT id, session_id, room_code, address, price, price1, price2, room_type, district, text1, text2, photos, videos, timestamp 
            FROM rooms 
            WHERE price1 > 0 AND price1 < 1000000 AND session_id NOT LIKE 'manual_%'
        """)
        rows = cursor.fetchall()
        
        # Filter out already checked IDs
        pending_rows = [row for row in rows if row['id'] not in checked_ids]
        
        if not pending_rows:
            print(f"[CRON] Không tìm thấy phòng mới cần sửa giá (Tổng số phòng dưới 1M hiện tại: {len(rows)}).")
            return

        print(f"[CRON] Tìm thấy {len(pending_rows)} phòng cần kiểm tra/sửa giá.")

        fixed_by_regex = 0
        fixed_by_ai = 0
        fixed_by_fallback = 0

        for row in pending_rows:
            room_id = row['id']
            session_id = row['session_id']
            price_str = row['price'] or ''
            text2 = row['text2'] or ''
            district_name = row['district'] or 'Cầu Giấy'

            # Always mark this room_id as checked in this run
            checked_ids.add(room_id)

            print(f"[CRON] Đang kiểm tra phòng ID {room_id} (Địa chỉ: {row['address']}, Giá: '{price_str}', Giá trị số: {row['price1']}đ)...")

            # Step 1: Try deterministic regex parsing first
            parsed_price = parse_price_string(price_str)
            if parsed_price:
                new_p1, new_p2 = parsed_price
                if new_p1 >= 1000000:
                    new_price_str = format_price_to_text(new_p1, new_p2)
                    cursor.execute("""
                        UPDATE rooms 
                        SET price = ?, price1 = ?, price2 = ?
                        WHERE id = ?
                    """, (new_price_str, new_p1, new_p2, room_id))
                    conn.commit()
                    print(f"  [REGEX THÀNH CÔNG] Đã sửa phòng ID {room_id} -> {new_price_str} ({new_p1} - {new_p2} đ)")
                    fixed_by_regex += 1
                    continue

            # Step 2: Fall back to AI extraction if regex failed
            print(f"  [REGEX THẤT BẠI] Gửi văn bản thô lên AI để bóc tách/sửa lại phòng...")
            
            raw_text = text2
            if raw_text.strip().startswith('{'):
                try:
                    parsed_json = json.loads(raw_text)
                    raw_text = parsed_json.get('text2', '') or parsed_json.get('description', '') or raw_text
                except Exception:
                    pass

            if not raw_text.strip():
                print(f"  [AI BỎ QUA] Không có văn bản thô. Tự động áp dụng smart fallback...")
                p1_corrected = fix_price_value(row['price1'])
                p2_corrected = fix_price_value(row['price2'])
                if p1_corrected >= 1000000:
                    new_price_str = format_price_to_text(p1_corrected, p2_corrected)
                    cursor.execute("""
                        UPDATE rooms 
                        SET price = ?, price1 = ?, price2 = ?
                        WHERE id = ?
                    """, (new_price_str, p1_corrected, p2_corrected, room_id))
                    conn.commit()
                    print(f"  [FALLBACK THÀNH CÔNG] Đã sửa phòng ID {room_id} -> {new_price_str} ({p1_corrected} - {p2_corrected} đ)")
                    fixed_by_fallback += 1
                continue

            # Throttling to avoid rate limit (429) from API
            time.sleep(2.0)

            parsed_rooms = process_single_item_for_fix(session_id, raw_text, max_retries=2)

            if parsed_rooms:
                for r in parsed_rooms:
                    new_p1 = fix_price_value(r.get("price1", 0))
                    new_p2 = fix_price_value(r.get("price2", 0))
                    r["price1"] = str(new_p1)
                    r["price2"] = str(new_p2)
                    
                    if new_p1 >= 1000000:
                        r["price"] = format_price_to_text(new_p1, new_p2)

                    session_info = {
                        "text1": row["text1"],
                        "text2": row["text2"],
                        "photos": json.loads(row["photos"]) if row["photos"] else [],
                        "videos": json.loads(row["videos"]) if row["videos"] else [],
                        "timestamp": row["timestamp"]
                    }
                    
                    save_room_to_sqlite(r, session_info, district_name, db_path=DEFAULT_DB_PATH)
                    print(f"  [AI THÀNH CÔNG] Đã sửa phòng ID {room_id} -> {r['price']} ({new_p1} - {new_p2} đ)")
                    fixed_by_ai += 1
            else:
                # Step 3: Fall back to auto-correct directly in SQLite if AI fails
                print(f"  [AI THẤT BẠI] Tự động sửa giá trực tiếp bằng smart fallback...")
                p1_corrected = fix_price_value(row['price1'])
                p2_corrected = fix_price_value(row['price2'])
                if p1_corrected >= 1000000:
                    new_price_str = format_price_to_text(p1_corrected, p2_corrected)
                    cursor.execute("""
                        UPDATE rooms 
                        SET price = ?, price1 = ?, price2 = ?
                        WHERE id = ?
                    """, (new_price_str, p1_corrected, p2_corrected, room_id))
                    conn.commit()
                    print(f"  [FALLBACK THÀNH CÔNG] Đã sửa phòng ID {room_id} -> {new_price_str} ({p1_corrected} - {p2_corrected} đ)")
                    fixed_by_fallback += 1

        # Save checked room IDs back to json
        try:
            with open(checked_file, 'w', encoding='utf-8') as f:
                json.dump(list(checked_ids), f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"[CRON] Lỗi lưu danh sách checked_ids: {e}")

        print(f"\n[CRON] Hoàn tất quét sửa giá!")
        print(f" - Sửa bằng Regex nhanh: {fixed_by_regex} phòng")
        print(f" - Sửa bằng AI: {fixed_by_ai} phòng")
        print(f" - Sửa bằng Fallback tự động: {fixed_by_fallback} phòng")
        print(f" - Tổng cộng đã sửa trong lượt này: {fixed_by_regex + fixed_by_ai + fixed_by_fallback} phòng.")

    except Exception as e:
        print(f"[CRON] Lỗi trong quá trình sửa giá: {e}")
    finally:
        conn.close()

def main():
    print("[CRON] Khởi chạy dịch vụ tự động sửa giá phòng dưới 1 triệu...")
    while True:
        try:
            check_and_fix_rooms()
        except Exception as e:
            print(f"[CRON] Lỗi vòng lặp chính: {e}")
        print("[CRON] Đang ngủ 5 phút trước lượt quét tiếp theo...")
        time.sleep(300)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--once':
        check_and_fix_rooms()
    else:
        main()
