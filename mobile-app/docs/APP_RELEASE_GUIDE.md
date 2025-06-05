# Hướng dẫn phát hành ứng dụng Pickup Mobile

Tài liệu này cung cấp các bước chi tiết để xây dựng, phát hành và quản lý ứng dụng Android.

## Chuẩn bị chung

### 1. Cài đặt công cụ cần thiết

```bash
# Cài đặt Expo CLI và EAS CLI
npm install -g expo-cli eas-cli

# Đăng nhập vào tài khoản Expo
expo login
```

### 2. Cập nhật thông tin ứng dụng

Trong file `app.json` và `eas.json`, cập nhật các thông tin quan trọng:

- Version và versionCode
- Package name (Android)
- Các quyền cần thiết
- Thông tin tài khoản phát triển

## Phát hành ứng dụng Android

### 1. Tạo keystore cho Android

```bash
# Tạo keystore mới
eas credentials
```

Lưu ý: Hãy giữ an toàn thông tin keystore, nếu mất sẽ không thể cập nhật ứng dụng sau này.

### 2. Xây dựng APK

```bash
# Xây dựng file APK để phân phối trực tiếp
eas build -p android --profile preview
```

### 3. Phân phối qua Google Play (Tùy chọn)

```bash
# Xây dựng AAB cho Google Play Store
eas build -p android --profile production

# Gửi lên Google Play Store
eas submit -p android --latest
```

### 4. Cập nhật liên kết tải xuống

Sau khi xây dựng hoàn tất, bạn sẽ nhận được URL cho file APK. Cập nhật liên kết này trong trang tải xuống ứng dụng của trang web quản trị.

## Quy trình cập nhật ứng dụng

### 1. Cập nhật mã nguồn

- Thực hiện thay đổi cần thiết trong mã nguồn
- Kiểm tra kỹ lưỡng trên thiết bị thật

### 2. Cập nhật phiên bản

Trong `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

### 3. Xây dựng và phát hành

```bash
# Xây dựng cho Android
eas build -p android --profile androidApk
```

### 4. Cập nhật liên kết tải xuống

Sau khi bản build mới hoàn tất, cập nhật liên kết tải xuống trong trang web quản trị.

## Khắc phục sự cố

### Lỗi xây dựng EAS

```bash
# Kiểm tra trạng thái và log
eas build:list
```

### Lỗi keystore

```bash
# Quản lý keystore
eas credentials
```

### Lỗi cập nhật Android

Đảm bảo `versionCode` luôn tăng dần và không trùng lặp với bản cũ.

## Tài liệu tham khảo

- [Tài liệu Expo EAS](https://docs.expo.dev/eas/)
- [Hướng dẫn phát hành Google Play](https://developer.android.com/studio/publish)
