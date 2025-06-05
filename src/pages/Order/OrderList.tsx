import React, {useEffect, useState} from "react";
import {Button, Form, InputNumber, message, Modal, Select, Table, Tag} from "antd";
// Giả lập dữ liệu menu, thực tế lấy từ Firestore
const FAKE_MENU = [
    {id: "1", name: "Cà phê sữa đá", sizes: [{size: "S", price: 20000}, {size: "M", price: 25000}]},
    {id: "2", name: "Trà đào cam sả", sizes: [{size: "M", price: 30000}, {size: "L", price: 35000}]},
];

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [modal, setModal] = useState(false);
    const [form] = Form.useForm();

    // Giả lập fetch orders, thực tế lấy từ Firestore
    useEffect(() => {
        setOrders([]);
    }, []);

    const handleCreate = (values: any) => {
        // Tính tổng tiền
        const menu = FAKE_MENU.find((m) => m.id === values.menuId);
        const sizeInfo = menu?.sizes.find((s) => s.size === values.size);
        const total = sizeInfo ? sizeInfo.price * values.quantity : 0;
        setOrders([
            ...orders,
            {
                id: Date.now().toString(),
                name: menu?.name,
                size: values.size,
                quantity: values.quantity,
                total,
                status: "paid",
            },
        ]);
        setModal(false);
        message.success("Đã tạo đơn hàng!");
        form.resetFields();
        // Thực tế: Lưu vào Firestore, hiển thị QR thanh toán, v.v.
    };

    return (
        <div className="p-4 bg-white min-h-screen">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h2 className="text-xl font-bold mb-2 sm:mb-0">Quản lý bán hàng</h2>
                <Button type="primary" onClick={() => setModal(true)}>
                    Tạo đơn hàng mới
                </Button>
            </div>
            <Table
                dataSource={orders}
                rowKey="id"
                columns={[
                    {title: "Tên món", dataIndex: "name"},
                    {title: "Size", dataIndex: "size"},
                    {title: "Số lượng", dataIndex: "quantity"},
                    {
                        title: "Tổng tiền",
                        dataIndex: "total",
                        render: (total: number) => total?.toLocaleString("vi-VN") + " ₫",
                    },
                    {
                        title: "Trạng thái",
                        dataIndex: "status",
                        render: (status: string) =>
                            status === "paid" ? (
                                <Tag color="green">Đã thanh toán</Tag>
                            ) : (
                                <Tag color="red">Chưa thanh toán</Tag>
                            ),
                    },
                ]}
            />
            <Modal
                open={modal}
                title="Tạo đơn hàng mới"
                onCancel={() => setModal(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item
                        label="Chọn món"
                        name="menuId"
                        rules={[{required: true, message: "Chọn món"}]}
                    >
                        <Select>
                            {FAKE_MENU.map((m) => (
                                <Select.Option key={m.id} value={m.id}>
                                    {m.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Chọn size"
                        name="size"
                        rules={[{required: true, message: "Chọn size"}]}
                    >
                        <Select>
                            {form.getFieldValue("menuId")
                                ? FAKE_MENU.find((m) => m.id === form.getFieldValue("menuId"))?.sizes.map((s) => (
                                    <Select.Option key={s.size} value={s.size}>
                                        {s.size}
                                    </Select.Option>
                                ))
                                : null}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Số lượng"
                        name="quantity"
                        rules={[{required: true, message: "Nhập số lượng"}]}
                        initialValue={1}
                    >
                        <InputNumber min={1} className="w-full"/>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Tạo đơn hàng
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default OrderList;
