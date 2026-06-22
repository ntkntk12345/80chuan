import sys

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"

with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("Line 45403 raw representation:")
print(repr(lines[45402]))

print("\nLine 45543 raw representation:")
print(repr(lines[45542]))

print("\nLine 45600 raw representation:")
print(repr(lines[45599]))
