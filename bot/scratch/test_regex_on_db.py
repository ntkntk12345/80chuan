import sqlite3
import re
import sys
import unicodedata

# Configure console to support Vietnamese Unicode print out on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def remove_accents(input_str):
    if not input_str:
        return ""
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    only_ascii = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    return only_ascii.replace('đ', 'd').replace('Đ', 'D')

def parse_price_string(price_str):
    if not price_str:
        return None
    s = price_str.lower().strip().replace(" ", "").replace(",", ".")
    s = remove_accents(s)
    s = s.replace(".tr", "tr").replace(".trieu", "trieu")
    
    # Match USD: e.g. "1500$", "$1500", "1500-1600$"
    if "$" in price_str or "usd" in s:
        s_usd = s.replace("$", "").replace("usd", "")
        m_usd_range = re.match(r"^(\d+)-(\d+)$", s_usd)
        if m_usd_range:
            p1 = float(m_usd_range.group(1)) * 25000
            p2 = float(m_usd_range.group(2)) * 25000
            return int(p1), int(p2)
        m_usd_single = re.match(r"^(\d+)$", s_usd)
        if m_usd_single:
            p = float(m_usd_single.group(1)) * 25000
            return int(p), int(p)

    # Match ranges: e.g. "5.2-6.5tr", "5.2-6.5tr/tháng"
    m_range = re.match(r"^(\d+(\.\d+)?)-(\d+(\.\d+)?)(tr|trieu|tr/thang|trieu/thang)$", s)
    if m_range:
        p1 = float(m_range.group(1)) * 1000000
        p2 = float(m_range.group(3)) * 1000000
        return int(p1), int(p2)

    # Match single value: e.g. "5.5tr", "11tr", "5tr"
    m_single = re.match(r"^(\d+(\.\d+)?)(tr|trieu|tr/thang|trieu/thang)$", s)
    if m_single:
        p = float(m_single.group(1)) * 1000000
        return int(p), int(p)

    # Match format like '7tr5'
    m_split = re.match(r"^(\d+)(tr|trieu)(\d+)$", s)
    if m_split:
        p = float(m_split.group(1)) * 1000000 + float(m_split.group(3)) * 100000
        return int(p), int(p)

    # Match format like '4500k'
    m_k = re.match(r"^(\d+)(k|ngan|k/thang)$", s)
    if m_k:
        p = float(m_k.group(1)) * 1000
        if p < 100000:
            return int(p), int(p)
        return int(p), int(p)

    # Match format like '4000-5000k'
    m_k_range = re.match(r"^(\d+)-(\d+)(k|ngan|k/thang)$", s)
    if m_k_range:
        p1 = float(m_k_range.group(1)) * 1000
        p2 = float(m_k_range.group(2)) * 1000
        return int(p1), int(p2)

    # Match format like '11.000' or '5.500' (abbreviated millions)
    m_dot_abbr = re.match(r"^(\d{1,2})\.(\d{3})(d|đ|d/thang|đ/thang)?$", s)
    if m_dot_abbr:
        p = (float(m_dot_abbr.group(1)) + float(m_dot_abbr.group(2)) / 1000.0) * 1000000
        return int(p), int(p)

    return None

def fix_price_value(val):
    try:
        num = int(val)
        if num <= 0:
            return num
        if num < 100:  # e.g. 11 or 5 -> scale to millions
            return num * 1000000
        if num < 1000:  # e.g. 500 -> scale to thousands
            return num * 1000
        if num < 10000:  # e.g. 4500 or 1500
            return num * 1000
        if num < 100000:  # e.g. 11000 or 45000
            if num < 30000:  # 11000 -> 11,000,000
                return num * 1000
            else:  # 45000 -> 4,500,000
                return num * 100
        return num
    except (ValueError, TypeError):
        return 0

db_path = r'c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute('SELECT id, price, price1, price2, address FROM rooms WHERE price1 > 0 AND price1 < 1000000 AND session_id NOT LIKE "manual_%"')
rows = cursor.fetchall()

print(f"Total rooms: {len(rows)}")
fallback_count = 0
for row in rows:
    rid, price_str, p1, p2, addr = row
    parsed = parse_price_string(price_str)
    if not parsed:
        fallback_count += 1
        fallback_p1 = fix_price_value(p1)
        fallback_p2 = fix_price_value(p2)
        print(f"ID {rid} | Price Str: '{price_str}' (P1={p1}, P2={p2}) -> FALLBACK: {fallback_p1} - {fallback_p2} | Address: {addr}")

print(f"Total fallback cases: {fallback_count}")
conn.close()
