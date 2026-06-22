import os
import json
import requests

API_KEY = os.getenv("NVIDIA_API_KEY", "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")

URL = "https://integrate.api.nvidia.com/v1/chat/completions"
MODEL = "moonshotai/kimi-k2.6"

SYSTEM_PROMPT = """Bạn là công cụ trích xuất JSON bất động sản. Chỉ trả về JSON hợp lệ, không markdown, không giải thích. Nhiệm vụ: Từ raw_text, trích xuất thông tin phòng trọ thành mảng JSON gồm ĐÚNG 1 OBJECT duy nhất đại diện cho toàn bộ tin đăng (hoặc căn nhà/tòa nhà đó), tuyệt đối tránh chia nhỏ thành nhiều phòng/trục khác nhau. Quy tắc bắt buộc: 1. Mỗi tin đăng chỉ trích xuất thành đúng 1 object duy nhất. 2. Object bắt buộc có: "id", "address", "price", "price1", "price2", "type". 3. "id": Lấy mã phòng hoặc mã trục (ví dụ: "Trục 01", "P301"). Nếu có nhiều mã phòng/mã trục trong tin đăng thì ghép chúng lại cách nhau bởi dấu gạch chéo hoặc dấu phẩy (ví dụ: "Trục 01/02/03", "P301/P303" hoặc "P301, P303"); nếu không có thì null. 4. "address": lấy địa chỉ ngắn gọn nhất trong raw_text. 5. "price": CHỈ chứa chuỗi khoảng giá từ thấp nhất đến cao nhất xuất hiện trong tin đăng, ví dụ "5.2-6.5tr", "4-6tr" hoặc "7.5tr". Không được chứa tên phòng, diện tích, mô tả hoặc text khác. 6. "price1": đổi giá thấp nhất trong tin đăng sang số dạng chuỗi chỉ gồm chữ số, ví dụ "5.2tr" => "5200000", "4tr" => "4000000". 7. "price2": đổi giá cao nhất trong tin đăng sang số dạng chuỗi chỉ gồm chữ số, ví dụ "6.5tr" => "6500000", "6tr" => "6000000". Nếu chỉ có 1 giá thì price2 = price1. 8. "type": chỉ thêm tag nếu từ khóa xuất hiện trực tiếp trong raw_text. Tag hợp lệ: "studio", "2n1k", "2n1b", "2 ngủ", "gác xép", "giường tầng", "vskk", "vsc". Nếu có nhiều dạng phòng thì có thể ghép hoặc lấy dạng chính, nếu không có thì null. 9. Không tự suy luận. 10. Nếu thiếu địa chỉ hoặc thiếu giá thì bỏ qua."""

messages = [
    {
        "role": "system",
        "content": SYSTEM_PROMPT
    }
]

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

while True:
    user = input("Bạn: ").strip()

    if user.lower() in ["exit", "quit", "q"]:
        break

    messages.append({
        "role": "user",
        "content": user
    })

    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": 16384,
        "temperature": 0,
        "top_p": 0.1,
        "stream": False
    }

    response = requests.post(URL, headers=headers, json=payload, timeout=300)

    if response.status_code != 200:
        print("Lỗi:", response.status_code)
        print(response.text)
        continue

    data = response.json()
    ai = data["choices"][0]["message"]["content"]

    print(f"\nAI: {ai}\n")

    messages.append({
        "role": "assistant",
        "content": ai
    })