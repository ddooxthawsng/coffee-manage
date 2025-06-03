import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Space,
    Table,
    Tag,
    Row,
    Col,
    Typography,
    Statistic,
    Empty,
    Tooltip,
    Select
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    QrcodeOutlined,
    BankOutlined,
    CreditCardOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react'; // Sửa import này
import {
    addQRCode,
    getQRCodes,
    updateQRCode,
    deleteQRCode
} from '../firebase/qrcode_service';

const { Title, Text } = Typography;
const { Option } = Select;

const QRCodeManagement = () => {
    const [qrCodes, setQrCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingQR, setEditingQR] = useState(null);
    const [viewQRModal, setViewQRModal] = useState(false);
    const [selectedQR, setSelectedQR] = useState(null);
    const [form] = Form.useForm();

    // Danh sách ngân hàng Việt Nam với mã BIN chuẩn
    const vietnameseBanks = [
        { code: '970436', name: 'Vietcombank', fullName: 'Ngân hàng TMCP Ngoại thương Việt Nam' },
        { code: '970415', name: 'VietinBank', fullName: 'Ngân hàng TMCP Công thương Việt Nam' },
        { code: '970418', name: 'BIDV', fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
        { code: '970416', name: 'ACB', fullName: 'Ngân hàng TMCP Á Châu' },
        { code: '970407', name: 'Techcombank', fullName: 'Ngân hàng TMCP Kỹ thương Việt Nam' },
        { code: '970422', name: 'MBBank', fullName: 'Ngân hàng TMCP Quân đội' },
        { code: '970432', name: 'VPBank', fullName: 'Ngân hàng TMCP Việt Nam Thịnh vượng' },
        { code: '970423', name: 'TPBank', fullName: 'Ngân hàng TMCP Tiên Phong' },
        { code: '970403', name: 'Sacombank', fullName: 'Ngân hàng TMCP Sài Gòn Thương tín' },
        { code: '970437', name: 'HDBank', fullName: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh' }
    ];

    useEffect(() => {
        loadQRCodes();
    }, []);

    const loadQRCodes = async () => {
        setLoading(true);
        try {
            const qrcodes = await getQRCodes();
            setQrCodes(qrcodes);
        } catch (error) {
            message.error('Lỗi khi tải danh sách QR codes');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            const selectedBank = vietnameseBanks.find(bank => bank.code === values.bankCode);
            const qrData = {
                bankCode: values.bankCode,
                bankName: selectedBank.name,
                bankFullName: selectedBank.fullName,
                accountNumber: values.accountNumber,
                accountName: values.accountName
            };

            if (editingQR) {
                await updateQRCode(editingQR.id, qrData);
                message.success('Cập nhật QR code thành công!');
            } else {
                await addQRCode(qrData);
                message.success('Thêm QR code thành công!');
            }

            await loadQRCodes();
            setIsModalVisible(false);
            setEditingQR(null);
            form.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const handleDeleteQR = async (id) => {
        try {
            await deleteQRCode(id);
            await loadQRCodes();
            message.success('Xóa QR code thành công!');
        } catch (error) {
            message.error('Lỗi khi xóa QR code');
        }
    };

    const openAddModal = () => {
        setEditingQR(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const openEditModal = (qr) => {
        setEditingQR(qr);
        form.setFieldsValue({
            bankCode: qr.bankCode,
            accountNumber: qr.accountNumber,
            accountName: qr.accountName
        });
        setIsModalVisible(true);
    };

    const viewQR = (qr) => {
        setSelectedQR(qr);
        setViewQRModal(true);
    };

    // Tạo QR content theo chuẩn EMV
    const generateEMVQRContent = (qrData, amount, description) => {
        const merchantAccount = qrData.accountNumber;
        const merchantName = qrData.accountName;

        let qrString = '';
        qrString += '00020101021238'; // Payload Format Indicator + Point of Initiation
        qrString += '5802VN'; // Country Code (Vietnam)
        qrString += '5303704'; // Transaction Currency (VND)
        qrString += `54${amount.toString().padStart(2, '0')}${amount}`; // Transaction Amount
        qrString += `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`; // Merchant Name
        qrString += '6007Ho Chi Minh'; // Merchant City
        qrString += `62${(description.length + 4).toString().padStart(2, '0')}08${description.length.toString().padStart(2, '0')}${description}`; // Additional Data

        // Tính CRC16
        const crc = calculateCRC16(qrString + '6304');
        qrString += '6304' + crc;

        return qrString;
    };

    // Tính CRC16 cho EMV QR
    const calculateCRC16 = (data) => {
        let crc = 0xFFFF;
        for (let i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc = crc << 1;
                }
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    };

    const columns = [
        {
            title: 'Ngân hàng',
            key: 'bank',
            render: (_, record) => (
                <Space>
                    <BankOutlined style={{ color: '#1890ff' }} />
                    <div>
                        <Text strong>{record.bankName}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.bankFullName}
                        </Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Số tài khoản',
            dataIndex: 'accountNumber',
            key: 'accountNumber',
            render: (text) => (
                <Space>
                    <CreditCardOutlined style={{ color: '#52c41a' }} />
                    <Text code>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Tên chủ tài khoản',
            dataIndex: 'accountName',
            key: 'accountName',
            render: (text) => <Text>{text}</Text>
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem QR">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => viewQR(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa QR Code"
                        description="Bạn có chắc chắn muốn xóa QR code này?"
                        onConfirm={() => handleDeleteQR(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
            width: 150
        }
    ];

    return (
        <div className="drink-management-container">
            <Title level={2} className="page-title">
                <QrcodeOutlined /> Quản Lý QR Code Thanh Toán
            </Title>

            {/* Statistics Cards */}
            <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card">
                        <Statistic
                            title="Tổng QR Code"
                            value={qrCodes.length}
                            prefix={<QrcodeOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card">
                        <Statistic
                            title="Ngân hàng"
                            value={new Set(qrCodes.map(qr => qr.bankCode)).size}
                            prefix={<BankOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card">
                        <Statistic
                            title="Trạng thái"
                            value="Hoạt động"
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Danh sách QR Code */}
            <Card
                className="glass-card"
                title={
                    <Space>
                        <QrcodeOutlined />
                        Danh sách QR Code
                        <Tag color="blue">{qrCodes.length} mã</Tag>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openAddModal}
                    >
                        Thêm QR Code
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={qrCodes}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} QR codes`
                    }}
                    locale={{
                        emptyText: (
                            <Empty
                                description="Chưa có QR code nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    }}
                />
            </Card>

            {/* Modal thêm/sửa QR */}
            <Modal
                title={
                    <Space>
                        {editingQR ? <EditOutlined /> : <PlusOutlined />}
                        {editingQR ? 'Chỉnh sửa QR Code' : 'Thêm QR Code mới'}
                    </Space>
                }
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingQR(null);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Chọn ngân hàng"
                        name="bankCode"
                        rules={[{ required: true, message: 'Vui lòng chọn ngân hàng!' }]}
                    >
                        <Select
                            placeholder="Chọn ngân hàng"
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {vietnameseBanks.map(bank => (
                                <Option key={bank.code} value={bank.code}>
                                    <Space>
                                        <BankOutlined />
                                        <div>
                                            <div>{bank.name}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                {bank.fullName}
                                            </div>
                                        </div>
                                    </Space>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Số tài khoản"
                                name="accountNumber"
                                rules={[{ required: true, message: 'Vui lòng nhập số tài khoản!' }]}
                            >
                                <Input placeholder="VD: 1234567890" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Tên chủ tài khoản"
                                name="accountName"
                                rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản!' }]}
                            >
                                <Input placeholder="VD: NGUYEN VAN A" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={editingQR ? <EditOutlined /> : <PlusOutlined />}
                            >
                                {editingQR ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                            <Button onClick={() => {
                                setIsModalVisible(false);
                                setEditingQR(null);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal xem QR */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined />
                        Xem QR Code - {selectedQR?.bankName}
                    </Space>
                }
                open={viewQRModal}
                onCancel={() => setViewQRModal(false)}
                footer={[
                    <Button key="close" onClick={() => setViewQRModal(false)}>
                        Đóng
                    </Button>
                ]}
                width={500}
            >
                {selectedQR && (
                    <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
                        <QRCodeSVG
                            value={generateEMVQRContent(selectedQR, 100000, "Demo Payment")}
                            size={300}
                            level="M"
                            includeMargin={true}
                            style={{
                                border: '4px solid #f0f0f0',
                                borderRadius: '12px',
                                padding: '16px',
                                background: 'white'
                            }}
                        />
                        <div style={{ textAlign: 'left', width: '100%', marginTop: 16 }}>
                            <Text strong>Ngân hàng:</Text> {selectedQR.bankName}<br />
                            <Text strong>Tên đầy đủ:</Text> {selectedQR.bankFullName}<br />
                            <Text strong>Số tài khoản:</Text> {selectedQR.accountNumber}<br />
                            <Text strong>Tên chủ tài khoản:</Text> {selectedQR.accountName}
                        </div>
                    </Space>
                )}
            </Modal>
        </div>
    );
};

export default QRCodeManagement;
