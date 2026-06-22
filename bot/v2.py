import argparse
import json
import os
import random
import time
from typing import Any

import re
import requests
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from map1 import save_room_to_sqlite, init_db



API_BASE_URL = os.getenv("API_BASE_URL", "https://api.vietapi.tech/v1")
API_MODEL = os.getenv("API_MODEL", "sonnet")
API_TIMEOUT_CONNECT = float(os.getenv("API_TIMEOUT_CONNECT", "15"))
API_TIMEOUT_READ = float(os.getenv("API_TIMEOUT_READ", "240"))
API_RETRY_DELAY = float(os.getenv("API_RETRY_DELAY", "2"))
API_DEBUG_ERRORS = os.getenv("API_DEBUG_ERRORS", "true").lower() in {"1", "true", "yes"}
API_LOCAL_ONLY = os.getenv("API_LOCAL_ONLY", "false").lower() in {"1", "true", "yes"}

# Nhap key truc tiep trong code neu muon (uu tien cao hon env)
HARDCODED_API_KEYS: list[str] = []
HARDCODED_API_KEY = "sk-lWIIAQLc58sZOoRUZIFjcG7kpgN9eYVMK9DUwQyL9qbTYhyR"


def load_api_tokens() -> list[str]:
    if HARDCODED_API_KEYS:
        return [token.strip() for token in HARDCODED_API_KEYS if str(token).strip()]

    if HARDCODED_API_KEY.strip():
        return [HARDCODED_API_KEY.strip()]

    for env_name in ("API_KEYS", "CLOUDFLARE_API_KEYS"):
        raw_multi = os.getenv(env_name, "").strip()
        if raw_multi:
            return [token.strip() for token in raw_multi.split(",") if token.strip()]

    for env_name in ("API_KEY", "CLOUDFLARE_API_KEY"):
        raw_single = os.getenv(env_name, "").strip()
        if raw_single:
            return [raw_single.strip()]

    return []


API_TOKENS = load_api_tokens()


SYSTEM_PROMPT = """Bạn là chuyên gia bóc tách dữ liệu bất động sản. Chỉ trả về JSON hợp lệ, không markdown, không giải thích.

== NHIỆM VỤ ==
Từ raw_text, trích xuất thông tin phòng trọ thành mảng JSON gồm ĐÚNG 1 OBJECT duy nhất.

== QUY TẮC CỨNG BẮT BUỘC ==
1. OUTPUT PHẢI LÀ MẢNG CHỈ CÓ 1 OBJECT. Tuyệt đối không được tạo nhiều object dù tin đăng có bao nhiêu phòng, bao nhiêu trục.
2. Object bắt buộc có: "id", "address", "price", "price1", "price2", "type".
3. "id": Lấy mã phòng hoặc mã trục. Nếu có NHIỀU mã thì GHÉP thành 1 chuỗi duy nhất (VD: "Trục 01/02/03", "P301/P302"). Null nếu không có.
4. "address": Lấy địa chỉ NGẮN GỌN NHẤT, chuẩn xác nhất. Loại bỏ các phần mô tả phụ như "(cách chợ 50m, ngõ rộng...)".
5. "price": Khoảng giá hoặc giá cố định (VD: "5.2-6.5tr", "4.3tr").
6. "price1": Giá thấp nhất CHUYỂN SANG SỐ NGUYÊN HOÀN CHỈNH (thêm đủ 6 số 0 cho hàng triệu). VÍ DỤ CHUẨN: "5tr" => "5000000", "5.2tr" => "5200000", "4tr3" => "4300000", "4500k" => "4500000". TUYỆT ĐỐI KHÔNG trả về thiếu số 0 (không được trả "500000" cho 5 triệu, phải là "5000000").
7. "price2": Giá cao nhất chuyển sang số nguyên (tương tự quy tắc 6 số 0 của price1). Nếu chỉ 1 mức giá, price2 = price1.
8. "type": Dạng phòng. Tag hợp lệ: "studio", "1pn", "2n1k", "2n1b", "duplex", "gác xép". trong text có nhắc đến thì mới có không thì là null. Null nếu không có.
9. Không tự suy luận. Nếu thiếu địa chỉ hoặc thiếu giá, trả về mảng rỗng [].

== VÍ DỤ SAI (TUYỆT ĐỐI TRÁNH) ==
Input: "Trục 01: 4tr3, địa chỉ: Số 163 ngõ 90 Hoàng Ngân (cách chợ 50m)"
Output SAI 1: [{"id":"Trục 01",...},{"id":"Trục 02",...}]
Output SAI 2: [{"id":"Trục 01","address":"Số 163 ngõ 90 Hoàng Ngân (cách chợ 50m)","price":"4tr3","price1":"43000","price2":"43000","type":null}] // SAI VÌ địa chỉ dính mô tả phụ và giá thiếu số 0.

== VÍ DỤ ĐÚNG ==
Input: "Trục 01: 4tr3, địa chỉ: Số 163 ngõ 90 Hoàng Ngân (cách chợ 50m)"
Output ĐÚNG: [{"id":"Trục 01","address":"Số 163 ngõ 90 Hoàng Ngân","price":"4.3tr","price1":"4300000","price2":"4300000","type":null}]

Chỉ trả về JSON hợp lệ."""


