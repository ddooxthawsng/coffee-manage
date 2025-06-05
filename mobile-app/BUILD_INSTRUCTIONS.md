# Hướng dẫn xây dựng ứng dụng Android

## Vấn đề với lệnh cũ

Lệnh `expo build:android` đã bị ngừng hỗ trợ từ ngày 4 tháng 1 năm 2023. Hiện tại, Expo sử dụng hệ thống EAS (Expo Application Services) để xây dựng ứng dụng.

## Cài đặt môi trường

1. **Cài đặt EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Đăng nhập vào Expo**:
   ```bash
   eas login
   ```

3. **Khởi tạo cấu hình EAS** (nếu chưa có):
   ```bash
   eas build:configure
   ```

## Cấu hình EAS.json

File `eas.json` đã được cấu hình sẵn cho việc build APK:

```json
{
  "cli": {
    "version": ">= 0.52.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Xây dựng APK

### Sử dụng EAS Build

Để xây dựng file APK, chạy lệnh sau trong thư mục dự án:

```bash
eas build -p android --profile preview
```

Lệnh này sẽ:
1. Tạo một build với cấu hình từ profile "preview" trong eas.json
2. Sử dụng `buildType`: "apk" để tạo file APK (thay vì AAB)
3. Xử lý quá trình build trên máy chủ của Expo

### Theo dõi tiến trình

Sau khi chạy lệnh build, bạn sẽ nhận được URL để theo dõi tiến trình:

```
🔎 Build details: https://expo.dev/accounts/YOUR_ACCOUNT/projects/YOUR_PROJECT/builds/SOME_BUILD_ID
```

Truy cập URL này để xem trạng thái và tải về file APK khi hoàn tất.

## Cập nhật ứng dụng

### Phương pháp 1: Tạo build APK mới

Cách đơn giản nhất là tạo một build APK mới mỗi khi có thay đổi:

1. Cập nhật mã nguồn
2. Tăng `versionCode` trong `app.json`
3. Chạy lệnh build mới
4. Phân phối APK mới

### Phương pháp 2: Sử dụng EAS Update (Khuyên dùng)

Để cập nhật ứng dụng mà không cần tạo build mới:

1. **Cài đặt expo-updates**:
   ```bash
   expo install expo-updates
   ```

2. **Cấu hình EAS Update**:
   ```bash
   eas update:configure
   ```

3. **Chuẩn bị ứng dụng cho EAS Update**:
   Sửa file `app.json` để thêm:
   ```json
   {
     "expo": {
       "updates": {
         "enabled": true,
         "fallbackToCacheTimeout": 0
       }
     }
   }
   ```

4. **Tạo build mới có hỗ trợ EAS Update**:
   ```bash
   eas build -p android --profile preview
   ```

5. **Đẩy cập nhật mà không cần build mới**:
   ```bash
   eas update --branch main --message "Cập nhật xyz"
   ```

## Khắc phục sự cố

### Lỗi 404 khi build

Nếu gặp lỗi "Request failed with status code 404" khi sử dụng lệnh cũ, hãy chuyển sang lệnh mới:

```bash
# Lệnh cũ (không còn hoạt động)
expo build:android -t apk

# Lệnh mới
eas build -p android --profile preview
```

### Lỗi khác

- **Kiểm tra phiên bản EAS CLI**:
  ```bash
  eas --version
  ```
  Cập nhật lên phiên bản mới nhất nếu cần:
  ```bash
  npm install -g eas-cli@latest
  ```

- **Xóa cache**:
  ```bash
  expo doctor --fix-dependencies
  expo start -c
  ```

## Tài liệu tham khảo

- [Tài liệu EAS Build](https://docs.expo.dev/build/introduction/)
- [Xây dựng APK cho Android](https://docs.expo.dev/build-reference/apk/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)
