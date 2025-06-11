import React from "react";
import { Button, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";

const CartItemList = ({ cart, changeQty, removeItem, onEditTopping }) => (
    <>
        {cart?.length === 0 ? (
            <div style={{ color: "#888", textAlign: "center", padding: "20px 0" }}>
                Chưa có món nào
            </div>
        ) : (
            cart.map((c) => {
                const toppingDesc = c.toppings && c.toppings.length > 0
                    ? c.toppings
                        .filter(t => t.quantity > 0)
                        .map(t => `${t.name}${t.quantity > 1 ? ` x${t.quantity}` : ""} (+${(t.sizes?.[0]?.price || 0).toLocaleString()}đ)`)
                        .join(", ")
                    : null;
                const toppingTotal = c.toppingTotal || 0;
                const itemTotal = (c.price + toppingTotal) * c.quantity;

                return (
                    <div
                        key={c.key}
                        style={{
                            borderBottom: "1px solid #f0f0f0",
                            padding: "8px 0"
                        }}
                    >
                        {/* Dòng 1: Nút xóa + Tên món + size */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontWeight: 500,
                            fontSize: 16,
                        }}>
                            <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() => removeItem(c.key)}
                                style={{ minWidth: 24, height: 24, padding: 0 }}
                            />
                            <span style={{ flex: 1 }}>
                                <span style={{ fontWeight: 600 }}>{c.name}</span>
                                <span style={{ color: "#888", marginLeft: 5 }}>({c.size})</span>
                            </span>
                        </div>

                        {/* Dòng 2: Giá x Số lượng = Tổng, icon + - edit cùng dòng bên phải */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                            fontSize: 15,
                            margin: "2px 0"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ color: "#222", fontVariantNumeric: "tabular-nums" }}>
                                    {c.price.toLocaleString()}đ
                                </span>
                                <span style={{ color: "#888" }}>x</span>
                                <span style={{ color: "#222" }}>{c.quantity}</span>
                                <span style={{ color: "#888" }}>=</span>
                                <span style={{ color: "#fa8c16", fontWeight: 600 }}>
                                    {itemTotal.toLocaleString()}đ
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <Button
                                    size="small"
                                    icon={<MinusOutlined />}
                                    onClick={() => changeQty(c.key, c.quantity - 1)}
                                    style={{ borderRadius: 6, minWidth: 28, height: 28, padding: 0 }}
                                />
                                <Button
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={() => changeQty(c.key, c.quantity + 1)}
                                    style={{ borderRadius: 6, minWidth: 28, height: 28, padding: 0 }}
                                />
                                {c.category !== "Topping" && (
                                    <Tooltip title="Thêm/Chỉnh topping">
                                        <Button
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={() => onEditTopping(c)}
                                            style={{ borderRadius: 6, minWidth: 28, height: 28, padding: 0, marginLeft: 4 }}
                                        />
                                    </Tooltip>
                                )}
                            </div>
                        </div>

                        {/* Dòng 3: Topping nếu có */}
                        {toppingDesc && (
                            <div style={{
                                color: "#888",
                                fontSize: 13,
                                marginTop: 2
                            }}>
                                {toppingDesc}
                            </div>
                        )}
                    </div>
                );
            })
        )}
    </>
);

export default CartItemList;