def extract_completion_content(result: dict[str, Any]) -> str:
    choices = result.get("choices") or []
    if not choices:
        return ""

    message = choices[0].get("message") or {}
    content = message.get("content", "")

    # Log reasoning_content from one-shot if present
    reasoning_content = message.get("reasoning_content") or message.get("reasoning")
    if isinstance(reasoning_content, str) and reasoning_content.strip():
        print(f"  [AI Thinking] {reasoning_content.strip()}")

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        text_chunks: list[str] = []
        for part in content:
            if not isinstance(part, dict):
                continue
            if isinstance(part.get("text"), str):
                text_chunks.append(part["text"])
            elif isinstance(part.get("content"), str):
                text_chunks.append(part["content"])
        return "".join(text_chunks)

    return str(content)


def extract_stream_content(response: requests.Response) -> str:
    chunks: list[str] = []
    raw_lines: list[str] = []
    printed_thinking_header = False

    # Get lines from iter_lines or fallback to splitlines
    lines: list[str] = []
    try:
        for line in response.iter_lines():
            if line:
                lines.append(line.decode("utf-8", errors="replace"))
    except Exception:
        pass

    if not lines and response.text:
        lines = response.text.splitlines()

    for line_str in lines:
        decoded_line = line_str.strip()
        if not decoded_line:
            continue

        raw_lines.append(decoded_line)
        if not decoded_line.startswith("data:"):
            continue

        data = decoded_line[5:].strip()
        if data == "[DONE]":
            break

        try:
            event = json.loads(data)
        except json.JSONDecodeError:
            continue

        choices = event.get("choices") or []
        if not choices:
            continue

        choice = choices[0]
        delta = choice.get("delta") or {}
        
        # Extract and print reasoning chunks in real-time
        reasoning_content = delta.get("reasoning_content") or delta.get("reasoning")
        if isinstance(reasoning_content, str) and reasoning_content:
            if not printed_thinking_header:
                print("  [AI Thinking] ", end="", flush=True)
                printed_thinking_header = True
            sys.stdout.write(reasoning_content)
            sys.stdout.flush()

        delta_content = delta.get("content")
        if isinstance(delta_content, str):
            chunks.append(delta_content)
            continue

        if isinstance(delta_content, list):
            for part in delta_content:
                if isinstance(part, dict) and isinstance(part.get("text"), str):
                    chunks.append(part["text"])
            continue

        message = choice.get("message") or {}
        message_content = message.get("content")
        if isinstance(message_content, str):
            chunks.append(message_content)

    if printed_thinking_header:
        print() # End of thinking log

    content = "".join(chunks).strip()
    if content:
        return content

    # Some gateways ignore SSE and return one-shot JSON even when stream=True.
    if len(raw_lines) == 1 and raw_lines[0].startswith("{"):
        try:
            event = json.loads(raw_lines[0])
        except json.JSONDecodeError:
            return raw_lines[0]

        if isinstance(event, dict):
            completion_content = extract_completion_content(event)
            return completion_content if completion_content else raw_lines[0]

    return "\n".join(raw_lines).strip()


