# Pickup Mobile App
# Pickup Mobile App

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Cài đặt Expo CLI (nếu chưa có)
npm install -g expo-cli

# Cài đặt EAS CLI (cho việc build)
npm install -g eas-cli
```

## Phát triển

```bash
# Khởi động server phát triển
npm start
# hoặc
expo start
```

## Xây dựng APK

### Lỗi với lệnh cũ

Lệnh `expo build:android -t apk` đã bị ngừng hỗ trợ từ ngày 4/1/2023. Nếu bạn gặp lỗi như sau:

```
expo build:android has been discontinued (January 4, 2023).
Request failed with status code 404
```

Hãy sử dụng hệ thống EAS Build mới.

### Cách build APK với EAS

```bash
# Đăng nhập vào Expo
eas login

# Khởi tạo cấu hình EAS (nếu chưa có)
eas build:configure

# Xây dựng APK
eas build -p android --profile preview
```

Xem thêm hướng dẫn chi tiết trong file `BUILD_INSTRUCTIONS.md`.

## Cập nhật ứng dụng

Có hai cách để cập nhật ứng dụng:

1. **Tạo build mới**: Tạo APK mới và phân phối lại
2. **Sử dụng EAS Update**: Cập nhật ứng dụng mà không cần build mới

Xem hướng dẫn chi tiết trong thư mục `docs/`.

## Tài liệu

- `BUILD_INSTRUCTIONS.md`: Hướng dẫn chi tiết về việc xây dựng APK
- `docs/ANDROID_ONLY_GUIDE.md`: Hướng dẫn phát triển Android
- `docs/APP_RELEASE_GUIDE.md`: Quy trình phát hành ứng dụng
Ứng dụng di động Pickup dành cho nhân viên, cho phép bán hàng và quản lý hóa đơn từ bất cứ đâu.

## Tính năng

- **Đăng nhập**: Xác thực người dùng với tài khoản Firebase
- **Bán hàng**: Xem menu, thêm món vào giỏ hàng và thanh toán
- **Quản lý hóa đơn**: Xem danh sách và chi tiết hóa đơn
- **Làm việc ngoại tuyến**: Lưu cache dữ liệu để giảm thiểu băng thông

## Cài đặt

1. Cài đặt các công cụ cần thiết:
   ```bash
   npm install -g expo-cli
   ```

2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```

3. Cập nhật thông tin Firebase trong `firebase/config.js`

4. Chạy ứng dụng trên máy ảo hoặc thiết bị thật:
   ```bash
   npm start
   ```

## Tạo file APK

1. Tạo tài khoản Expo và đăng nhập:
   ```bash
   expo login
   ```

2. Xây dựng ứng dụng Android:
   ```bash
   expo build:android -t apk
   ```

3. Tải về file APK từ liên kết được cung cấp sau khi quá trình xây dựng hoàn tất

## Cấu trúc thư mục

- `/screens`: Các màn hình ứng dụng
- `/contexts`: Context API cho quản lý trạng thái
- `/firebase`: Cấu hình kết nối Firebase
- `/assets`: Hình ảnh và tài nguyên

## Yêu cầu hệ thống

- Node.js 14+
- Expo CLI
- Tài khoản Firebase với Firestore và Authentication
