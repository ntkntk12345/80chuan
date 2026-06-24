import sys
import os

# Adjust path to import bot modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from v3 import get_category_from_text2, _extract_price_bounds

def run_tests():
    print("=== STARTING bot/v3.py ROUTING TESTS ===")

    test_cases = [
        # format: (text2, expected_category)
        ("việt quốc 2 🏢Địa chỉ: Kim Giang...", "chung-cu"),
        ("vietquoc 3 🏠 Chung cư mini...", "chung-cu"),
        ("tc 1 🏠 Nhà riêng...", "nha-nguyen-can"),
        ("đăng bài hn 🏠 Nhà ngõ rộng...", "nha-nguyen-can"),
        ("1a ☘Giá : - MBKD1: 6tr5 (Mặt tiền)", "mat-bang-kinh-doanh"),
        ("tc 4 🏢 Cho thuê cửa hàng mặt phố...", "mat-bang-kinh-doanh"),
        ("tuananh chdv 1 🏠 Cho thuê căn hộ dịch vụ...", "can-ho-dich-vu"),
        ("dũng chdv 🚪 Phòng full đồ...", "can-ho-dich-vu"),
        
        # tai_land routing test (depends on price >= 25M)
        ("tài land 1 🏢 Cho thuê nhà mặt phố giá 30 triệu/tháng", "mat-bang-kinh-doanh"),
        ("tài land 2 🏠 Cho thuê nhà ngõ giá 15tr", "nha-nguyen-can"),
        
        # vietquoc_1 routing test (depends on mbkd keywords)
        ("việt quốc 1 🏢 Cho thuê mặt bằng kinh doanh nguyên căn...", "mat-bang-kinh-doanh"),
        ("việt quốc 1 🏠 Cho thuê nhà riêng ngõ rộng...", "nha-nguyen-can"),
        
        # Normal room fallback
        ("Địa chỉ: 123 Cầu Giấy...", "phong-tro")
    ]

    passed = 0
    for idx, (text, expected) in enumerate(test_cases):
        actual = get_category_from_text2(text)
        if actual == expected:
            print(f"[PASS] Case {idx + 1}: '{text[:30]}...' -> {actual}")
            passed += 1
        else:
            print(f"[FAIL] Case {idx + 1}: '{text[:30]}...' -> Expected: {expected}, Actual: {actual}")

    # Also test price bounds helper
    text_25m = "tài land 1 🏢 Cho thuê nhà mặt phố giá 30 triệu/tháng"
    price1, price2 = _extract_price_bounds(text_25m)
    if price2 == 30000000:
        print("[PASS] Price extraction bounds correctly parsed 30M")
    else:
        print(f"[FAIL] Price extraction bounds parsed: {price1} - {price2}")

    print(f"=== COMPLETED. Passed {passed}/{len(test_cases)} cases ===")
    assert passed == len(test_cases), "Not all test cases passed!"

if __name__ == "__main__":
    run_tests()
