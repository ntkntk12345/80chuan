import requests
import json
import sys

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

API_KEY = "sk-lWIIAQLc58sZOoRUZIFjcG7kpgN9eYVMK9DUwQyL9qbTYhyR"
BASE_URL = "https://api.vietapi.tech/v1"

raw_text = """Dạng phòng: 1pn
Số 55 phố Trịnh Công Sơn, Tây Hồ, Hà Nội
Gần Học viện Hành chính Quốc gia • Cách khoảng 1.84 km
11.000 đ/tháng
Mô tả chi tiết
Copy thông tin phòng
1A Hh 12th Mã: A1030
6th

🏠 Địa chỉ: Số 55 phố Trịnh Công Sơn - Tây Hồ

⏰ Trống : P203,P303,P302

💰 Giá: 11tr - 12tr
👉Phòng : 1n1k ( Ban Công )
👉Thang máy"""

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
8. "type": Dạng phòng. Tag hợp lệ: "studio", "1pn", "2n1k", "2n1b", "duplex", "gác xép". Null nếu không có.
9. Không tự suy luận. Nếu thiếu địa chỉ hoặc thiếu giá, trả về mảng rỗng [].

Chỉ trả về JSON hợp lệ."""

payload = {
    "model": "gpt-5.5-high",
    "messages": [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": raw_text
        }
    ]
}

try:
    response = requests.post(
        f"{BASE_URL}/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json=payload,
        timeout=120
    )
    print("Status Code:", response.status_code)
    print("Response headers:", response.headers.get("Content-Type"))
    
    # Print the lines one by one to see reasoning_content vs content
    for line in response.iter_lines():
        if line:
            decoded = line.decode("utf-8", errors="replace").strip()
            if decoded.startswith("data:"):
                data_str = decoded[5:].strip()
                if data_str == "[DONE]":
                    print("[DONE]")
                    break
                try:
                    event = json.loads(data_str)
                    choices = event.get("choices") or []
                    if choices:
                        delta = choices[0].get("delta") or {}
                        # Print only if it has content or reasoning_content
                        if "content" in delta and delta["content"]:
                            print(f"CONTENT: {repr(delta['content'])}")
                        if "reasoning_content" in delta and delta["reasoning_content"]:
                            print(f"REASONING: {repr(delta['reasoning_content'])}")
                        if "reasoning" in delta and delta["reasoning"]:
                            print(f"REASONING2: {repr(delta['reasoning'])}")
                except Exception as e:
                    print(f"FAIL TO PARSE JSON: {e} -> Line: {decoded}")
except Exception as e:
    print("Error:", e)