def clean_json_block(content: str) -> str:
    content = content.strip()
    content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
    content = re.sub(r'<think>.*$', '', content, flags=re.DOTALL).strip()
    if "```json" in content:
        content = content.split("```json", 1)[1].split("```", 1)[0].strip()
    elif "```" in content:
        content = content.split("```", 1)[1].split("```", 1)[0].strip()
    return content


def truncate_for_log(text: str, limit: int = 400) -> str:
    clean = " ".join(str(text).split())
    if len(clean) <= limit:
        return clean
    return clean[:limit] + "...(truncated)"


def extract_json_candidate(text: str) -> str:
    start = -1
    stack: list[str] = []
    in_string = False
    escaped = False

    for i, ch in enumerate(text):
        if start == -1:
            if ch in "{[":
                start = i
                stack.append(ch)
            continue

        if in_string:
            if escaped:
                escaped = False
                continue
            if ch == "\\":
                escaped = True
                continue
            if ch == '"':
                in_string = False
            continue

        if ch == '"':
            in_string = True
            continue

        if ch in "{[":
            stack.append(ch)
            continue

        if ch in "}]":
            if not stack:
                continue

            top = stack[-1]
            if (top == "{" and ch == "}") or (top == "[" and ch == "]"):
                stack.pop()
                if not stack:
                    return text[start : i + 1]
            else:
                return ""

    return ""


def parse_ai_json(content: str) -> Any:
    cleaned = clean_json_block(content)
    if not cleaned:
        raise ValueError("AI returned empty content.")

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as err:
        candidate = extract_json_candidate(cleaned)
        if candidate:
            return json.loads(candidate)
        raise ValueError(f"AI returned non-JSON content: {truncate_for_log(cleaned)}") from err


def error_payload_snippet(response: requests.Response, limit: int = 400) -> str:
    try:
        return truncate_for_log(response.text, limit=limit)
    except Exception:
        return "<unavailable>"


def normalize_ai_rows(rows: list[dict[str, Any]], session_id: str) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for row in rows:
        room_id = row.get("id")
        room_id_str = str(room_id).strip() if room_id is not None and str(room_id).lower() not in ("null", "none", "") else None

        if room_id_str and room_id_str in seen_ids:
            continue
        if room_id_str:
            seen_ids.add(room_id_str)

        address = row.get("address")
        price = row.get("price")
        price1 = row.get("price1")
        price2 = row.get("price2")
        type_value = row.get("type")

        if address is None or price is None or price1 is None or price2 is None:
            continue

        address_str = str(address).strip()
        price_str = str(price).strip()
        price1_str = str(price1).strip()
        price2_str = str(price2).strip()

        # Đã bỏ hàm fix_zeros vì prompt AI đã được cấu hình chặt chẽ để trả về đúng chuỗi số nguyên đầy đủ.

        if not address_str or not price_str or not price1_str or not price2_str:
            continue

        if isinstance(type_value, list):
            tags = [str(tag).strip() for tag in type_value if str(tag).strip()]
            normalized_type: str | None = ", ".join(tags) if tags else None
        elif type_value is None or str(type_value).lower() in ("null", "none", ""):
            normalized_type = None
        else:
            type_str = str(type_value).strip()
            normalized_type = type_str if type_str else None

        normalized.append(
            {
                "session_id": session_id,
                "id": room_id_str,
                "address": address_str,
                "price": price_str,
                "price1": price1_str,
                "price2": price2_str,
                "type": normalized_type,
            }
        )

    # SAFEGUARD: AI trả về nhiều object cho 1 tin đăng → gộp thành 1 object duy nhất
    if len(normalized) > 1:
        ids = "/".join(r["id"] for r in normalized if r["id"]) or None
        # Lấy địa chỉ ngắn nhất
        best_address = min((r["address"] for r in normalized), key=len)
        # price1 = giá thấp nhất, price2 = giá cao nhất
        try:
            p1 = min(int(r["price1"]) for r in normalized if r["price1"].isdigit())
            p2 = max(int(r["price2"]) for r in normalized if r["price2"].isdigit())
        except (ValueError, AttributeError):
            p1 = int(normalized[0]["price1"]) if normalized[0]["price1"].isdigit() else 0
            p2 = int(normalized[-1]["price2"]) if normalized[-1]["price2"].isdigit() else p1
        p1_str = str(p1)
        p2_str = str(p2)
        # price text
        if p1 == p2:
            price_merged = f"{p1 // 1_000_000}tr" if p1 >= 1_000_000 else str(p1)
        else:
            lo = f"{p1 / 1_000_000:.1f}".rstrip("0").rstrip(".")
            hi = f"{p2 / 1_000_000:.1f}".rstrip("0").rstrip(".")
            price_merged = f"{lo}-{hi}tr"
        # type: ghép các type khác nhau
        types = list(dict.fromkeys(r["type"] for r in normalized if r["type"]))
        merged_type = ", ".join(types) if types else None

        print(f"  [SAFEGUARD] AI trả {len(normalized)} objects -> gộp thành 1: id={ids}, price={price_merged}")
        return [{
            "session_id": session_id,
            "id": ids,
            "address": best_address,
            "price": price_merged,
            "price1": p1_str,
            "price2": p2_str,
            "type": merged_type,
        }]

    return normalized


