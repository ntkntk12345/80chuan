with open(r"c:\Users\Admin\Downloads\full\bot\scratch\step_143_content.txt", "rb") as f:
    content = f.read()

# Search for the bytes of '235'
idx = content.find(b"235")
if idx != -1:
    # Print 50 bytes around it
    print(content[idx-10:idx+50])
else:
    print("Not found")
