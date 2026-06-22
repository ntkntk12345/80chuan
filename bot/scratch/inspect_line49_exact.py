with open(r"c:\Users\Admin\Downloads\full\bot\scratch\step_143_content.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

for line in lines:
    if line.strip().startswith("49:"):
        print("Line 49 Content:", repr(line))
