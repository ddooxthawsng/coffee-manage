import React from "react";
import { Drawer, Button, Tag } from "antd";
import { DeleteOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";

interface Props {
    cart: any[];
    showDrawer: boolean;
    setShowDrawer: (open: boolean) => void;
    changeQty: (key: string, qty: number) => void;
    removeItem: (key: string) => void;
}
const DrawerCart: React.FC<Props> = ({
                                         cart, showDrawer, setShowDrawer, changeQty, removeItem
                                     }) => (
    <Drawer
        title="Chi tiết giỏ hàng"
        placement="right"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        width={340}
    >
        {cart.length === 0 ? (
            <div className="text-gray-500 text-center">Chưa có món nào</div>
        ) : (
            cart.map((c) => (
                <div key={c.key} className="flex items-center justify-between mb-2">
          <span>
            <Tag color="blue" style={{ marginRight: 6, fontWeight: 600, fontSize: 15 }}>{c.size}</Tag>
              {c.name}
          </span>
                    <span>
            <Button size="small" icon={<MinusOutlined />} onClick={() => changeQty(c.key, c.quantity - 1)} />
            <span className="mx-1">{c.quantity}</span>
            <Button size="small" icon={<PlusOutlined />} onClick={() => changeQty(c.key, c.quantity + 1)} />
            <Button size="small" icon={<DeleteOutlined />} danger onClick={() => removeItem(c.key)} />
          </span>
                </div>
            ))
        )}
    </Drawer>
);
export default DrawerCart;
