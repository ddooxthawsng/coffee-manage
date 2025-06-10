import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Button, Select, Divider, Input } from "antd";
import { PlusOutlined, MinusOutlined, EditOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const SelectToppingModal = ({
                                open,
                                onClose,
                                menuItem,
                                toppingList,
                                onConfirm,
                                isEdit,
                                menu
                            }) => {
    const [selectedToppings, setSelectedToppings] = useState([]);
    const [selectedSize, setSelectedSize] = useState(null);
    const [customerNote, setCustomerNote] = useState(""); // Thêm state cho ghi chú

    useEffect(() => {
        if (!open || !menuItem) return;

        // Khởi tạo size đã chọn
        if (isEdit && menuItem.size) {
            const originalMenuItem = menu?.find(m => m.id === menuItem.id);
            const sizeInfo = originalMenuItem?.sizes?.find(s => s.size === menuItem.size);
            setSelectedSize(sizeInfo || null);
        } else {
            setSelectedSize(null);
        }

        // Khởi tạo toppings
        if (isEdit && menuItem.toppings) {
            setSelectedToppings(
                toppingList.map(t => {
                    const exist = menuItem.toppings.find(mt => mt.id === t.id);
                    return {
                        ...t,
                        quantity: exist ? exist.quantity : 0
                    };
                })
            );
        } else {
            setSelectedToppings(
                toppingList.map(t => ({ ...t, quantity: 0 }))
            );
        }

        // Khởi tạo ghi chú từ món đã chọn (nếu có)
        if (isEdit && menuItem.customerNote) {
            setCustomerNote(menuItem.customerNote);
        } else {
            setCustomerNote("");
        }
    }, [open, menuItem, isEdit, toppingList, menu]);

    if (!open || !menuItem || !toppingList || toppingList.length === 0) {
        return null;
    }

    // Lấy thông tin món gốc từ menu để có danh sách sizes
    const originalMenuItem = menu?.find(m => m.id === menuItem.id);
    const availableSizes = originalMenuItem?.sizes || [];

    const handleOk = () => {
        const result = {
            toppings: selectedToppings.filter(t => t.quantity > 0),
            size: selectedSize,
            customerNote: customerNote.trim() // Thêm ghi chú vào kết quả
        };
        onConfirm(result);
        setSelectedToppings([]);
        setSelectedSize(null);
        setCustomerNote(""); // Reset ghi chú
    };

    const handleQtyChange = (id, qty) => {
        setSelectedToppings(selectedToppings.map(t =>
            t.id === id ? { ...t, quantity: Math.max(0, qty) } : t
        ));
    };

    const handleSizeChange = (value) => {
        const sizeInfo = availableSizes.find(s => s.size === value);
        setSelectedSize(sizeInfo);
    };

    // Tính tổng giá trị toppings
    const toppingTotal = selectedToppings.reduce(
        (sum, t) => sum + (t.sizes?.[0]?.price || 0) * t.quantity, 0
    );

    // Tính tổng giá món (size + toppings)
    const totalPrice = (selectedSize?.price || menuItem.price || 0) + toppingTotal;

    // Các gợi ý ghi chú phổ biến
    const commonNotes = [
        "Ít đường",
        "Nhiều đá",
        "Không đá",
        "Ít ngọt",
        "Nóng",
        "Pha loãng",
        "Đậm đà",
        "Thêm sữa",
        "Không sữa"
    ];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            title={`Chỉnh sửa: ${menuItem.name}`}
            okText="Cập nhật"
            cancelText="Hủy"
            destroyOnClose
            width={650}
            styles={{
                body: {
                    maxHeight: '75vh',
                    overflowY: 'auto'
                }
            }}
        >
            <div>
                {/* Phần chọn size */}
                {availableSizes.length > 0 && (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <h4 style={{ marginBottom: 8, color: "#262626", fontSize: 16 }}>
                                🥤 Chọn size:
                            </h4>
                            <Select
                                value={selectedSize?.size}
                                onChange={handleSizeChange}
                                style={{ width: "100%" }}
                                size="large"
                                placeholder="Chọn size"
                            >
                                {availableSizes.map(size => (
                                    <Option key={size.size} value={size.size}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <span style={{ fontWeight: 500 }}>{size.size}</span>
                                            <span style={{
                                                color: "#1890ff",
                                                fontWeight: 600
                                            }}>
                                                {size.price?.toLocaleString()}đ
                                            </span>
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <Divider style={{ margin: "16px 0" }} />
                    </>
                )}

                {/* Phần chọn toppings */}
                <div style={{ marginBottom: 16 }}>
                    <h4 style={{ marginBottom: 12, color: "#262626", fontSize: 16 }}>
                        🧋 Chọn topping:
                    </h4>
                    <Row gutter={8}>
                        {selectedToppings.map(t => (
                            <Col span={24} key={t.id} style={{ marginBottom: 12 }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: t.quantity > 0 ? "#e6f7ff" : "#f6f7fa",
                                    borderRadius: 8,
                                    padding: "12px 16px",
                                    border: t.quantity > 0 ? "1px solid #91d5ff" : "1px solid #f0f0f0",
                                    transition: "all 0.2s ease"
                                }}>
                                    <span style={{ fontWeight: 500, flex: 1 }}>
                                        {t.name}
                                        <span style={{
                                            color: "#1890ff",
                                            marginLeft: 8
                                        }}>
                                            (+{t.sizes?.[0]?.price?.toLocaleString() || 0}đ)
                                        </span>
                                    </span>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12
                                    }}>
                                        <Button
                                            size="middle"
                                            icon={<MinusOutlined />}
                                            onClick={() => handleQtyChange(t.id, t.quantity - 1)}
                                            disabled={t.quantity <= 0}
                                            style={{
                                                borderRadius: "50%",
                                                width: 36,
                                                height: 36
                                            }}
                                        />
                                        <span style={{
                                            minWidth: 32,
                                            textAlign: "center",
                                            fontSize: 18,
                                            fontWeight: 600,
                                            color: t.quantity > 0 ? "#1890ff" : "#888"
                                        }}>
                                            {t.quantity}
                                        </span>
                                        <Button
                                            size="middle"
                                            icon={<PlusOutlined />}
                                            onClick={() => handleQtyChange(t.id, t.quantity + 1)}
                                            style={{
                                                borderRadius: "50%",
                                                width: 36,
                                                height: 36
                                            }}
                                        />
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Phần ghi chú khách hàng */}
                <Divider style={{ margin: "16px 0" }} />
                <div style={{ marginBottom: 16 }}>
                    <h4 style={{ marginBottom: 12, color: "#262626", fontSize: 16 }}>
                        <EditOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                        Ghi chú yêu cầu:
                    </h4>

                    {/* Các gợi ý nhanh */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{
                            fontSize: 13,
                            color: "#666",
                            marginBottom: 8,
                            fontWeight: 500
                        }}>
                            Gợi ý nhanh:
                        </div>
                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6
                        }}>
                            {commonNotes.map(note => (
                                <Button
                                    key={note}
                                    size="small"
                                    type={customerNote.includes(note) ? "primary" : "default"}
                                    onClick={() => {
                                        if (customerNote.includes(note)) {
                                            // Nếu đã có, xóa bỏ
                                            setCustomerNote(customerNote.replace(note, "").replace(/,\s*,/g, ",").replace(/^,|,$/g, "").trim());
                                        } else {
                                            // Nếu chưa có, thêm vào
                                            const newNote = customerNote ? `${customerNote}, ${note}` : note;
                                            setCustomerNote(newNote);
                                        }
                                    }}
                                    style={{
                                        borderRadius: 12,
                                        fontSize: 12,
                                        height: 28
                                    }}
                                >
                                    {note}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Ô nhập ghi chú tự do */}
                    <TextArea
                        value={customerNote}
                        onChange={e => setCustomerNote(e.target.value)}
                        placeholder="Nhập yêu cầu đặc biệt của khách hàng..."
                        rows={3}
                        maxLength={200}
                        showCount
                        style={{
                            borderRadius: 8,
                            fontSize: 14
                        }}
                    />
                    <div style={{
                        fontSize: 12,
                        color: "#999",
                        marginTop: 6,
                        fontStyle: "italic"
                    }}>
                        💡 Ví dụ: "Ít đường, nhiều đá", "Nóng", "Thêm sữa tươi"...
                    </div>
                </div>

                {/* Hiển thị tổng giá */}
                <Divider style={{ margin: "16px 0" }} />
                <div style={{
                    background: "#f6f8fa",
                    padding: "16px",
                    borderRadius: 8,
                    border: "1px solid #e1e4e8"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span style={{ fontSize: 16, fontWeight: 500 }}>
                            Tổng giá:
                        </span>
                        <span style={{
                            fontSize: 20,
                            fontWeight: 600,
                            color: "#1890ff"
                        }}>
                            {totalPrice.toLocaleString()}đ
                        </span>
                    </div>
                    <div style={{
                        fontSize: 13,
                        color: "#666",
                        marginTop: 4
                    }}>
                        {selectedSize && `Size ${selectedSize.size}: ${selectedSize.price?.toLocaleString()}đ`}
                        {toppingTotal > 0 && ` + Topping: ${toppingTotal.toLocaleString()}đ`}
                        {customerNote && (
                            <div style={{
                                marginTop: 4,
                                color: "#1890ff",
                                fontWeight: 500
                            }}>
                                Ghi chú: {customerNote}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SelectToppingModal;
