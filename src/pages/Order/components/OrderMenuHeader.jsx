import React from "react";
import { Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const OrderMenuHeader = ({
                             categories,
                             activeCategory,
                             setActiveCategory,
                             onShowRecentInvoices,
                             children // nhận MenuTabs làm children để giữ cấu trúc cũ
                         }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {children}
        <Button
            icon={<EyeOutlined />}
            onClick={onShowRecentInvoices}
            type="default"
            style={{ marginLeft: 8 }}
        >
            Xem hóa đơn gần đây
        </Button>
    </div>
);

export default OrderMenuHeader;
