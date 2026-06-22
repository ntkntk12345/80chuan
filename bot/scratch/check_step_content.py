import sys

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

with open(r"c:\Users\Admin\Downloads\full\bot\scratch\step_143_content.txt", "r", encoding="utf-8") as f:
    text = f.read()
    print("Content preview:")
    print(text[:1000])
    print("...")
    print("Content end:")
    print(text[-1000:])
