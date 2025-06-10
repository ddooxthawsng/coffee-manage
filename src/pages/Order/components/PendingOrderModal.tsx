import React from "react";
import { Button, Modal, Table, Tag, Badge } from "antd";
import { CheckOutlined, ShopOutlined, CarryOutOutlined,TransactionOutlined   } from "@ant-design/icons";
import dayjs from "dayjs";

// Hàm render danh sách món đã order với layout đẹp
const renderOrderItems = (items, createdAt, record) => (
    <div style={{ lineHeight: 1.5 }}>
        {/* Header thông tin đơn hàng */}
        <div style={{
            background: "#f6f8fa",
            padding: "8px 12px",
            borderRadius: 6,
            marginBottom: 12,
            border: "1px solid #e1e4e8"
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                }}>
                    {record.orderType === "dine-in" ? (
                        <ShopOutlined style={{ color: "#1890ff", fontSize: 14 }} />
                    ) : (
                        <CarryOutOutlined style={{ color: "#52c41a", fontSize: 14 }} />
                    )}
                    <span style={{
                        fontWeight: 600,
                        color: "#262626",
                        fontSize: 14
                    }}>
                        Bàn {record.tableNumber}
                    </span>
                    <Tag
                        color={record.orderType === "dine-in" ? "blue" : "green"}
                        style={{ margin: 0, fontSize: 11 }}
                    >
                        {record.orderType === "dine-in" ? "Tại chỗ" : "Mang về"}
                    </Tag>
                </div>
            </div>
            <div style={{
                fontSize: 12,
                color: "#666",
                fontWeight: 500
            }}>
                🕐 {createdAt
                ? dayjs(createdAt.toDate?.() || createdAt).format("HH:mm:ss DD/MM/YYYY")
                : ""}
            </div>
        </div>

        {/* Danh sách món */}
        <div style={{ paddingLeft: 8 }}>
            {(items || []).map((item, idx) => (
                <div
                    key={idx}
                    style={{
                        marginBottom: 12,
                        padding: "8px 12px",
                        background: "#fff",
                        border: "1px solid #f0f0f0",
                        borderRadius: 6,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
                    }}
                >
                    {/* Tên món và thông tin cơ bản */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: item.toppings?.length > 0 || item.customerNote ? 6 : 0
                    }}>
                        <div style={{ flex: 1 }}>
                            <span style={{
                                fontWeight: 600,
                                color: "#262626",
                                fontSize: 14
                            }}>
                                {item.name}
                            </span>
                            {item.size && (
                                <span style={{
                                    color: "#1890ff",
                                    marginLeft: 8,
                                    fontSize: 12,
                                    fontWeight: 500
                                }}>
                                    ({item.size})
                                </span>
                            )}
                        </div>
                        {item.quantity && (
                            <Badge
                                count={item.quantity}
                                style={{
                                    backgroundColor: "#1890ff",
                                    fontSize: 12,
                                    fontWeight: 600
                                }}
                            />
                        )}
                    </div>

                    {/* Topping */}
                    {item.toppings && item.toppings.length > 0 && (
                        <div style={{
                            marginBottom: item.customerNote ? 6 : 0,
                            padding: "4px 8px",
                            background: "#f9f9f9",
                            borderRadius: 4,
                            fontSize: 12
                        }}>
                            <span style={{ color: "#666", fontWeight: 500 }}>🧋 Topping: </span>
                            <span style={{ color: "#595959" }}>
                                {item.toppings.map(t => `${t.name}${t.quantity > 1 ? ` x${t.quantity}` : ""}`).join(", ")}
                            </span>
                        </div>
                    )}

                    {/* Ghi chú khách hàng */}
                    {item.customerNote && (
                        <div style={{
                            padding: "6px 8px",
                            background: "#fff1f0",
                            border: "1px solid #ffccc7",
                            borderLeft: "3px solid #ff4d4f",
                            borderRadius: 4,
                            fontSize: 12
                        }}>
                            <span style={{
                                color: "#ff4d4f",
                                fontWeight: 600,
                                marginRight: 6
                            }}>
                                📝 Ghi chú:
                            </span>
                            <span style={{
                                color: "#cf1322",
                                fontWeight: 500
                            }}>
                                {item.customerNote}
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

// Hàm gọi modal xác nhận hoàn thành đơn
const showConfirmFinishOrder = (record, onFinishOrder) => {
    Modal.confirm({
        centered:true,
        title: (
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 16,
                fontWeight: 600
            }}>
                <CheckOutlined style={{ color: "#52c41a" }} />
                Xác nhận hoàn thành đơn
            </div>
        ),
        content: (
            <div>
                <div style={{
                    padding: "12px 16px",
                    background: "#f6f8fa",
                    borderRadius: 6,
                    marginBottom: 16,
                    fontSize: 14,
                    color: "#262626"
                }}>
                    Bạn có chắc chắn muốn hoàn thành đơn hàng này?
                </div>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {renderOrderItems(record.items, record.createdAt, record)}
                </div>
            </div>
        ),
        okText: "✅ Hoàn thành",
        cancelText: "❌ Hủy",
        okButtonProps: {
            style: {
                background: "#52c41a",
                borderColor: "#52c41a",
                fontWeight: 600
            }
        },
        cancelButtonProps: {
            style: {
                fontWeight: 600
            }
        },
        width: 600,
        onOk: async () => {
            onFinishOrder(record.id);
        }
    });
};

const PendingOrderModal = ({ open, onClose, orders, onFinishOrder }) => (
    <Modal
        open={open}
        onCancel={onClose}
        title={
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 18,
                fontWeight: 600,
                color: "#262626"
            }}>
                <TransactionOutlined style={{ color: "#1890ff" }} />
                Đơn chờ xử lý
                <Badge
                    count={orders?.filter(order => order.status === "processing")?.length || 0}
                    style={{
                        backgroundColor: "#ff4d4f",
                        fontSize: 12,
                        fontWeight: 600
                    }}
                />
            </div>
        }
        footer={null}
        width={900}
        styles={{
            body: {
                maxHeight: "70vh",
                overflowY: "auto",
                padding: "16px"
            }
        }}
    >
        <Table
            dataSource={
                [...orders]
                    .filter(order => order.status === "processing")
                    .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
            }
            rowKey="id"
            size="small"
            showHeader={false}
            pagination={false}
            scroll={{ x: true }}
            style={{
                background: "#fff",
                borderRadius: 8
            }}
            columns={[
                {
                    title: "Thông tin đơn hàng",
                    dataIndex: "items",
                    render: (items, record) => renderOrderItems(items, record.createdAt, record)
                },
                {
                    title: "Thao tác",
                    dataIndex: "id",
                    width: 80,
                    align: "center",
                    render: (id, record) =>
                        record.status === "processing" ? (
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<CheckOutlined />}
                                size="large"
                                style={{
                                    background: "#52c41a",
                                    borderColor: "#52c41a",
                                    boxShadow: "0 2px 8px rgba(82, 196, 26, 0.3)",
                                    width: 48,
                                    height: 48
                                }}
                                onClick={() => showConfirmFinishOrder(record, onFinishOrder)}
                            />
                        ) : (
                            <span style={{
                                color: "#52c41a",
                                fontSize: 24,
                                fontWeight: 600
                            }}>
                                ✓
                            </span>
                        )
                }
            ]}
        />

        {orders?.filter(order => order.status === "processing")?.length === 0 && (
            <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#999",
                fontSize: 16
            }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <div style={{ fontWeight: 500 }}>Không có đơn hàng nào đang chờ xử lý</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Tất cả đơn hàng đã được hoàn thành!</div>
            </div>
        )}
    </Modal>
);

export default PendingOrderModal;
