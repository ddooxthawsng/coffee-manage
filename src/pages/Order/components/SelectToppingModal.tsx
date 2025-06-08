import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Button } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";

const SelectToppingModal = ({
                                open,
                                onClose,
                                menuItem,
                                toppingList,
                                onConfirm,
                                isEdit
                            }) => {
    const [selectedToppings, setSelectedToppings] = useState([]);

    useEffect(() => {
        if (!open || !menuItem) return;
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
    }, [open, menuItem, isEdit, toppingList]);

    if (!open || !menuItem || !toppingList || toppingList.length === 0) {
        return null;
    }

    const handleOk = () => {
        onConfirm(selectedToppings.filter(t => t.quantity > 0));
        setSelectedToppings([]);
    };

    const handleQtyChange = (id, qty) => {
        setSelectedToppings(selectedToppings.map(t =>
            t.id === id ? { ...t, quantity: Math.max(0, qty) } : t
        ));
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            title={`Chỉnh topping cho ${menuItem.name} (${menuItem.size || menuItem.selectedSize?.size})`}
            okText="Cập nhật"
            destroyOnClose
        >
            <div>
                <Row gutter={8}>
                    {selectedToppings.map(t => (
                        <Col span={24} key={t.id} style={{ marginBottom: 12 }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: "#f6f7fa",
                                borderRadius: 8,
                                padding: "8px 12px"
                            }}>
                                <span style={{ fontWeight: 500 }}>
                                    {t.name} <span style={{ color: "#1890ff" }}>(+{t.sizes?.[0]?.price?.toLocaleString() || 0}đ)</span>
                                </span>
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Button
                                        size="small"
                                        icon={<MinusOutlined />}
                                        onClick={() => handleQtyChange(t.id, t.quantity - 1)}
                                        disabled={t.quantity <= 0}
                                        style={{ borderRadius: "50%" }}
                                    />
                                    <span style={{
                                        minWidth: 28,
                                        textAlign: "center",
                                        fontSize: 18,
                                        fontWeight: 600,
                                        color: t.quantity > 0 ? "#1890ff" : "#888"
                                    }}>
                                        {t.quantity}
                                    </span>
                                    <Button
                                        size="small"
                                        icon={<PlusOutlined />}
                                        onClick={() => handleQtyChange(t.id, t.quantity + 1)}
                                        style={{ borderRadius: "50%" }}
                                    />
                                </span>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>
        </Modal>
    );
};

export default SelectToppingModal;
