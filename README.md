# Một tấm thiệp nhỏ

Thiệp sinh nhật tĩnh, có thể tùy chỉnh cho người bạn thương. Trang dùng HTML, CSS và JavaScript thuần, không tải thư viện hoặc script bên ngoài.

## Tùy chỉnh

Mở trang và chọn **Tùy chỉnh** để sửa tên người nhận, tên người gửi, lời chúc, màu thiệp và ảnh kỷ niệm. Nội dung được lưu trong trình duyệt hiện tại. Ảnh được thu nhỏ ngay trên thiết bị rồi lưu cục bộ; ảnh không được đưa vào liên kết chia sẻ.

Liên kết có thể nhận các tham số `to`, `from`, `message` và `theme`. Ví dụ:

```text
?to=Minh&from=An&message=Chuc%20mung%20sinh%20nhat&theme=mint
```

Các giá trị hợp lệ cho `theme`: `rose`, `citrus`, `mint`, `berry`. Nội dung từ URL được hiển thị dưới dạng văn bản.

## Chạy cục bộ

Trong thư mục dự án, chạy:

```sh
python3 -m http.server 8000
```

Sau đó mở `http://localhost:8000`.



