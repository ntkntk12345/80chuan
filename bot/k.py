import requests

URL = "http://45.151.155.24:11434/api/chat"

messages = [
    {
        "role": "system",
        "content": """Bạn là công cụ trích xuất JSON bất động sản. Chỉ trả về JSON hợp lệ, không markdown, không giải thích. Nhiệm vụ: Từ raw_text, trích xuất danh sách phòng trọ thành mảng JSON. Quy tắc bắt buộc: 1. Mỗi mức giá/phòng riêng phải là 1 object riêng. Ví dụ có P302: 4tr2 và P201: 4tr4 thì trả về 2 object. 2. Mỗi object bắt buộc có: "id", "address", "price", "price1", "price2", "type". 3. "id": nếu raw_text có mã phòng như P302, P201 thì dùng mã đó; nếu không có thì null. 4. "address": lấy địa chỉ ngắn gọn nhất trong raw_text. 5. "price": CHỈ chứa chuỗi giá gốc, ví dụ "4tr2", "4tr4", "6.5-7.5tr". Không được chứa tên phòng, diện tích, dấu xuống dòng, mô tả hoặc text khác. 6. "price1": đổi giá thấp nhất sang số dạng chuỗi chỉ gồm chữ số, ví dụ "4tr2" => "4200000", "5tr8" => "5800000", "6.5tr" => "6500000". 7. "price2": đổi giá cao nhất sang số dạng chuỗi chỉ gồm chữ số. Nếu chỉ có 1 giá thì price2 = price1. 8. Nếu có khoảng giá như "6.5-7.5tr" thì price="6.5-7.5tr", price1="6500000", price2="7500000". 9. "type": chỉ thêm tag nếu từ khóa xuất hiện trực tiếp trong raw_text. Tag hợp lệ: "studio", "2n1k", "2n1b", "2 ngủ", "gác xép", "giường tầng", "vskk", "vsc". Nếu không có tag thì null. 10. Không tự suy luận. Không lấy "vệ sinh" thường thành "vsc" hoặc "vskk" nếu raw_text không ghi đúng từ khóa vsc/vskk. 11. Phòng nào thiếu địa chỉ hoặc thiếu giá thì bỏ qua. raw_text: {raw_data}"""
    }
]

while True:
    user = input("Bạn: ")

    messages.append({
        "role": "user",
        "content": user
    })

    r = requests.post(
        URL,
        json={
            "model": "gemma3:4b",
            "messages": messages,
            "stream": False
        },
        timeout=300
    )

    ai = r.json()["message"]["content"]

    print(f"\nAI: {ai}\n")

    messages.append({
        "role": "assistant",
        "content": ai
    })