# Pickup - Hệ thống quản lý bán hàng

Hệ thống quản lý bán hàng toàn diện với giao diện web và ứng dụng di động. Sử dụng React, TypeScript, và Vite cho phiên bản web, kết hợp với ứng dụng di động Android dựa trên React Native và Expo.

## Thành phần hệ thống

- **Web Admin Dashboard**: Quản lý menu, đơn hàng, hóa đơn, và báo cáo
- **Mobile App**: Ứng dụng Android dành cho nhân viên

## Hướng dẫn phát triển web

### Cài đặt

```bash
# Cài đặt dependencies
npm install

# Khởi động server phát triển
npm run dev

# Build cho production
npm run build
```

### Công nghệ sử dụng

- **Frontend**: React 18.2.0, TypeScript 5.8.3
- **UI Framework**: Ant Design 5.13.0
- **Build Tool**: Vite 6.3.5
- **State Management**: Zustand 4.5.2
- **Data Fetching**: React Query 5.80.3
- **Routing**: React Router 7.5.3

## Hướng dẫn ứng dụng di động

### Cài đặt môi trường

```bash
# Vào thư mục mobile-app
cd mobile-app

# Cài đặt dependencies
npm install

# Cài đặt Expo CLI
npm install -g expo-cli

# Cài đặt EAS CLI (cho việc build)
npm install -g eas-cli
```

### Phát triển

```bash
# Khởi động server phát triển
npm start
# hoặc
expo start
```

### Xây dựng APK Android

```bash
# Đăng nhập vào Expo
eas login

# Xây dựng APK (phương pháp mới, thay thế expo build:android)
eas build -p android --profile preview
```

> **Lưu ý**: Lệnh `expo build:android` đã bị ngừng hỗ trợ từ ngày 4/1/2023. Nếu gặp lỗi "Request failed with status code 404", hãy sử dụng lệnh EAS Build mới như trên.

### Tài liệu cho mobile app

- Chi tiết hướng dẫn xây dựng APK: `/mobile-app/BUILD_INSTRUCTIONS.md`
- Hướng dẫn phát triển Android: `/mobile-app/docs/ANDROID_ONLY_GUIDE.md`
- Quy trình phát hành ứng dụng: `/mobile-app/docs/APP_RELEASE_GUIDE.md`

## Tính năng chính

- Quản lý menu và danh mục sản phẩm
- Tạo và theo dõi đơn hàng
- Quản lý nguyên liệu và công thức
- Báo cáo doanh thu và phân tích dữ liệu
- Thanh toán QR code
- Quản lý khuyến mãi và chiết khấu

## Trang tải ứng dụng

Truy cập đường dẫn `/app-download` để tải ứng dụng di động mới nhất cho Android.
