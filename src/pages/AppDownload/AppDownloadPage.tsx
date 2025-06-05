import React from 'react';
import { Typography, Button, Row, Col, Card, Steps, Divider, Collapse } from 'antd';
import { AndroidOutlined, CloudDownloadOutlined, CodeOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;

const AppDownloadPage: React.FC = () => {
    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Row gutter={[24, 24]} justify="center">
                <Col xs={24}>
                    <Title level={2} style={{ textAlign: 'center', color: '#1890ff' }}>
                        <CloudDownloadOutlined /> Tải ứng dụng Pickup Mobile
                    </Title>
                    <Paragraph style={{ textAlign: 'center', fontSize: '16px' }}>
                        Quản lý đơn hàng và hóa đơn mọi lúc, mọi nơi với ứng dụng di động Pickup
                    </Paragraph>
                    <Divider />
                </Col>

                {/* Download Box */}
                <Col xs={24} md={12}>
                    <Card 
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AndroidOutlined style={{ fontSize: '28px', color: '#3DDC84', marginRight: '10px' }} />
                                <span>Android</span>
                            </div>
                        }
                        bordered={true}
                        style={{ height: '100%' }}
                        className="download-card"
                    >
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <AndroidOutlined style={{ fontSize: '80px', color: '#3DDC84' }} />
                        </div>
                        <Paragraph style={{ textAlign: 'center', marginBottom: '20px' }}>
                            Nhấn nút bên dưới để tải ứng dụng trên thiết bị Android
                        </Paragraph>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button 
                                type="primary" 
                                href="https://expo.dev/artifacts/your-android-build-url"
                                icon={<CloudDownloadOutlined />}
                                size="large"
                                style={{ backgroundColor: '#3DDC84', borderColor: '#3DDC84' }}
                            >
                                Tải APK cho Android
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider style={{ margin: '40px 0 20px' }} />

            {/* Installation Instructions */}
            <Row gutter={[24, 24]}>
                <Col xs={24}>
                    <Title level={3} style={{ textAlign: 'center' }}>
                        <SettingOutlined /> Hướng dẫn cài đặt
                    </Title>
                </Col>

                <Col xs={24}>
                    <Card title={<><AndroidOutlined /> Android</>} bordered={true}>
                        <Steps direction="vertical" current={4}>
                            <Step title="Tải APK" description="Nhấn vào nút 'Tải APK cho Android' ở trên." />
                            <Step title="Cho phép cài đặt" description="Vào Cài đặt > Bảo mật > Cho phép cài đặt từ nguồn không xác định." />
                            <Step title="Mở file APK" description="Tìm file APK đã tải trong thư mục Downloads và nhấn vào để cài đặt." />
                            <Step title="Xác nhận cài đặt" description="Nhấn 'Cài đặt' và chờ quá trình hoàn tất." />
                            <Step title="Hoàn tất" description="Mở ứng dụng và đăng nhập bằng tài khoản của bạn." />
                        </Steps>
                    </Card>
                </Col>
            </Row>

            <Divider style={{ margin: '40px 0 20px' }} />

            {/* FAQ */}
            <Row>
                <Col xs={24}>
                    <Title level={3} style={{ textAlign: 'center' }}>
                        <QuestionCircleOutlined /> Câu hỏi thường gặp
                    </Title>

                    <Collapse defaultActiveKey={['1']} style={{ marginTop: '20px' }}>
                        <Panel header="Ứng dụng có tính phí không?" key="1">
                            <Paragraph>
                                Không, ứng dụng hoàn toàn miễn phí cho nhân viên và quản lý của cửa hàng.
                                Bạn chỉ cần tài khoản được cấp bởi quản trị viên hệ thống.
                            </Paragraph>
                        </Panel>
                        <Panel header="Tôi không đăng nhập được vào ứng dụng?" key="2">
                            <Paragraph>
                                Hãy đảm bảo bạn đang sử dụng đúng email và mật khẩu đã được cấp.
                                Nếu vẫn gặp vấn đề, vui lòng liên hệ quản trị viên hệ thống để được hỗ trợ.
                            </Paragraph>
                        </Panel>
                        <Panel header="Ứng dụng có thể hoạt động khi không có kết nối internet không?" key="3">
                            <Paragraph>
                                Ứng dụng cần kết nối internet để đồng bộ dữ liệu, tuy nhiên một số thông tin cơ bản
                                như menu sẽ được lưu trong bộ nhớ đệm và có thể xem được khi offline.
                                Bạn sẽ cần kết nối internet để tạo đơn hàng mới hoặc xem hóa đơn.
                            </Paragraph>
                        </Panel>
                        <Panel header="Làm thế nào để cập nhật ứng dụng?" key="4">
                            <Paragraph>
                                Bạn sẽ nhận được thông báo khi có phiên bản mới và có thể tải bản cập nhật trực tiếp từ trang này.
                                Hãy thường xuyên kiểm tra trang này để cập nhật các phiên bản mới nhất với tính năng và bảo mật được cải thiện.
                            </Paragraph>
                        </Panel>
                        <Panel header="Lỗi 'Request failed with status code 404' khi build?" key="5">
                            <Paragraph>
                                Lệnh <Text code>expo build:android</Text> đã bị ngừng hỗ trợ từ ngày 4/1/2023. Hiện tại, bạn cần sử dụng 
                                hệ thống EAS Build mới của Expo với lệnh <Text code>eas build -p android --profile preview</Text>. 
                                Xem thêm hướng dẫn chi tiết trong mục dành cho nhà phát triển bên dưới.
                            </Paragraph>
                        </Panel>
                    </Collapse>
                </Col>
            </Row>

            <Divider style={{ margin: '40px 0 20px' }} />

            {/* For Developers */}
            <Row>
                <Col xs={24}>
                    <Title level={3} style={{ textAlign: 'center' }}>
                        <CodeOutlined /> Dành cho nhà phát triển
                    </Title>

                    <Card style={{ marginTop: '20px' }}>
                        <Paragraph>
                            <strong>Cài đặt môi trường phát triển Android:</strong>
                        </Paragraph>
                        <ol>
                            <li>Cài đặt Node.js và npm từ <a href="https://nodejs.org" target="_blank">nodejs.org</a></li>
                            <li>Cài đặt Android Studio từ <a href="https://developer.android.com/studio" target="_blank">developer.android.com</a></li>
                            <li>Cài đặt Android SDK và Android Virtual Device</li>
                            <li>Cài đặt Expo CLI: <Text code>npm install -g expo-cli</Text></li>
                            <li>Clone repository từ Git</li>
                            <li>Chạy <Text code>npm install</Text> để cài đặt các phụ thuộc</li>
                            <li>Chạy <Text code>npm start</Text> để khởi động server phát triển</li>
                            <li>Chọn thiết bị Android hoặc máy ảo để chạy ứng dụng</li>
                        </ol>

                        <Paragraph style={{ marginTop: '20px' }}>
                            <strong>Tạo bản build APK:</strong>
                        </Paragraph>
                        <ol>
                            <li>Cài đặt EAS CLI: <Text code>npm install -g eas-cli</Text></li>
                            <li>Đăng nhập vào Expo: <Text code>eas login</Text></li>
                            <li>Khởi tạo cấu hình EAS (nếu chưa có): <Text code>eas build:configure</Text></li>
                            <li>Cấu hình profile build APK trong eas.json:</li>
                        </ol>
                        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
                            <Text code>{`{
                          "build": {
                            "preview": {
                              "android": {
                                "buildType": "apk"
                              }
                            }
                          }
                        }`}</Text>
                        </div>
                        <ol start={5}>
                            <li>Chạy lệnh build: <Text code>eas build -p android --profile preview</Text></li>
                            <li>Theo dõi tiến trình tại <a href="https://expo.dev" target="_blank">expo.dev</a></li>
                            <li>Tải về file APK khi quá trình build hoàn tất</li>
                            <li>Cập nhật liên kết tải xuống trong trang web quản trị</li>
                        </ol>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AppDownloadPage;
