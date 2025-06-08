import React from "react";
import { Drawer, Button, Tag } from "antd";
import { DeleteOutlined, PlusOutlined, MinusOutlined, EditOutlined } from "@ant-design/icons";

const DrawerCart = ({
                        cart, showDrawer, setShowDrawer, changeQty, removeItem, onEditTopping
                    }) => (
    <Drawer
        title="Chi tiết giỏ hàng"
        placement="right"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        width={340}
    >
        {cart?.length === 0 ? (
            <div className="text-gray-500 text-center">Chưa có món nào</div>
        ) : (
            cart.map((c) => (
                <div key={c.key} className="flex flex-col gap-1 mb-3 border-b pb-2">
                    <div className="flex items-center justify-between">
                        <span>
                            <Tag color="blue" style={{ marginRight: 6, fontWeight: 600, fontSize: 15 }}>{c.size}</Tag>
                            {c.name}
                            {c.toppings && c.toppings.length > 0 && (
                                <span style={{ color: "#888", fontSize: 13 }}>
                                    {" + " + c.toppings
                                        .filter(t => t.quantity > 0)
                                        .map(t => `${t.name}${t.quantity > 1 ? ` x${t.quantity}` : ""}`)
                                        .join(", ")
                                    }
                                </span>
                            )}
                        </span>
                        <span>
                            <Button size="small" icon={<MinusOutlined />} onClick={() => changeQty(c.key, c.quantity - 1)} />
                            <span className="mx-1">{c.quantity}</span>
                            <Button size="small" icon={<PlusOutlined />} onClick={() => changeQty(c.key, c.quantity + 1)} />
                            <Button size="small" icon={<DeleteOutlined />} danger onClick={() => removeItem(c.key)} />
                        </span>
                    </div>
                    {c.category !== "Topping" && (
                        <div className="flex justify-end">
                            <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => onEditTopping(c)}
                                style={{ marginTop: 2 }}
                            >
                                Thêm/Chỉnh topping
                            </Button>
                        </div>
                    )}
                </div>
            ))
        )}
    </Drawer>
);

export default DrawerCart;
