# Một tấm thiệp nhỏ

Thiệp sinh nhật tĩnh bằng HTML, CSS và JavaScript thuần, không tải thư viện hay script bên ngoài. Người nhận chỉ xem album, nghe nhạc, phóng to ảnh và chuyển slide.

## Album

`index.html` là hộp quà mặc định của GitHub Pages. Sau khi mở quà, `birthday.html` hiển thị 8 ảnh trong `albums/`; mỗi ảnh có một lời chúc tương ứng trong mảng `SLIDE_MESSAGES` ở `js/app.js`. Sửa các câu trong mảng đó để cá nhân hóa nội dung. Nút **Trước/Tiếp** và phím mũi tên trái/phải chuyển giữa ảnh; bấm ảnh để phóng to.

## Gửi thiệp

Gửi URL gốc của website để người nhận thấy hộp quà trước khi mở album. URL `gift.html` cũ được giữ như đường dẫn chuyển tiếp về trang gốc. Có thể đặt tên qua tham số `to` và `from`, ví dụ:

```text
?to=Minh&from=An
```

Ảnh trong `albums/` cần được commit và deploy cùng website để người nhận thấy được. Khi repo công khai, các ảnh này cũng công khai.

## Deploy GitHub Pages

Trong repository, vào **Settings → Pages → Build and deployment**, chọn **GitHub Actions** làm nguồn. Workflow `.github/workflows/deploy-pages.yml` sẽ deploy site khi có push lên `main`. Trang đầu là `index.html` (hộp quà); album nằm ở `birthday.html`.

## Chạy cục bộ

Trong terminal tại thư mục dự án, chạy lệnh sau để khởi động server và tự mở Chrome ở trang hộp quà:

```sh
python3 serve.py
```

Nhấn `Ctrl+C` để dừng server. Lệnh Python tích hợp vẫn dùng được nếu muốn tự mở trình duyệt:

```sh
python3 -m http.server 8000
```



