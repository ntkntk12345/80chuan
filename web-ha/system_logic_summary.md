# Bảng Tóm Tắt Logic Hoạt Động & Kiến Trúc Hệ Thống 80Land

Tài liệu này hệ thống hóa toàn bộ cấu trúc mã nguồn, luồng dữ liệu, database và logic nghiệp vụ của dự án **80Land** dưới dạng sơ đồ và bảng logic trực quan, giúp lập trình viên nắm bắt dự án nhanh chóng mà không cần đọc hết mã nguồn.

---

## 1. Sơ Đồ Tổng Quan Kiến Trúc (Architecture Flow)

Sự tương tác giữa **Frontend (React/Vite)**, **LocalStorage (Đồng bộ tạm thời)** và **Backend (Node.js/Express + SQLite)**:

```mermaid
graph TD
    %% Khai báo các thành phần chính
    subgraph UI [Frontend - React UI]
        Router[App.jsx Router] -->|Render View| HomeView[HomeView.jsx]
        Router -->|Render View| ListingView[ListingView.jsx]
        Router -->|Render View| DetailView[DetailView.jsx]
        Router -->|Render View| AdminView[AdminDashboardView.jsx]
        Router -->|Render View| EarnHub[EarnHub / TikTok / Referral / Invite]
        Router -->|Render View| Wallet[WalletView.jsx]
        Router -->|Render View| Profile[ProfileView.jsx]
    end

    subgraph StateMgmt [Quản lý Trạng thái & Đồng bộ]
        LS[(LocalStorage)]
        SQLite[(SQLite DB - database.sqlite)]
    end

    subgraph API [Backend - Express API server.js]
        Routes[Express Routing]
        Recalc[recalculateUserStats Engine]
    end

    %% Tương tác dữ liệu
    Router <-->|Lưu trữ Session & Mock Rooms| LS
    Router <-->|HTTP Requests| Routes
    Routes <-->|Queries / Updates| SQLite
    Routes -->|Kích hoạt| Recalc
    Recalc <-->|Cập nhật Stats| SQLite
```

---

## 2. Bảng Phân Tích Cấu Trúc Các View (Màn Hình) & File Logic

