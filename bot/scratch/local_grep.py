import os
import re
import sys

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def local_grep(pattern, filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f, 1):
            if re.search(pattern, line):
                print(f"{idx}: {line.strip()}")

local_grep(r'lock', 'listener.py')
