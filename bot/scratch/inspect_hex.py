with open(r"c:\Users\Admin\Downloads\full\bot\scratch\step_143_content.txt", "rb") as f:
    content = f.read()

idx = content.find(b"235")
if idx != -1:
    chunk = content[idx:idx+80]
    print("Chunk length:", len(chunk))
    print("Hex representation:")
    print(" ".join(f"{b:02x}" for b in chunk))
    print("ASCII/UTF-8 representation:")
    print(chunk.decode('utf-8', errors='replace'))
else:
    print("Not found")