| Tên File | Chức Năng Chính | Logic Nghiệp Vụ Quan Trọng | Dữ Liệu Tương Tác |
| :--- | :--- | :--- | :--- |
| [App.jsx](file:///c:/Users/Admin/Downloads/web-ha/src/App.jsx) | Router trung tâm & Quản lý trạng thái gốc | - Kiểm tra Responsive màn hình (`isMobile`).<br>- Khởi tạo dữ liệu mặc định vào LocalStorage nếu chưa có.<br>- Quản lý User Session (`currentUser`).<br>- Định tuyến qua State `currentPage`. | `LocalStorage` (currentUser, rooms_db, transactions_db) |
| [server.js](file:///c:/Users/Admin/Downloads/web-ha/server.js) | Backend API Server & Database SQLite | - Khởi tạo SQLite Tables (`users`, `referrals`, `transactions`).<br>- Chạy logic tự động tính lại số dư: `recalculateUserStats()`.<br>- Cung cấp các API RESTful cho frontend. | `database.sqlite` |
| [AuthModals.jsx](file:///c:/Users/Admin/Downloads/web-ha/src/components/AuthModals.jsx) | Đăng nhập & Đăng ký | - Bắt mã giới thiệu (`ref`) từ URL/LocalStorage khi đăng ký.<br>- Mã hóa ngẫu nhiên mã giới thiệu mới cho user dạng `A[xxxxx]`.<br>- Tự tạo bản ghi giới thiệu `referrals` với trạng thái `Chưa đủ điều kiện`. | API `/api/users`, `/api/referrals` |
| [HomeView.jsx](file:///c:/Users/Admin/Downloads/web-ha/src/views/HomeView.jsx) | Trang chủ tìm kiếm & Khám phá | - Hiển thị bộ lọc nhanh phòng trọ, chung cư.<br>- Chức năng lưu phòng nhanh (bookmark).<br>- Điều hướng nhanh đến các khu vực kiếm tiền/phòng nổi bật. | Trạng thái phòng từ App.jsx |
| [ListingView.jsx](file:///c:/Users/Admin/Downloads/web-ha/src/views/ListingView.jsx) | Danh sách phòng theo danh mục | - Lọc phòng theo danh mục: Phòng trọ, Chung cư, Nhà nguyên căn, CHDV, Mặt bằng, Pass phòng, Ở ghép.<br>- Bộ lọc nâng cao: giá cả, khu vực, diện tích. | Trạng thái phòng từ App.jsx |
| [DetailView.jsx](file:///c:/Users/Admin/Downloads/web-ha/src/views/DetailView.jsx) | Chi tiết phòng đăng | - Xem hình ảnh, mô tả chi tiết phòng.<br>- Nút liên hệ nhanh qua Zalo chủ nhà/quản trị viên. | Thông tin phòng cụ thể |
| [WalletView.jsx](file:///c:/Users/Admin/Downloads/web-ha/src/views/WalletView.jsx) | Ví tiền & Lịch sử giao dịch | - Hiển thị số dư khả dụng, tổng thu nhập, hoa hồng chờ duyệt.<br>- Tạo lệnh rút tiền gửi lên hệ thống.<br>- Nút đồng bộ nhanh hoa hồng giới thiệu từ trang Referral. | API `/api/transactions`, `/api/sync-referrals` |
| [FriendInviteView.jsx](file:///c:/Users/Admin/Downloads/web-ha/src/views/FriendInviteView.jsx) | Trang mời bạn bè (Affiliate) | - Tạo link mời có chứa mã ref cá nhân.<br>- Hiển thị danh sách bạn bè đã mời và trạng thái hoa hồng (300.000đ/ref thành công). | API `/api/referrals` |
| [AdminDashboardView.jsx](file:///c:/Users/Admin/Downloads/web-ha/src/views/AdminDashboardView.jsx) | Trang quản trị của Admin | - Quản lý phòng (Thêm/Sửa/Xóa).<br>- Xem danh sách thành viên, số điện thoại, số dư ví.<br>- Import/Export dữ liệu batch cho Referrals và Transactions.<br>- Công cụ xóa trắng dữ liệu hoặc kích hoạt tính toán lại toàn bộ ví. | Toàn bộ API `/api/*` |

---

## 3. Bản Đồ Dữ Liệu Database (SQLite Schema)

Hệ thống quản lý dữ liệu thông qua 3 bảng chính trong SQLite:

### Bảng 1: `users` (Thông tin người dùng)
*   **`phone`** (TEXT PRIMARY KEY): Số điện thoại dùng làm tài khoản định danh.
*   **`password`** (TEXT): Mật khẩu đăng nhập.
*   **`name`** (TEXT): Họ tên hiển thị.
*   **`referralCode`** (TEXT UNIQUE): Mã giới thiệu riêng của user (ví dụ: `A12345`).
*   **`avatar`** (TEXT): Link ảnh đại diện.
*   **`role`** (TEXT): Quyền hạn (`admin` hoặc `user`).
*   **`walletBalance`** (INTEGER): Số dư ví khả dụng hiện tại.
*   **`totalEarned`** (INTEGER): Tổng số tiền đã kiếm được từ trước tới nay.
*   **`pendingCommissions`** (INTEGER): Hoa hồng đang chờ xử lý/duyệt.
*   **`totalReferrals`** (INTEGER): Tổng số người đã mời.
*   **`activeReferrals`** (INTEGER): Số người đã mời đang hoạt động/đã kiếm được tiền.

### Bảng 2: `referrals` (Danh sách giới thiệu)
*   **`id`** (INTEGER PRIMARY KEY AUTOINCREMENT)
*   **`referralCode`** (TEXT): Mã giới thiệu được áp dụng.
*   **`name`** (TEXT): Tên của người được giới thiệu.
*   **`phone`** (TEXT): Số điện thoại người được giới thiệu.
*   **`date`** (TEXT): Thời gian đăng ký.
*   **`status`** (TEXT): Trạng thái (`Chưa đủ điều kiện`, `Đã kiếm được tiền`, v.v.).
*   **`commission`** (INTEGER): Số tiền hoa hồng được nhận (mặc định là 300.000đ khi hoàn thành).

### Bảng 3: `transactions` (Lịch sử giao dịch tiền tệ)
*   **`id`** (INTEGER PRIMARY KEY AUTOINCREMENT)
*   **`phone`** (TEXT): Số điện thoại thực hiện giao dịch.
*   **`date`** (TEXT): Thời gian giao dịch.
*   **`type`** (TEXT): Loại giao dịch (`Rút tiền`, `Hoa hồng giới thiệu`, `Hoa hồng khách thuê`, `Hoa hồng TikTok`, v.v.).
*   **`amount`** (TEXT): Số tiền (Định dạng chuỗi chứa dấu âm/dương, ví dụ: `-500.000đ`, `+300.000đ`).
*   **`status`** (TEXT): Trạng thái giao dịch (`Thành công`, `Đang xử lý`, `Thất bại`).

---

## 4. Các Luồng Logic Nghiệp Vụ Cốt Lõi (Core System Flow)

### Luồng A: Đăng Ký và Ghi Nhận Mã Giới Thiệu (Referral Tracking)

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Khách vãng lai
    participant Web as Trình duyệt (Web)
    participant API as server.js (API)
    participant DB as SQLite DB

    Note over Guest, Web: Khách truy cập qua link giới thiệu:<br>80land.vn/?ref=A12345
    Web->>Web: Lưu ref code vào LocalStorage ('pending_referral_code')
    Guest->>Web: Mở Modal Đăng ký
    Web->>Web: Tự động điền 'A12345' vào ô Mã giới thiệu
    Guest->>Web: Nhập thông tin & ấn Đăng Ký
    Web->>API: POST /api/users/{regPhone} (Kiểm tra xem số điện thoại đã tồn tại chưa)
    API->>DB: SELECT * FROM users WHERE phone = regPhone
    DB-->>API: Trả về kết quả
    alt SĐT chưa tồn tại
        Web->>API: POST /api/referrals (Tạo bản ghi giới thiệu tạm thời)
        API->>DB: INSERT INTO referrals (status = 'Chưa đủ điều kiện', commission = 0)
        Web->>API: POST /api/users (Tạo tài khoản mới cho Guest)
        API->>DB: INSERT INTO users (role = 'user', referralCode = 'Axxxxx')
        API->>API: recalculateUserStats(người giới thiệu)
        API-->>Web: Trả về thông tin User mới & Đăng nhập tự động
    else SĐT đã tồn tại
        API-->>Web: Báo lỗi "Số điện thoại đã được đăng ký"
    end
```

---

### Luồng B: Tính Toán Số Dư & Đồng Bộ Ví (Wallet Balance Calculation Engine)

Mỗi khi có một giao dịch mới phát sinh hoặc khi admin yêu cầu đồng bộ, hàm **`recalculateUserStats(phone)`** trong `server.js` sẽ chạy theo cơ chế sau:

1.  **Đọc toàn bộ lịch sử giao dịch:**
    Lấy danh sách các giao dịch thuộc số điện thoại đó: `SELECT * FROM transactions WHERE phone = ?`
2.  **Chuẩn hóa số tiền chuỗi sang số thực:**
    Chuyển đổi các chuỗi dạng `+1.120.000đ` hay `-500.000đ` thành số thực `1120000` và `-500000`.
3.  **Cộng trừ dòng tiền:**
    *   `totalEarned` = Tổng các khoản tiền nhận vào (số dương).
    *   `totalWithdrawn` = Tổng các khoản tiền đã rút ra (trị tuyệt đối của các số âm).
    *   `walletBalance` = `totalEarned` - `totalWithdrawn` (Không nhỏ hơn 0).
4.  **Cập nhật thống kê giới thiệu:**
    *   Đếm tổng số giới thiệu: `SELECT COUNT(*)` từ bảng `referrals` có mã giới thiệu của user.
    *   Đếm số giới thiệu hoạt động: Lọc các bản ghi có trạng thái `Đã kiếm được tiền`.
5.  **Ghi đè lại bảng `users`:**
    Chạy lệnh `UPDATE users` lưu lại các chỉ số mới tính toán vào cơ sở dữ liệu.

---

### Luồng C: Đồng Bộ Hoa Hồng Giới Thiệu (Referral to Transaction Sync)

Để đảm bảo người giới thiệu nhận được tiền khi bạn bè hoàn thành điều kiện, hệ thống có API `/api/sync-referrals`:

```mermaid
graph TD
    A[Bắt đầu Sync Hoa Hồng] --> B[Lấy danh sách Referrals & Transactions]
    B --> C{Duyệt từng bản ghi Referral}
    C -->|Trạng thái 'Đã kiếm được tiền'| D{Giao dịch hoa hồng tương ứng đã tồn tại?}
    C -->|Trạng thái khác| H[Bỏ qua]
    D -->|Chưa tồn tại| E[Tạo giao dịch 'Hoa hồng giới thiệu' +300.000đ]
    D -->|Đã tồn tại| F[Bỏ qua]
    E --> G[Đánh dấu có thay đổi]
    F --> I{Còn bản ghi tiếp theo?}
    G --> I
    H --> I
    I -->|Còn| C
    I -->|Hết| K{Có thay đổi phát sinh?}
    K -->|Có| L[Tính lại stats ví của tất cả user]
    K -->|Không| M[Kết thúc sync]
    L --> M
```

---

> [!TIP]
> **Tài khoản test nhanh:**
> - Tài khoản **Admin**: Đăng nhập bằng `admin` / mật khẩu `admin`.
> - Tài khoản **User test**: Đăng nhập bằng `user` / mật khẩu `user`.
> 
> Hệ thống sử dụng cơ chế lưu trữ kết hợp: ghi nhận tức thời dữ liệu UI vào `LocalStorage` để đảm bảo tốc độ phản hồi mượt mà ở phía client, song song gửi các yêu cầu đồng bộ bền vững về `database.sqlite` ở phía backend.
