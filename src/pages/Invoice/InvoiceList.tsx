import React, { useEffect, useState } from "react";
import { Table, Button, DatePicker, Modal, message, Tag } from "antd";
import dayjs from "dayjs";
import {
    getInvoices,
    getInvoiceById,
    deleteInvoice,
} from "../../services/invoiceService";

const { RangePicker } = DatePicker;

const InvoiceList: React.FC = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState<[any, any] | null>(null);
    const [detail, setDetail] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const fetchInvoices = async () => {
        setLoading(true);
        let filter = {};
        if (range && range[0] && range[1]) {
            filter = {
                from: range[0].startOf("day").toISOString(),
                to: range[1].endOf("day").toISOString(),
            };
        }
        setInvoices(await getInvoices(filter));
        setLoading(false);
    };

    useEffect(() => {
        fetchInvoices();
        // eslint-disable-next-line
    }, [range]);

    const handleShowDetail = async (id: string) => {
        const inv = await getInvoiceById(id);
        setDetail(inv);
        setDetailOpen(true);
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            await deleteInvoice(id);
            message.success("Đã xóa hóa đơn!");
            fetchInvoices();
        } catch {
            message.error("Lỗi khi xóa!");
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
                />
            </div>
            <Table
                dataSource={invoices}
                rowKey="id"
                loading={loading}
                scroll={{ x: true }}
                columns={[
                    { title: "Mã hóa đơn", dataIndex: "id" },
                    { title: "Khách hàng", dataIndex: "customer" },
                    {
                        title: "Tổng tiền",
                        dataIndex: "total",
                        render: (total: number) =>
                            total?.toLocaleString("vi-VN") + " ₫",
                    },
                    {
                        title: "Ngày",
                        dataIndex: "createdAt",
                        render: (createdAt: any) =>
                            createdAt
                                ? dayjs(createdAt.toDate?.() || createdAt).format("DD/MM/YYYY HH:mm")
                                : "",
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
                    {
                        title: "Thao tác",
                        key: "actions",
                        render: (_, record) => (
                            <>
                                <Button type="link" onClick={() => handleShowDetail(record.id)}>
                                    Xem chi tiết
                                </Button>
                                <Button type="link" danger onClick={() => handleDelete(record.id)}>
                                    Xóa
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
                        <div><b>Khách hàng:</b> {detail.customer}</div>
                        <div><b>Tổng tiền:</b> {detail.total?.toLocaleString("vi-VN")} ₫</div>
                        <div><b>Ngày tạo:</b> {detail.createdAt ? dayjs(detail.createdAt.toDate?.() || detail.createdAt).format("DD/MM/YYYY HH:mm") : ""}</div>
                        <div><b>Trạng thái:</b> {detail.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</div>
                        <div><b>Chi tiết món:</b></div>
                        <ul className="list-disc pl-4">
                            {(detail.items || []).map((item: any, idx: number) => (
                                <li key={idx}>
                                    {item.name} - {item.size} x {item.quantity} = {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                                </li>
                            ))}
                        </ul>
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
