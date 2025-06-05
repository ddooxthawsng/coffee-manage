import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Tag, message, Popconfirm, Form, Input, InputNumber, Switch, Select } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import {
    getQRCodes,
    createQRCode,
    updateQRCode,
    deleteQRCode,
} from "../../services/qrcodeService";
import { getVietQRUrl } from "../../utils/vietqr";

// Danh sách ngân hàng Việt Nam với mã BIN chuẩn
const BANKS = [
    { bin: '970436', name: 'Vietcombank' },
    { bin: '970415', name: 'VietinBank' },
    { bin: '970418', name: 'BIDV' },
    { bin: '970416', name: 'ACB' },
    { bin: '970407', name: 'Techcombank' },
    { bin: '970422', name: 'MBBank' },
    { bin: '970432', name: 'VPBank' },
    { bin: '970423', name: 'TPBank' },
    { bin: '970403', name: 'Sacombank' },
    { bin: '970437', name: 'HDBank' },
];

const QRCodeList: React.FC = () => {
    const [qrcodes, setQRCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<any>({ open: false, item: null });
    const [formLoading, setFormLoading] = useState(false);

    const fetchQRCodes = async () => {
        setLoading(true);
        setQRCodes(await getQRCodes());
        setLoading(false);
    };

    useEffect(() => {
        fetchQRCodes();
    }, []);

    const handleCreate = async (values: any) => {
        setFormLoading(true);
        try {
            await createQRCode(values);
            message.success("Tạo mã QR thành công!");
            setModal({ open: false, item: null });
            fetchQRCodes();
        } catch {
            message.error("Lỗi khi tạo mã QR!");
        }
        setFormLoading(false);
    };

    const handleEdit = async (values: any) => {
        setFormLoading(true);
        try {
            await updateQRCode(modal.item.id, values);
            message.success("Cập nhật thành công!");
            setModal({ open: false, item: null });
            fetchQRCodes();
        } catch {
            message.error("Lỗi khi cập nhật!");
        }
        setFormLoading(false);
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            await deleteQRCode(id);
            message.success("Đã xóa mã QR!");
            fetchQRCodes();
        } catch {
            message.error("Lỗi khi xóa!");
        }
        setLoading(false);
    };

    // Form QR Code
    const QRForm = ({ initialValues, onSubmit, loading }: any) => {
        const [form] = Form.useForm();
        return (
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues || { isDefault: false }}
                onFinish={onSubmit}
            >
                <Form.Item
                    label="Ngân hàng"
                    name="bankBin"
                    rules={[{ required: true, message: "Chọn ngân hàng" }]}
                >
                    <Select showSearch placeholder="Chọn ngân hàng">
                        {BANKS.map((b) => (
                            <Select.Option key={b.bin} value={b.bin}>
                                {b.name} ({b.bin})
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="Số tài khoản" name="accountNumber" rules={[{ required: true, message: "Nhập số tài khoản" }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Tên người nhận" name="accountName" rules={[{ required: true, message: "Nhập tên người nhận" }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Số tiền mẫu (VNĐ)" name="amount">
                    <InputNumber min={0} className="w-full" step={1000} placeholder="Không bắt buộc" />
                </Form.Item>
                <Form.Item label="Nội dung chuyển khoản" name="description">
                    <Input placeholder="Không bắt buộc" />
                </Form.Item>
                <Form.Item label="Đặt làm mặc định" name="isDefault" valuePropName="checked">
                    <Switch />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        {initialValues ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </Form.Item>
            </Form>
        );
    };

    // Hàm tạo URL QR code từ nội dung QR (dùng dịch vụ qrserver.com)
    const getQRCodeUrl = (content: string) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(content)}`;
    };

    return (
        <div className="p-4 bg-white min-h-screen">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h2 className="text-xl font-bold mb-2 sm:mb-0">Quản lý mã QR thanh toán</h2>
                <Button
                    type="primary"
                    onClick={() => setModal({ open: true, item: null })}
                >
                    Thêm mã QR mới
                </Button>
            </div>
            <Table
                dataSource={qrcodes}
                rowKey="id"
                loading={loading}
                scroll={{ x: true }}
                columns={[
                    {
                        title: "QR Code",
                        dataIndex: "accountNumber",
                        render: (_: any, record: any) => {
                            const qrContent =getVietQRUrl({
                                bankBin: record.bankBin, // Ví dụ: "VCB", "TCB", "BIDV"
                                accountNumber: record.accountNumber,
                                amount: record.total,
                                addInfo: record ? `Thanh toan hoa don` : "",
                            })
                            const qrUrl = getQRCodeUrl(qrContent);
                            return <img src={qrUrl} alt="QR Code" width={64} height={64} />;
                        },
                    },
                    {
                        title: "Ngân hàng",
                        dataIndex: "bankBin",
                        render: (bin: string) => {
                            const bank = BANKS.find(b => b.bin === bin);
                            return bank ? `${bank.name} (${bin})` : bin;
                        }
                    },
                    { title: "Số tài khoản", dataIndex: "accountNumber" },
                    { title: "Tên nhận", dataIndex: "accountName" },
                    {
                        title: "Mặc định",
                        dataIndex: "isDefault",
                        render: (isDefault: boolean) =>
                            isDefault ? (
                                <Tag color="success" icon={<CheckCircleOutlined />}>
                                    Mặc định
                                </Tag>
                            ) : null,
                    },
                    {
                        title: "Thao tác",
                        key: "actions",
                        render: (_: any, record: any) => (
                            <>
                                <Button
                                    type="link"
                                    onClick={() => setModal({ open: true, item: record })}
                                >
                                    Sửa
                                </Button>
                                <Popconfirm
                                    title="Bạn chắc chắn muốn xóa?"
                                    onConfirm={() => handleDelete(record.id)}
                                >
                                    <Button type="link" danger>
                                        Xóa
                                    </Button>
                                </Popconfirm>
                            </>
                        ),
                    },
                ]}
            />
            <Modal
                open={modal.open}
                title={modal.item ? "Cập nhật mã QR" : "Thêm mã QR mới"}
                onCancel={() => setModal({ open: false, item: null })}
                footer={null}
                destroyOnClose
            >
                <QRForm
                    initialValues={modal.item}
                    onSubmit={modal.item ? handleEdit : handleCreate}
                    loading={formLoading}
                />
            </Modal>
        </div>
    );
};

export default QRCodeList;
