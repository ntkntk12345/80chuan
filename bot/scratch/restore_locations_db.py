import re
import json

input_path = r"c:\Users\Admin\Downloads\full\bot\scratch\step_143_content.txt"
output_path = r"c:\Users\Admin\Downloads\full\bot\distance_app\locations_db.json"

with open(input_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

clean_lines = []
collecting = False
for line in lines:
    # Look for line number prefix like "1: [" or "142: ]"
    match = re.match(r'^\s*(\d+):\s*(.*)$', line)
    if match:
        line_num = int(match.group(1))
        content = match.group(2)
        clean_lines.append(content)

# Join the lines and check if it parses as valid JSON
json_str = "\n".join(clean_lines)
try:
    data = json.loads(json_str)
    print(f"Successfully parsed original landmarks JSON with {len(data)} landmarks.")
    
    # Save the cleaned JSON back to locations_db.json
    with open(output_path, 'w', encoding='utf-8') as out_f:
        json.dump(data, out_f, ensure_ascii=False, indent=2)
    print(f"Restored locations_db.json at {output_path}")
except Exception as e:
    print(f"Error parsing JSON: {e}")
    # Print the clean lines to see what went wrong
    for idx, cl in enumerate(clean_lines[:15]):
        print(f"{idx+1}: {cl}")
