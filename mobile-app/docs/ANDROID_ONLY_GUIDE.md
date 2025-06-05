# Hướng dẫn phát triển và phát hành ứng dụng Android

Tài liệu này cung cấp hướng dẫn chi tiết về việc thiết lập, phát triển và phát hành ứng dụng Pickup Mobile trên nền tảng Android.

## Chuẩn bị môi trường phát triển

### Cài đặt công cụ cần thiết

1. **Cài đặt Node.js và npm**
   ```bash
   # Sử dụng nvm (Node Version Manager) - khuyến nghị
   nvm install 16
   nvm use 16
   ```

2. **Cài đặt Android Studio**
   - Tải từ [developer.android.com/studio](https://developer.android.com/studio)
   - Cài đặt Android SDK Platform Tools
   - Cài đặt Android SDK Build Tools
   - Tạo Android Virtual Device (AVD) để thử nghiệm

3. **Thiết lập biến môi trường**
   ```bash
   # Thêm vào ~/.bashrc hoặc ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

4. **Cài đặt Expo CLI và EAS CLI**
   ```bash
   npm install -g expo-cli eas-cli
   ```

## Phát triển ứng dụng

### Khởi động dự án

1. **Clone repository**
   ```bash
   git clone https://your-repository-url.git
   cd mobile-app
   ```

2. **Cài đặt phụ thuộc**
   ```bash
   npm install
   ```

3. **Khởi động server phát triển**
   ```bash
   npm start
   # Hoặc
   expo start
   ```

4. **Chạy trên thiết bị thật**
   - Cài đặt ứng dụng Expo Go từ Google Play Store
   - Quét mã QR từ terminal hoặc giao diện web Expo
   - Đảm bảo máy tính và thiết bị trong cùng mạng WiFi

5. **Chạy trên máy ảo Android**
   - Khởi động AVD từ Android Studio
   - Nhấn 'a' trong terminal hoặc chọn 'Run on Android device/emulator' trong giao diện web Expo

## Xây dựng APK

### Chuẩn bị

1. **Tạo tài khoản Expo**
   - Đăng ký tại [expo.dev](https://expo.dev)
   - Đăng nhập qua CLI: `expo login`

2. **Cấu hình ứng dụng**
   - Cập nhật thông tin trong `app.json`:
     - `version` và `android.versionCode`
     - `android.package`
     - `android.permissions`

3. **Cấu hình keystore**
   - Tạo keystore tự động qua EAS hoặc sử dụng keystore hiện có
   - Lưu ý: Hãy lưu giữ keystore an toàn, nếu mất sẽ không thể cập nhật ứng dụng sau này

### Xây dựng APK

1. **Sử dụng EAS Build**
   ```bash
   # Xây dựng APK cho phân phối trực tiếp
   eas build -p android --profile preview
   ```

2. **Theo dõi quá trình xây dựng**
   - Truy cập [expo.dev](https://expo.dev) để xem trạng thái
   - Hoặc chạy lệnh: `eas build:list`

3. **Tải xuống APK**
   - Sau khi hoàn tất, tải về APK từ liên kết được cung cấp
   - Cập nhật liên kết tải xuống trong trang web quản trị

## Phát hành lên Google Play Store (Tùy chọn)

### Chuẩn bị

1. **Đăng ký tài khoản Google Play Console** ($25 một lần duy nhất)
   - Đăng ký tại [play.google.com/console](https://play.google.com/console)

2. **Tạo ứng dụng mới trong Play Console**
   - Cung cấp thông tin chi tiết về ứng dụng
   - Tạo các nội dung quảng cáo, ảnh chụp màn hình
   - Thiết lập phân loại nội dung

### Xây dựng bundle AAB

```bash
# Xây dựng AAB cho Google Play Store
eas build -p android --profile production
```

### Gửi lên Google Play Store

```bash
# Gửi bản build mới nhất lên Google Play
eas submit -p android --latest
```

Hoặc tải về file AAB và tải lên thủ công qua Google Play Console.

## Cập nhật ứng dụng

### Quy trình cập nhật

1. **Thực hiện thay đổi mã nguồn**

2. **Cập nhật phiên bản trong `app.json`**
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

3. **Xây dựng bản mới**
   ```bash
   eas build -p android --profile androidApk
   ```

4. **Phân phối bản mới**
   - Cập nhật liên kết tải xuống APK trong trang web quản trị
   - Hoặc gửi lên Google Play Store nếu đã phát hành trên đó

## Khắc phục sự cố

### Lỗi build

- **Lỗi keystore**: Kiểm tra cấu hình keystore trong EAS
  ```bash
  eas credentials
  ```

- **Lỗi versionCode**: Đảm bảo versionCode luôn tăng dần

- **Lỗi thiếu quyền**: Kiểm tra cấu hình quyền trong app.json

### Lỗi chạy ứng dụng

- **Crash khi khởi động**: Kiểm tra Firebase config

- **Lỗi kết nối**: Kiểm tra cấu hình mạng và URL API

## Tài liệu tham khảo

- [Tài liệu Expo](https://docs.expo.dev/)
- [Tài liệu React Native](https://reactnative.dev/docs/getting-started)
- [Tài liệu EAS Build](https://docs.expo.dev/build/introduction/)
- [Tài liệu Google Play Console](https://support.google.com/googleplay/android-developer/)
