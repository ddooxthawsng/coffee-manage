import React, { useEffect, useState } from "react";
import { Table, Button, DatePicker, Modal, message, Tag, Row, Col, Select } from "antd";
import dayjs from "dayjs";
import {
    getInvoices,
    getInvoiceById,
    deleteInvoice,
} from "../../services/invoiceService";
import { getUsers } from "../../services/userService";

const { RangePicker } = DatePicker;
const { Option } = Select;

const statusOptions = [
    { value: "processing", label: "Đang xử lý" },
    { value: "paid", label: "Đã thanh toán" },
    { value: "deleted", label: "Đã hủy" },
];
const paymentOptions = [
    { value: "cash", label: "Tiền mặt" },
    { value: "qr", label: "QR" },
    { value: "momo", label: "MoMo" },
    { value: "vnpay", label: "VNPAY" },
];

const InvoiceList: React.FC = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState<[any, any]>([dayjs().startOf("day"), dayjs().endOf("day")]);
    const [detail, setDetail] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Danh sách user/email
    const [users, setUsers] = useState<any[]>([]);
    const [createdUser, setCreatedUser] = useState<string | undefined>(undefined);

    useEffect(() => {
        getUsers().then(setUsers);
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        let filter: any = {};
        if (range && range[0] && range[1]) {
            filter = {
                from: range[0].startOf("day").toISOString(),
                to: range[1].endOf("day").toISOString(),
            };
        }
        // Lọc theo createdUser nếu có chọn
        if (createdUser) filter.createdUser = createdUser;

        setInvoices(await getInvoices(filter));
        setLoading(false);
    };

    useEffect(() => {
        fetchInvoices();
        // eslint-disable-next-line
    }, [range, createdUser]);

    const handleShowDetail = async (id: string) => {
        const inv = await getInvoiceById(id);
        setDetail(inv);
        setDetailOpen(true);
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            await deleteInvoice(id);
            message.success("Đã hủy hóa đơn!");
            fetchInvoices();
        } catch {
            message.error("Lỗi khi hủy!");
        }
        setLoading(false);
    };

    return (
        <div className="p-4 bg-white min-h-screen">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h2 className="text-xl font-bold mb-2 sm:mb-0">Quản lý hóa đơn</h2>
                <RangePicker
                    className="mb-2 sm:mb-0"
                    format="DD/MM/YYYY"
                    onChange={(dates) => setRange(dates)}
                    allowClear
                    value={range}
                />
            </div>
            <Row gutter={12} style={{ marginBottom: 16 }}>
                <Col>
                    <Select
                        allowClear
                        showSearch
                        placeholder="Lọc theo email"
                        style={{ width: 220 }}
                        value={createdUser}
                        onChange={setCreatedUser}
                        filterOption={(input, option) =>
                            (option?.children as string).toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {users.map(u => (
                            <Option key={u.email} value={u.email}>{u.email} {u.name ? `(${u.name})` : ""}</Option>
                        ))}
                    </Select>
                </Col>
            </Row>
            <Table
                dataSource={invoices}
                rowKey="id"
                loading={loading}
                scroll={{ x: true }}
                columns={[
                    {
                        title: "Tổng tiền gốc",
                        dataIndex: "total",
                        render: (total) =>
                            total?.toLocaleString("vi-VN") + " ₫",
                    },
                    {
                        title: "Giảm giá",
                        dataIndex: "discount",
                        render: (discount) =>
                            discount ? "-" + discount.toLocaleString("vi-VN") + " ₫" : "0 ₫",
                    },
                    {
                        title: "Thanh toán",
                        dataIndex: "finalTotal",
                        render: (finalTotal) =>
                            finalTotal?.toLocaleString("vi-VN") + " ₫",
                    },
                    {
                        title: "Khuyến mãi",
                        dataIndex: "promotionName",
                        render: (promotionName, record) =>
                            record.discount > 0 && promotionName
                                ? (
                                    <span>
                                        {promotionName}
                                        {record.promotionType === "percent"
                                            ? ` (-${record.promotionValue}%)`
                                            : record.promotionType === "amount"
                                                ? ` (-${record.promotionValue?.toLocaleString()}đ)`
                                                : ""}
                                        {record.promotionCode ? ` [${record.promotionCode}]` : ""}
                                    </span>
                                )
                                : record.discount > 0
                                    ? <span style={{ color: "#faad14" }}>Không rõ (đã giảm giá)</span>
                                    : <span style={{ color: "#aaa" }}>Không</span>,
                    },
                    {
                        title: "Ngày",
                        dataIndex: "createdAt",
                        render: (createdAt) =>
                            createdAt
                                ? dayjs(createdAt.toDate?.() || createdAt).format("DD/MM/YYYY HH:mm")
                                : "",
                    },
                    {
                        title: "Email",
                        dataIndex: "createdUser",
                        render: (createdUser) => createdUser || "-",
                    },
                    {
                        title: "Trạng thái",
                        dataIndex: "status",
                        render: (status) =>
                            status === "paid" ? (
                                <Tag color="green">Đã thanh toán</Tag>
                            ) : status === "deleted" ? (
                                <Tag color="orange">Đã hủy</Tag>
                            ) : status === "processing" ? (
                                <Tag color="blue">Đang xử lý</Tag>
                            ) : (
                                <Tag color="red">Chưa thanh toán</Tag>
                            ),
                    },
                    {
                        title: "Thao tác",
                        key: "actions",
                        render: (_, record) => (
                            <>
                                <Button type="link" onClick={() => handleShowDetail(record.id)}>
                                    Xem chi tiết
                                </Button>
                                <Button type="link" danger onClick={() => handleDelete(record.id)}>
                                    Hủy
                                </Button>
                            </>
                        ),
                    },
                ]}
            />
            <Modal
                open={detailOpen}
                title="Chi tiết hóa đơn"
                onCancel={() => setDetailOpen(false)}
                footer={null}
                width={600}
            >
                {detail ? (
                    <div>
                        <div><b>Mã hóa đơn:</b> {detail.id}</div>
                        <div><b>Người tạo (email):</b> {detail.createdUser || "-"}</div>
                        <div><b>Tổng tiền:</b> {detail.total?.toLocaleString("vi-VN")} ₫</div>
                        <div><b>Ngày tạo:</b> {detail.createdAt ? dayjs(detail.createdAt.toDate?.() || detail.createdAt).format("DD/MM/YYYY HH:mm") : ""}</div>
                        <div><b>Trạng thái:</b> {detail.status === "paid" ? "Đã thanh toán" : detail.status === "deleted" ? "Đã hủy" : "Chưa thanh toán"}</div>
                        {detail.promotionName && (
                            <div>
                                <b>Khuyến mãi:</b> {detail.promotionName}
                                {detail.promotionType === "percent"
                                    ? ` (-${detail.promotionValue}%)`
                                    : detail.promotionType === "amount"
                                        ? ` (-${detail.promotionValue?.toLocaleString()}đ)`
                                        : ""}
                                {detail.promotionCode ? ` [${detail.promotionCode}]` : ""}
                            </div>
                        )}
                        <div><b>Chi tiết món:</b></div>
                        <ul className="list-disc pl-4">
                            {(detail.items || []).map((item, idx) => (
                                <li key={idx} style={{ marginBottom: 8 }}>
                                    <div>
                                        <b>{item.name}</b> - {item.size} x {item.quantity}
                                        {" = "}
                                        <b>
                                            {(item.price + (item.toppingTotal || 0)).toLocaleString("vi-VN")}đ x {item.quantity} = {(item.itemTotal || (item.price + (item.toppingTotal || 0)) * item.quantity).toLocaleString("vi-VN")} ₫
                                        </b>
                                    </div>
                                    {item.toppings && item.toppings.length > 0 && (
                                        <div style={{ color: "#888", fontSize: 13, marginLeft: 12 }}>
                                            {item.toppings
                                                .filter(t => t.quantity > 0)
                                                .map(t =>
                                                    `${t.name}${t.quantity > 1 ? ` x${t.quantity}` : ""} (+${(t.sizes?.[0]?.price || 0).toLocaleString()}đ)`
                                                )
                                                .join(", ")
                                            }
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <div>
                            <b>Giảm giá:</b> -{detail.discount?.toLocaleString("vi-VN") || 0} ₫
                        </div>
                        <div>
                            <b>Thanh toán:</b> {detail.finalTotal?.toLocaleString("vi-VN")} ₫
                        </div>
                        {detail.note && <div><b>Ghi chú:</b> {detail.note}</div>}
                    </div>
                ) : (
                    <div>Đang tải...</div>
                )}
            </Modal>
        </div>
    );
};

export default InvoiceList;
