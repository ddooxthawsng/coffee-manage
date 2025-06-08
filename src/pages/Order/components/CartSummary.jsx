import React from "react";

const CartSummary = ({ total, discount, finalTotal }) => (
    <>
        <div style={{
            marginBottom: 4,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 15
        }}>
            <span>Tạm tính:</span>
            <span style={{ fontWeight: 500 }}>
                {total.toLocaleString()} ₫
            </span>
        </div>
        <div style={{
            marginBottom: 4,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 15
        }}>
            <span>Giảm giá:</span>
            <span style={{ color: "#faad14" }}>
                -{discount.toLocaleString()} ₫
            </span>
        </div>
        <div style={{
            fontWeight: 700,
            fontSize: 18,
            color: "#1890ff",
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between"
        }}>
            <span>Thanh toán:</span>
            <span>{finalTotal.toLocaleString()} ₫</span>
        </div>
    </>
);

export default CartSummary;
