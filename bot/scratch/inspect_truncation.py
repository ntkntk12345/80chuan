import sys

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

input_path = r"c:\Users\Admin\Downloads\full\bot\scratch\step_143_content.txt"

with open(input_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Let's print around the truncation marker
trunc_idx = text.find("truncated")
if trunc_idx != -1:
    print("Truncation marker found!")
    print("Before:")
    print(text[trunc_idx-300:trunc_idx])
    print("After:")
    print(text[trunc_idx:trunc_idx+300])
else:
    print("No truncation marker found in text.")
