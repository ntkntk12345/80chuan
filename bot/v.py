import os
import json
import requests
import time

from openai import OpenAI

client = OpenAI(
    api_key="sta_58aaafc6f877269a214d0c48c6fae2ef238d96ad0fa7d09c",
    base_url="https://api.freetheai.xyz/v1"
)
MODEL_NAME = "bbg/deepseek-ai/DeepSeek-V4-Flash"

PROMPT_TEMPLATE = """Bạn là một chuyên gia xử lý dữ liệu bất động sản. 
Dưới đây là danh sách các tin đăng phòng trọ ở dạng thô. 
Hãy trích xuất thông tin và chuyển về định dạng JSON chuẩn.

Yêu cầu:
1. Trả về một mảng JSON các đối tượng.
2. Mỗi đối tượng bắt buộc phải có các trường: "id", "address", "price", "price1", "price2", "type".
3. "address": Lấy địa chỉ ngắn gọn (ví dụ: "Số 9 ngõ 85 Đức Diễn, Bắc Từ Liêm").
4. "price": Giữ nguyên chuỗi giá gốc từ tin đăng (ví dụ: "5tr8" hoặc "6.5-7.5tr").
5. "price1": Chuyển giá thuê về dạng chuỗi số nguyên đầy đủ, TUYỆT ĐỐI KHÔNG có dấu chấm hay dấu phẩy (ví dụ: "5800000"). Nếu là khoảng giá hoặc có nhiều mức giá khác nhau, lấy mức thấp nhất.
6. "price2": Chuyển giá thuê về dạng chuỗi số nguyên đầy đủ, TUYỆT ĐỐI KHÔNG có dấu chấm hay dấu phẩy (ví dụ: "7500000"). Nếu là khoảng giá hoặc có nhiều mức giá khác nhau, lấy mức cao nhất. Nếu chỉ có 1 mức giá, price2 bằng price1.
7. "type": Cơ chế trích xuất cực kỳ nghiêm ngặt:
   - CHỈ được thêm tag nếu từ khóa hoặc đặc điểm đó XUẤT HIỆN TRỰC TIẾP trong "raw_text".
   - Tuyệt đối không tự suy luận loại phòng nếu tin đăng không nói rõ (ví dụ: không có "2n1k" thì không được cho vào).
   - Các loại: "studio", "2n1k" (2 ngủ 1 khách), "2n1b" (2 ngủ 1 bếp), "2 ngủ", "gác xép", "giường tầng".
   - Vệ sinh: "vskk", "vsc".
   - Trả về chuỗi tag cách nhau bởi dấu phẩy, ví dụ: "studio, vskk". 
   - Nếu không có bất kỳ từ khóa nào ở trên xuất hiện: null.
8. CHỈ TRẢ VỀ JSON trong cặp thẻ ```json ... ```, tuyệt đối không thêm văn bản giải thích trước hoặc sau đó.
9. Phòng nào không đầy đủ dữ liệu (vị trí, giá) thì bỏ qua.

Dữ liệu thô:
{raw_data}
"""

def call_ai(raw_data_str, max_retries=5, initial_delay=2):
    delay = initial_delay
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[{"role": "user", "content": PROMPT_TEMPLATE.format(raw_data=raw_data_str)}],
                max_tokens=2048
            )
            content = response.choices[0].message.content
            if content and content.strip():
                return content
            else:
                print(f"AI trả về nội dung rỗng. Đang chờ {delay}s để thử lại (Lần {attempt+1}/{max_retries})...")
                time.sleep(delay)
                delay *= 2
                continue
        except Exception as e:
            print(f"Ngoại lệ khi gọi AI: {e}. Thử lại sau {delay}s...")
            time.sleep(delay)
            delay *= 2
            continue
            
    print("Đã đạt số lần thử tối đa. Thất bại cho batch này.")
    return None

