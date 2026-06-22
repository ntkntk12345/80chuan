import zipfile
import os

bot_dir = r"c:\Users\Admin\Downloads\full\bot"
for file in os.listdir(bot_dir):
    if file.endswith(".zip"):
        zip_path = os.path.join(bot_dir, file)
        print(f"Zip file: {file}")
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                namelist = zip_ref.namelist()
                print(f"  Total files: {len(namelist)}")
                # Print first 10 files
                for name in namelist[:10]:
                    print(f"    - {name}")
                if "locations_db.json" in namelist or any("locations_db" in n for n in namelist):
                    print("  -> FOUND locations_db.json in this zip!")
        except Exception as e:
            print(f"  Error reading zip: {e}")
