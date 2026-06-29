import os
import sqlite3
import sys

# Add current folder to path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)

from v3 import get_category_from_text2, get_message_symbol
from map1 import determine_category

DATABASE_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, '..', 'web-ha', 'database.sqlite'))

def main():
    print(f"Connecting to database: {DATABASE_PATH}")
    if not os.path.exists(DATABASE_PATH):
        print("Database file not found!")
        return

    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT id, text1, text2, category, address FROM rooms")
    rooms = cursor.fetchall()
    print(f"Total rooms in DB: {len(rooms)}")

    updated_count = 0
    stats = {}

    for room_id, text1, text2, old_category, address in rooms:
        text1 = text1 or ""
        text2 = text2 or ""
        old_category = old_category or ""

        # Determine target category using v3 symbols first, then map1 fallback
        symbol = get_message_symbol(text2)
        new_category = get_category_from_text2(text2, text1)
        if not symbol:
            if new_category == "phong-tro":
                new_category = determine_category(text2)

        if new_category != old_category:
            cursor.execute("UPDATE rooms SET category = ? WHERE id = ?", (new_category, room_id))
            updated_count += 1
            pair = f"{old_category} -> {new_category}"
            stats[pair] = stats.get(pair, 0) + 1
            print(f"Room ID {room_id} (Address: {address}): {pair}")

    if updated_count > 0:
        conn.commit()
        print(f"\nSuccessfully updated {updated_count} rooms!")
        print("Transformation stats:")
        for pair, count in stats.items():
            print(f"  {pair}: {count}")
    else:
        print("\nNo rooms needed recategorization.")

    conn.close()

if __name__ == '__main__':
    main()
