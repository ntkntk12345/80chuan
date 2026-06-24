import sqlite3
import re
import os
import sys
import unicodedata

# Symbols definitions
chung_cu_symbols = ["việt quốc 2", "vietquoc 2", "việt quốc 3", "vietquoc 3", "tc 2", "tc2", "vinsmartcity"]
nguyen_can_symbols = ["tc 1", "tc1", "tc 3", "tc3", "đăng bài hn", "dang bai hn", "đại lộc land 1", "dai loc land 1"]
mbkd_symbols = ["1a", "tc 4", "tc4", "đại lộc land 2", "dai loc land 2"]
chdv_symbols = ["tuananh chdv 1", "chdv chọn lọc", "chdv chon loc", "dũng chdv", "dung chdv", "tuananh chdv 2", "n34 chdv", "chinh trần chdv", "chinh tran chdv"]
tai_land_symbols = ["tài land 1", "tai land 1", "tài land 2", "tai land 2"]
vietquoc_1_symbols = ["việt quốc 1", "vietquoc 1"]

def _extract_price_tokens(value: str) -> list[str]:
    normalized = unicodedata.normalize("NFD", str(value or ""))
    normalized = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    normalized = normalized.lower().replace("trieu", "tr")
    normalized = re.sub(r"[^a-z0-9.,]+", "", normalized)
    return re.findall(r"\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?(?:tr\d+|tr|k|ty\d+|ty)", normalized)

def _parse_price_token_to_vnd(value: str) -> int:
    raw = str(value or "").strip().lower().replace(" ", "")
    if not raw:
        return 0
    if re.fullmatch(r"\d{1,3}(?:[.,]\d{3})+", raw):
        digits = re.sub(r"[^\d]", "", raw)
        try:
            return int(digits)
        except Exception:
            return 0
    normalized = raw.replace(",", ".")
    if "ty" in normalized:
        major, _, minor = normalized.partition("ty")
        try:
            base = float(major or "0")
            fraction = float(f"0.{re.sub(r'[^\\d]', '', minor)}") if re.search(r"\d", minor) else 0.0
            return int(round((base + fraction) * 1_000_000_000))
        except Exception:
            return 0
    if "tr" in normalized:
        major, _, minor = normalized.partition("tr")
        try:
            base = float(major or "0")
            if not re.search(r"\d", minor):
                return int(round(base * 1_000_000))
            digits = re.sub(r"[^\d]", "", minor)
            decimal_places = len(digits)
            fraction = int(digits) / (10 ** decimal_places) if decimal_places > 0 else 0
            return int(round((base + fraction) * 1_000_000))
        except Exception:
            return 0
    if normalized.endswith("k"):
        try:
            return int(round(float(normalized[:-1] or "0") * 1_000))
        except Exception:
            return 0
    try:
        numeric = float(normalized)
    except Exception:
        return 0
    if numeric <= 0:
        return 0
    if numeric < 1000:
        return int(round(numeric * 1_000_000))
    return int(round(numeric))

def _extract_price_bounds(text: str) -> tuple[int, int]:
    candidates = []
    for token in _extract_price_tokens(text):
        value = _parse_price_token_to_vnd(token)
        if value > 0:
            candidates.append(value)
    if not candidates:
        return 0, 0
    return min(candidates), max(candidates)

def get_message_symbol(text2: str) -> str | None:
    if not text2:
        return None
    text2_lower = text2.strip().lower()
    all_symbols = (
        chung_cu_symbols +
        nguyen_can_symbols +
        mbkd_symbols +
        chdv_symbols +
        tai_land_symbols +
        vietquoc_1_symbols
    )
    all_symbols = sorted(all_symbols, key=len, reverse=True)
    for sym in all_symbols:
        sym_lower = sym.lower()
        if text2_lower.startswith(sym_lower):
            sym_len = len(sym_lower)
            if len(text2_lower) > sym_len:
                next_char = text2_lower[sym_len]
                if next_char.isalnum():
                    continue
            return sym_lower
    return None

def get_category_from_text2(text2: str, text1: str = "") -> str:
    symbol = get_message_symbol(text2)
    if not symbol:
        return "phong-tro"
    if symbol in chung_cu_symbols:
        return "chung-cu"
    elif symbol in nguyen_can_symbols:
        return "nha-nguyen-can"
    elif symbol in mbkd_symbols:
        return "mat-bang-kinh-doanh"
    elif symbol in chdv_symbols:
        return "can-ho-dich-vu"
    elif symbol in tai_land_symbols:
        full_text = text1 if text1 else text2
        price1, price2 = _extract_price_bounds(full_text)
        price_val = max(price1, price2)
        if price_val >= 25000000:
            return "mat-bang-kinh-doanh"
        else:
            return "nha-nguyen-can"
    elif symbol in vietquoc_1_symbols:
        text2_lower = text2.lower()
        if any(k in text2_lower for k in ["mbkd", "mặt bằng", "văn phòng"]):
            return "mat-bang-kinh-doanh"
        else:
            return "nha-nguyen-can"
    return "phong-tro"

def extract_area_from_text(text: str) -> str | None:
    if not text:
        return None
    match = re.search(r'(?:diện\s+tích|dt)\s*(?:mặt\s+bằng)?\s*(?::|-)?\s*(\d+(?:-\d+)?\s*(?:m2|m²))', text, re.IGNORECASE)
    if match:
        return match.group(1).replace(" ", "").lower()
    match2 = re.search(r'(\d+(?:-\d+)?\s*(?:m2|m²))', text, re.IGNORECASE)
    if match2:
        return match2.group(1).replace(" ", "").lower()
    return None

def migrate():
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'web-ha', 'database.sqlite'))
    print(f"Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT id, text2, text1, category, room_type FROM rooms")
    rooms = cursor.fetchall()
    print(f"Found {len(rooms)} total rooms in database.")

    updated_count = 0
    area_updated_count = 0

    for r_id, text2, text1, old_cat, old_type in rooms:
        t2 = text2 or ""
        t1 = text1 or ""
        
        # Resolve category
        new_cat = get_category_from_text2(t2, t1)
        
        # For mat-bang-kinh-doanh, extract area size to save to room_type
        new_type = old_type
        if new_cat == "mat-bang-kinh-doanh":
            extracted_area = extract_area_from_text(t1 or t2)
            if extracted_area:
                new_type = extracted_area
        
        # Check if we need to update database
        if new_cat != old_cat or new_type != old_type:
            cursor.execute("UPDATE rooms SET category = ?, room_type = ? WHERE id = ?", (new_cat, new_type, r_id))
            updated_count += 1
            if new_type != old_type:
                area_updated_count += 1

    conn.commit()
    print(f"Migration completed. Updated {updated_count} rooms (including {area_updated_count} area size updates).")
    
    # Print the new summary count
    cursor.execute("SELECT category, count(*) FROM rooms GROUP BY category;")
    print("New Category Summary:")
    for cat, cnt in cursor.fetchall():
        print(f" - {cat}: {cnt}")
        
    conn.close()

if __name__ == '__main__':
    migrate()
