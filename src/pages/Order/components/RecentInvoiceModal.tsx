import React from "react";
import { Modal, Table } from "antd";
import dayjs from "dayjs";

const RecentInvoiceModal = ({ open, onClose, invoices }) => (
    <Modal
        open={open}
        onCancel={onClose}
        title="Hóa đơn gần đây"
        footer={null}
        width={800}
    >
        <Table
            dataSource={invoices}
            rowKey="id"
            size="small"
            columns={[
                // { title: "Mã hóa đơn", dataIndex: "id", width: 120 },
                { title: "Tổng tiền",    dataIndex: "total", render: v => v?.toLocaleString() + " ₫", width: 120 },
                { title: "Ngày", dataIndex: "createdAt", render: v => v ? dayjs(v.toDate?.() || v).format("DD/MM/YYYY HH:mm") : "", width: 160 },
                { title: "Giảm giá", dataIndex: "discount", render: v => v ? "-" + v.toLocaleString() + " ₫" : "0 ₫", width: 100 },
                { title: "Thanh toán", dataIndex: "finalTotal", render: v => v?.toLocaleString() + " ₫", width: 120 },
                { title: "Khuyến mãi", dataIndex: "promotionName", render: v => v || <span style={{ color: "#aaa" }}>Không</span> },
            ]}
            pagination={false}
            scroll={{ x: true }}
            expandable={{
                expandedRowRender: record => (
                    <div style={{ padding: 8 }}>
                        <b>Danh sách món:</b>
                        <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                            {(record.items || []).map((item, idx) => (
                                <li key={idx} style={{ marginBottom: 2 }}>
                                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                                    {item.size && <span style={{ color: "#888" }}> ({item.size})</span>}
                                    {item.quantity && <> × <b>{item.quantity}</b></>}
                                    {item.price && <> = <span style={{ color: "#fa8c16" }}>{item.price.toLocaleString()}₫</span></>}
                                    {item.toppings && item.toppings.length > 0 && (
                                        <span style={{ color: "#888", marginLeft: 8 }}>
                                            [Topping: {item.toppings.map(t => `${t.name}${t.quantity > 1 ? ` x${t.quantity}` : ""}`).join(", ")}]
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ),
                rowExpandable: record => Array.isArray(record.items) && record.items.length > 0,
                expandRowByClick: true,
            }}
        />
    </Modal>
);

export default RecentInvoiceModal;