def process_single_item(session_id: str, raw_text: str, max_retries: int = 5) -> list[dict[str, Any]] | None:
    if API_LOCAL_ONLY:
        # Mock local output
        return [{"session_id": session_id, "id": None, "address": "Mock Address", "price": "1tr", "price1": "1000000", "price2": "1000000", "type": None}]

    payload = {
        "model": API_MODEL,
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
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
                print(f"  [AI] HTTP 429: Too Many Requests. Sleeping for {sleep_time}s before retry (attempt {attempt_429})...")
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
                # Succeeded in calling AI and parsing JSON; return result (even if empty) to avoid retry.
                return normalized
            else:
                last_error = f"AI returned non-list JSON: {type(parsed).__name__}"

        except Exception as e:
            last_error = f"{type(e).__name__}: {e}"

        attempt += 1
        if attempt < max_retries:
            time.sleep(API_RETRY_DELAY)

    if API_DEBUG_ERRORS and last_error:
        print(f"  [AI] Extraction failed for session {session_id}. Last error: {last_error}")

    return None


def has_json_files(directory: str) -> bool:
    if not os.path.isdir(directory):
        return False
    return any(name.lower().endswith(".json") for name in os.listdir(directory))


def find_summary_candidates(base_dir: str) -> list[str]:
    if not os.path.isdir(base_dir):
        return []

    name_options = (
        "districts_summary",
        "districts_sumary",
        "district_summary",
        "district_sumary",
        "summary",
        "sumary",
    )

    candidates: list[str] = []
    for name in name_options:
        candidates.append(os.path.join(base_dir, name))

    try:
        child_dirs = [entry.path for entry in os.scandir(base_dir) if entry.is_dir()]
    except OSError:
        child_dirs = []

    # Extra fallback: pick dirs that look like summary/sumary naming.
    for child in child_dirs:
        child_name = os.path.basename(child).lower()
        if "sum" in child_name:
            candidates.append(child)

    return candidates


def find_full_candidates(base_dir: str) -> list[str]:
    if not os.path.isdir(base_dir):
        return []

    name_options = (
        "districts_full",
        "district_full",
        "full",
    )

    candidates: list[str] = []
    for name in name_options:
        candidates.append(os.path.join(base_dir, name))

    try:
        child_dirs = [entry.path for entry in os.scandir(base_dir) if entry.is_dir()]
    except OSError:
        child_dirs = []

    # Extra fallback: pick dirs that look like full naming.
    for child in child_dirs:
        child_name = os.path.basename(child).lower()
        if "full" in child_name:
            candidates.append(child)

    return candidates


def first_existing_json_dir(candidates: list[str]) -> str | None:
    seen: set[str] = set()
    for candidate in candidates:
        abs_candidate = os.path.abspath(candidate)
        if abs_candidate in seen:
            continue
        seen.add(abs_candidate)
        if has_json_files(abs_candidate):
            return abs_candidate
    return None


def resolve_input_dirs(
    cli_summary_dir: str | None,
    cli_full_dir: str | None,
) -> tuple[str | None, str | None]:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    cwd = os.getcwd()
    search_roots = [script_dir, cwd, os.path.join(cwd, "bot"), os.path.join(cwd, "batdongsan")]

    summary_candidates: list[str] = []
    if cli_summary_dir:
        cli_path = os.path.abspath(cli_summary_dir)
        summary_candidates.append(cli_path)
        summary_candidates.extend(find_summary_candidates(cli_path))
    for root in search_roots:
        summary_candidates.extend(find_summary_candidates(root))

    full_candidates: list[str] = []
    if cli_full_dir:
        cli_path = os.path.abspath(cli_full_dir)
        full_candidates.append(cli_path)
        full_candidates.extend(find_full_candidates(cli_path))
    for root in search_roots:
        full_candidates.extend(find_full_candidates(root))

    summary_dir = first_existing_json_dir(summary_candidates)
    full_dir = first_existing_json_dir(full_candidates)

    if summary_dir is None and full_dir is None:
        raise FileNotFoundError(
            "Cannot find input directory with JSON files. "
            "Supported names include districts_summary / summary / sumary "
            "and districts_full / full. Use --summary-dir or --full-dir."
        )

    return summary_dir, full_dir


def resolve_ok_dir(cli_ok_dir: str | None, source_dir: str) -> str:
    if cli_ok_dir:
        return os.path.abspath(cli_ok_dir)
    return os.path.join(os.path.dirname(source_dir), "district_ai")


def load_json_array(path: str) -> list[dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        return [row for row in data if isinstance(row, dict)]
    return []


def save_json_array(path: str, data: list[dict[str, Any]]) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def normalize_input_rows(rows: list[dict[str, Any]]) -> list[dict[str, str]]:
    normalized: list[dict[str, str]] = []
    seen_ids: set[str] = set()

    for row in rows:
        room_id = str(row.get("id", "")).strip()
        if not room_id or room_id in seen_ids:
            continue

        # text1 = bản có hoa hồng (admin), dùng để gửi AI trích xuất
        # text2 = bản công khai (hiển thị web), không có thông tin hoa hồng
        text1 = str(row.get("text1") or "").strip()
        text2 = str(row.get("text2") or "").strip()

        # Fallback cho dữ liệu cũ chỉ có 1 trường text
        if not text1 and not text2:
            for key in ("original_text", "raw_text", "text", "content", "message"):
                value = row.get(key)
                if isinstance(value, str) and value.strip():
                    text2 = value.strip()
                    break

        if not text1 and not text2:
            continue

        # Gửi text1 (có hoa hồng) cho AI để trích xuất – phần hóa hồng sẽ bị ignore bởi AI
        # nếu không có text1 thì dùng text2
        raw_text_for_ai = text1 if text1 else text2

        normalized.append({"id": room_id, "raw_text": raw_text_for_ai, "text1": text1, "text2": text2})
        seen_ids.add(room_id)

    return normalized


def merge_summary_full_rows(
    summary_rows: list[dict[str, str]],
    full_rows: list[dict[str, str]],
) -> list[dict[str, str]]:
    by_id: dict[str, dict[str, str]] = {}
    order: list[str] = []

    # Keep summary order/values as primary source.
    for row in summary_rows:
        room_id = row["id"]
        if room_id not in by_id:
            order.append(room_id)
        by_id[room_id] = row

    # Fill missing IDs from full; also merge text1/text2 if one source has it.
    for row in full_rows:
        room_id = row["id"]
        if room_id in by_id:
            # Supplement missing text1/text2 from full source
            existing = by_id[room_id]
            if not existing.get("text1") and row.get("text1"):
                existing["text1"] = row["text1"]
            if not existing.get("text2") and row.get("text2"):
                existing["text2"] = row["text2"]
            continue
        by_id[room_id] = row
        order.append(room_id)

    return [by_id[room_id] for room_id in order]


def dedupe_by_id(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen = set()
    deduped = []
    for item in items:
        session_id = item.get("session_id", "")
        room_id = item.get("id") or ""
        address = item.get("address", "")
        price = item.get("price", "")
        key = (session_id, room_id, address, price)
        if key not in seen:
            seen.add(key)
            deduped.append(item)
    return deduped


def estimate_output_tokens(batch: list[dict[str, str]]) -> int:
    # Rough estimate: 1 token ~= 4 characters for JSON text.
    estimated_chars = 2  # [] wrapper
    for item in batch:
        estimated_chars += len(item["id"]) + len(item["raw_text"]) + 32
    return max(1, estimated_chars // 4)


def filter_district_files(file_names: list[str], districts: list[str]) -> list[str]:
    if not districts:
        return file_names

    wanted = {name.lower().replace(".json", "") for name in districts}
    return [name for name in file_names if name.lower().replace(".json", "") in wanted]


def archive_processed_sessions(district_file: str, session_ids: list[str]) -> None:
    if not session_ids:
        return

    bot_dir = os.path.dirname(os.path.abspath(__file__))
    target_dirs = [
        os.path.join(bot_dir, "districts_summary"),
        os.path.join(bot_dir, "districts_full"),
        os.path.join(bot_dir, "districts"),
        os.path.join(bot_dir, "districts_ok"),
    ]

    session_ids_set = set(str(sid).strip() for sid in session_ids)

    for directory in target_dirs:
        if not os.path.isdir(directory):
            continue

        files_to_check = []
        if os.path.basename(directory) == "districts":
            files_to_check.append(os.path.join(directory, district_file))
            files_to_check.append(os.path.join(directory, district_file.replace(".json", "1.json")))
        else:
            files_to_check.append(os.path.join(directory, district_file))

        for file_path in files_to_check:
            if not os.path.isfile(file_path):
                continue

            try:
                rows = load_json_array(file_path)
            except Exception as e:
                print(f"  [ARCHIVE] Error loading {file_path}: {e}")
                continue

            to_keep = []
            to_archive = []

            for row in rows:
                row_id = str(row.get("id", "")).strip()
                if row_id in session_ids_set:
                    to_archive.append(row)
                else:
                    to_keep.append(row)

            if to_archive:
                try:
                    save_json_array(file_path, to_keep)
                    print(f"  [ARCHIVE] Removed {len(to_archive)} sessions from {file_path}")
                except Exception as e:
                    print(f"  [ARCHIVE] Error saving kept records to {file_path}: {e}")
                    continue

                archive_dir = os.path.join(bot_dir, "processed", os.path.basename(directory))
                os.makedirs(archive_dir, exist_ok=True)
                archive_file_path = os.path.join(archive_dir, os.path.basename(file_path))

                try:
                    existing_archived = load_json_array(archive_file_path) if os.path.isfile(archive_file_path) else []
                    existing_ids = {str(item.get("id", "")).strip() for item in existing_archived if item.get("id")}
                    for item in to_archive:
                           item_id = str(item.get("id", "")).strip()
                           if item_id not in existing_ids:
                               existing_archived.append(item)
                               existing_ids.add(item_id)
                    save_json_array(archive_file_path, existing_archived)
                    print(f"  [ARCHIVE] Saved {len(to_archive)} sessions to archive: {archive_file_path}")
                except Exception as e:
                    print(f"  [ARCHIVE] Error saving archived records to {archive_file_path}: {e}")


def process_one_district(
    district_file: str,
    summary_dir: str | None,
    full_dir: str | None,
    ok_path: str,
    batch_size: int,
    sleep_seconds: float,
    max_retries: int,
) -> tuple[int, int]:
    summary_path = os.path.join(summary_dir, district_file) if summary_dir else None
    full_path = os.path.join(full_dir, district_file) if full_dir else None

    summary_rows = (
        normalize_input_rows(load_json_array(summary_path))
        if summary_path and os.path.isfile(summary_path)
        else []
    )
    full_rows = (
        normalize_input_rows(load_json_array(full_path))
        if full_path and os.path.isfile(full_path)
        else []
    )
    input_rows = merge_summary_full_rows(summary_rows, full_rows)
    total_input = len(input_rows)

    if total_input == 0:
        save_json_array(ok_path, [])
        return 0, 0

    print(
        f"Processing {district_file}: {total_input} sessions "
        f"(summary={len(summary_rows)}, full={len(full_rows)})."
    )

    # Build session lookup to retrieve photos, videos, original_text
    session_lookup = {}
    if summary_path and os.path.isfile(summary_path):
        for item in load_json_array(summary_path):
            if item.get("id"):
                session_lookup[str(item["id"])] = item
    if full_path and os.path.isfile(full_path):
        for item in load_json_array(full_path):
            if item.get("id"):
                session_lookup[str(item["id"])] = item

    district_name = os.path.basename(district_file).lower().replace(".json", "")
    rebuilt: list[dict[str, Any]] = []
    successfully_processed_ids = []

    for idx, item in enumerate(input_rows):
        session_id = item["id"]
        raw_text = item["raw_text"]  # text1 nếu có, else text2
        print(f"  [{idx + 1}/{total_input}] Processing session_id={session_id}...")

        parsed_rooms = process_single_item(session_id, raw_text, max_retries=max_retries)
        if parsed_rooms is not None:
            if parsed_rooms:
                rebuilt.extend(parsed_rooms)
                rebuilt = dedupe_by_id(rebuilt)
                successfully_processed_ids.append(session_id)

                # Build session_info: ưu tiên dùng text1/text2 từ input_rows (already split correctly)
                session_info = session_lookup.get(str(session_id), {})
                # Đảm bảo text1 và text2 được set đúng trong session_info
                merged_session_info = dict(session_info)
                if item.get("text1"):
                    merged_session_info["text1"] = item["text1"]
                if item.get("text2"):
                    merged_session_info["text2"] = item["text2"]

                for r in parsed_rooms:
                    save_room_to_sqlite(r, merged_session_info, district_name)
            else:
                print(f"  [AI] Succeeded with 0 rooms (not a valid listing or missing price/address) for session_id={session_id}")

            # Archive this successfully processed session immediately to prevent reprocessing
            archive_processed_sessions(district_file, [session_id])
        else:
            print(f"  [WARNING] Failed to extract rooms for session_id={session_id}")

        if sleep_seconds > 0:
            time.sleep(sleep_seconds)

    return total_input, len(rebuilt)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Rebuild districts_ok from available source folders "
            "(districts_summary / summary / sumary and/or districts_full / full). "
            "This script only reads source inputs and never deletes them."
        )
    )
    parser.add_argument("--summary-dir", help="Path to summary/sumary folder.")
    parser.add_argument("--full-dir", help="Path to full folder.")
    parser.add_argument("--ok-dir", help="Path to districts_ok output.")
    parser.add_argument(
        "--district",
        action="append",
        default=[],
        help="District name to process (can be repeated). Example: --district badinh --district caugiay",
    )
    parser.add_argument("--batch-size", type=int, default=30, help="Items per AI batch. Default: 30.")
    parser.add_argument("--sleep", type=float, default=1.0, help="Sleep seconds between batches. Default: 1.")
    parser.add_argument("--max-retries", type=int, default=5, help="Max retry attempts per batch. Default: 5.")
    parser.add_argument("--no-watch", action="store_true", help="Run once and exit instead of watching continuously.")
    parser.add_argument("--watch-interval", type=float, default=10.0, help="Interval (seconds) to scan for new rooms in watch mode. Default: 10.")
    args = parser.parse_args()

    if args.batch_size <= 0:
        raise ValueError("--batch-size must be > 0")
    if args.max_retries <= 0:
        raise ValueError("--max-retries must be > 0")

    if not API_LOCAL_ONLY and not API_TOKENS:
        raise RuntimeError("Missing API key. Set API_KEY or CLOUDFLARE_API_KEY.")

    summary_dir, full_dir = resolve_input_dirs(args.summary_dir, args.full_dir)
    source_dir = summary_dir or full_dir
    if source_dir is None:
        raise RuntimeError("Cannot resolve source directory.")

    # Initialize SQLite database
    init_db()

    ok_dir = resolve_ok_dir(args.ok_dir, source_dir)
    os.makedirs(ok_dir, exist_ok=True)

    watch_mode = not args.no_watch
    watch_interval = args.watch_interval

    print(f"Summary dir: {summary_dir or '<none>'}")
    print(f"Full dir   : {full_dir or '<none>'}")
    print(f"Output dir : {ok_dir}")
    mode_text = "rebuild local id+raw_text (no AI call)" if API_LOCAL_ONLY else "rebuild via AI"
    print(f"Mode       : {mode_text} (source inputs are read-only)")
    if watch_mode:
        print(f"Watch Mode : Active (scanning every {watch_interval}s)")
    else:
        print("Watch Mode : Disabled (running once)")

    while True:
        all_source_files_set: set[str] = set()
        if summary_dir:
            all_source_files_set.update(
                name for name in os.listdir(summary_dir) if name.lower().endswith(".json")
            )
        if full_dir:
            all_source_files_set.update(
                name for name in os.listdir(full_dir) if name.lower().endswith(".json")
            )

        all_source_files = sorted(all_source_files_set)
        selected_files = filter_district_files(all_source_files, args.district)

        if not selected_files:
            if not watch_mode:
                print("No district files matched.")
                return
            time.sleep(watch_interval)
            continue

        total_input = 0
        total_output = 0
        any_processed = False
        started_at = time.time()

        for file_name in selected_files:
            ok_path = os.path.join(ok_dir, file_name)

            summary_path = os.path.join(summary_dir, file_name) if summary_dir else None
            full_path = os.path.join(full_dir, file_name) if full_dir else None

            summary_rows = (
                normalize_input_rows(load_json_array(summary_path))
                if summary_path and os.path.isfile(summary_path)
                else []
            )
            full_rows = (
                normalize_input_rows(load_json_array(full_path))
                if full_path and os.path.isfile(full_path)
                else []
            )
            input_rows = merge_summary_full_rows(summary_rows, full_rows)

            if len(input_rows) == 0:
                if not watch_mode:
                    input_count, output_count = process_one_district(
                        district_file=file_name,
                        summary_dir=summary_dir,
                        full_dir=full_dir,
                        ok_path=ok_path,
                        batch_size=args.batch_size,
                        sleep_seconds=args.sleep,
                        max_retries=args.max_retries,
                    )
                    total_input += input_count
                    total_output += output_count
                continue

            any_processed = True
            input_count, output_count = process_one_district(
                district_file=file_name,
                summary_dir=summary_dir,
                full_dir=full_dir,
                ok_path=ok_path,
                batch_size=args.batch_size,
                sleep_seconds=args.sleep,
                max_retries=args.max_retries,
            )
            total_input += input_count
            total_output += output_count
            print(f"Finished {file_name}: input={input_count}, rebuilt_ok={output_count}")

        if any_processed:
            elapsed = time.time() - started_at
            print(
                f"Batch completed. total_input={total_input}, "
                f"total_rebuilt_ok={total_output}, elapsed={elapsed:.1f}s"
            )

        if not watch_mode:
            break

        time.sleep(watch_interval)


if __name__ == "__main__":
    main()

