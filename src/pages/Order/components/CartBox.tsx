import React from "react";
import { Badge, Button, Tag, Select } from "antd";
import { ShoppingCartOutlined, DeleteOutlined, PlusOutlined, MinusOutlined, CreditCardOutlined, QrcodeOutlined } from "@ant-design/icons";

interface Props {
    cart: any[];
    promotions: any[];
    selectedPromotion: any;
    setSelectedPromotion: (promo: any) => void;
    changeQty: (key: string, qty: number) => void;
    removeItem: (key: string) => void;
    total: number;
    discount: number;
    finalTotal: number;
    handleCheckout: () => void;
    setShowDrawer: (open: boolean) => void;
    setShowQR: (open: boolean) => void;
    loading: boolean;
    isMobile: boolean;
}
const CartBox: React.FC<Props> = ({
                                      cart, promotions, selectedPromotion, setSelectedPromotion,
                                      changeQty, removeItem, total, discount, finalTotal,
                                      handleCheckout, setShowDrawer, setShowQR, loading, isMobile
                                  }) => (
    <div
        style={{
            background: "#fff",
            borderRadius: isMobile ? "18px 18px 0 0" : 24,
            boxShadow: "0 2px 18px #2196f11a",
            padding: isMobile ? "12px 8px 10px 8px" : "28px 24px 20px 24px",
            minWidth: isMobile ? "100vw" : 340,
            maxWidth: isMobile ? "100vw" : 410,
            width: isMobile ? "100vw" : "100%",
            position: "static",
            left: 0,
            right: 0,
            bottom: isMobile ? 0 : "auto",
            zIndex: isMobile ? 100 : "auto",
            boxSizing: "border-box",
            margin: isMobile ? 0 : undefined,
            borderTop: isMobile ? "2px solid #e3eafc" : undefined,
        }}
    >
        <div style={{
            color: "#222",
            fontWeight: "bold",
            fontSize: isMobile ? 16 : 22,
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: isMobile ? 8 : 18,
        }}>
            <ShoppingCartOutlined />
            {!isMobile && <>Giỏ hàng <Badge count={cart.length} style={{ background: "#ff4d4f", marginLeft: 10 }} /></>}
            <Button type="primary" size={isMobile ? "small" : "middle"} style={{ marginLeft: "auto", fontSize: isMobile ? 12 : 14 }} onClick={() => setShowDrawer(true)}>
                {isMobile ? <ShoppingCartOutlined /> : "Xem chi tiết"}
            </Button>
        </div>
        <div style={{ marginBottom: isMobile ? 8 : 16 }}>
            <span style={{ fontWeight: 500, fontSize: isMobile ? 13 : 16 }}>Mã giảm giá:</span>
            <Select
                size={isMobile ? "small" : "middle"}
                value={selectedPromotion?.id}
                style={{ width: isMobile ? 120 : 200, marginLeft: 8 }}
                placeholder="Chọn mã"
                onChange={(id) => setSelectedPromotion(promotions.find(p => p.id === id))}
                allowClear
            >
                {promotions.map((promo) => (
                    <Select.Option key={promo.id} value={promo.id}>
                        {promo.code} - {promo.type === "percent" ? `${promo.value}%` : `${promo.value?.toLocaleString()}đ`}
                    </Select.Option>
                ))}
            </Select>
        </div>
        <div style={{
            maxHeight: isMobile ? 120 : 220,
            overflowY: "auto",
            marginBottom: isMobile ? 8 : 18,
            display: "flex",
            flexDirection: "column",
            gap: 0,
        }}>
            {cart.length === 0 ? (
                <div style={{ color: "#888", textAlign: "center", fontSize: isMobile ? 13 : 16 }}>Chưa có món nào</div>
            ) : (
                cart.map((c) => (
                    <div key={c.key} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        minHeight: isMobile ? 32 : 48,
                        borderBottom: "1px solid #f3f3f3",
                        paddingBottom: 4,
                        marginBottom: 4,
                        fontSize: isMobile ? 13 : 16
                    }}>
                        <span style={{
                            fontWeight: 500,
                            color: "#222",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            minWidth: 60,
                            flex: 1,
                        }}>
                            <Tag color="blue" style={{ marginRight: 4, fontWeight: 600, fontSize: isMobile ? 12 : 15 }}>{c.size}</Tag>
                            {c.name}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Button size="small" icon={<MinusOutlined />} style={{ minWidth: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => changeQty(c.key, c.quantity - 1)} />
                            <span style={{ width: 20, textAlign: "center", fontWeight: 600 }}>{c.quantity}</span>
                            <Button size="small" icon={<PlusOutlined />} style={{ minWidth: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => changeQty(c.key, c.quantity + 1)} />
                            <span style={{ fontWeight: "bold", color: "#1890ff", minWidth: isMobile ? 40 : 80, textAlign: "right", marginLeft: 3 }}>
                                {(c.price * c.quantity).toLocaleString()}đ
                            </span>
                            <Button size="small" icon={<DeleteOutlined />} danger style={{ minWidth: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => removeItem(c.key)} />
                        </span>
                    </div>
                ))
            )}
        </div>
        <div style={{ marginTop: 0 }}>
            <div style={{ fontSize: isMobile ? 15 : 22, fontWeight: "bold", color: "#1890ff", textAlign: "right" }}>
                Tổng: {total.toLocaleString()}đ
                {discount > 0 && <span style={{ color: "#43a047", fontSize: isMobile ? 12 : 16, marginLeft: 6 }}>{`- ${discount.toLocaleString()}đ`}</span>}
            </div>
            {discount > 0 && (
                <div style={{ color: "#d32f2f", fontSize: isMobile ? 15 : 22, fontWeight: "bold", textAlign: "right", marginTop: 2 }}>
                    Còn lại: {finalTotal.toLocaleString()}đ
                </div>
            )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 12, marginTop: isMobile ? 8 : 24 }}>
            <Button
                type="primary"
                className="w-full"
                size={isMobile ? "small" : "large"}
                style={{ padding: isMobile ? "8px 0" : "13px 0", fontSize: isMobile ? 14 : 18, fontWeight: "bold", borderRadius: 14, background: "#52c41a", border: "none", color: "#fff" }}
                onClick={handleCheckout}
                loading={loading}
            >
                <CreditCardOutlined /> Thanh toán
            </Button>
            <Button
                type="primary"
                className="w-full"
                size={isMobile ? "small" : "large"}
                style={{ background: "#1890ff", padding: isMobile ? "8px 0" : "13px 0", fontSize: isMobile ? 14 : 18, fontWeight: "bold", borderRadius: 14, border: "none", color: "#fff" }}
                onClick={() => setShowQR(true)}
                disabled={cart.length === 0}
            >
                <QrcodeOutlined /> QR
            </Button>
        </div>
    </div>
);

export default CartBox;
