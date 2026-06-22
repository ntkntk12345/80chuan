import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("search_486_results.txt", "r", encoding="utf-8") as f:
    text = f.read()

urls = re.findall(r'https?://[^\s\'"]+', text)
unique_urls = sorted(list(set(urls)))

with open("full_urls_extracted.txt", "w", encoding="utf-8") as out:
    out.write(f"Found {len(unique_urls)} unique URLs:\n")
    for url in unique_urls:
        out.write(url + "\n")