def clean_json(content):
    content = content.strip()
    
    # Find first [ and last ]
    start_arr = content.find("[")
    end_arr = content.rfind("]")
    
    # Find first { and last }
    start_obj = content.find("{")
    end_obj = content.rfind("}")
    
    # Determine which one is the outermost
    if start_arr != -1 and start_obj != -1:
        if start_arr < start_obj:
            return content[start_arr:end_arr+1].strip()
        else:
            return content[start_obj:end_obj+1].strip()
    elif start_arr != -1:
        return content[start_arr:end_arr+1].strip()
    elif start_obj != -1:
        return content[start_obj:end_obj+1].strip()
        
    return content.strip()

def process_file(file_path, district_name, base_dir):
    print(f"Processing {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        content = content.replace('\u2028', '\\n').replace('\u2029', '\\n')
        try:
            data = json.loads(content)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from {file_path}: {e}")
            return
    
    # 1. Lưu đúng all tt gốc vào full và summary
    summary_dir = os.path.join(base_dir, "districts_summary")
    full_dir = os.path.join(base_dir, "districts_full")
    os.makedirs(summary_dir, exist_ok=True)
    os.makedirs(full_dir, exist_ok=True)
    
    summary_file = os.path.join(summary_dir, f"{district_name}.json")
    full_file = os.path.join(full_dir, f"{district_name}.json")
    
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    with open(full_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Saved original data to {summary_file} and {full_file}")
    
    # Chuẩn bị dữ liệu gửi AI (chỉ cần id và raw_text)
    ai_input_data = []
    for item in data:
        if "id" in item and "raw_text" in item:
            ai_input_data.append({
                "id": item.get("id"),
                "raw_text": item.get("raw_text")
            })
    
    # 2. Post 5 phòng 1 lúc lên AI
    batch_size = 10
    for i in range(0, len(ai_input_data), batch_size):
        batch = ai_input_data[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1}/{(len(ai_input_data)-1)//batch_size + 1}...")
        
        # Format batch as JSON string
        raw_data_str = json.dumps(batch, ensure_ascii=False, indent=2)
        
        ai_output = call_ai(raw_data_str)
        if ai_output:
            cleaned_output = clean_json(ai_output)
            try:
                parsed_output = json.loads(cleaned_output)
                if isinstance(parsed_output, list):
                    print(f"  -> Thành công: trích xuất được {len(parsed_output)}/5 phòng")
                    
                    # Lưu luôn vào file ok
                    ok_dir = os.path.join(base_dir, "districts_ok")
                    os.makedirs(ok_dir, exist_ok=True)
                    ok_file = os.path.join(ok_dir, f"{district_name}.json")
                    
                    existing_data = []
                    if os.path.exists(ok_file):
                        with open(ok_file, 'r', encoding='utf-8') as f:
                            try:
                                existing_data = json.load(f)
                            except json.JSONDecodeError:
                                existing_data = []
                    
                    existing_data.extend(parsed_output)
                    
                    with open(ok_file, 'w', encoding='utf-8') as f:
                        json.dump(existing_data, f, ensure_ascii=False, indent=2)
                        
                else:
                    print(f"AI output is not a list: {cleaned_output}")
            except Exception as e:
                print(f"Failed to parse AI output: {e}")
                print(f"Raw output: {ai_output}")
        else:
            print(f"  -> Thất bại: AI không trả về nội dung (hoặc chuỗi rỗng).")
        
        time.sleep(1) # Rate limit

def main():
    # Giả định chạy từ thư mục chứa file script này
    base_dir = os.path.dirname(os.path.abspath(__file__))
    districts_dir = os.path.join(base_dir, "districts")
    
    if not os.path.exists(districts_dir):
        print(f"Districts directory not found at {districts_dir}")
        return
        
    for filename in os.listdir(districts_dir):
        if filename.endswith(".json") and not filename.endswith("1.json"): # Bỏ qua các file có số 1 (file lớn) để test hoặc chạy nhanh hơn?
            # Người dùng không nói bỏ qua file 1, nhưng các file 1 rất lớn.
            # Tôi sẽ xử lý tất cả các file .json
            pass
            
        if filename.endswith(".json"):
            file_path = os.path.join(districts_dir, filename)
            district_name = filename[:-5]
            process_file(file_path, district_name, base_dir)
            # break # Bỏ comment nếu muốn test 1 file trước

if __name__ == "__main__":
    main()
