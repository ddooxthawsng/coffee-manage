import React from "react";
import { Button, Select } from "antd";
import dayjs from "dayjs";

function isPromotionValidByDate(promo) {
    if (!promo) return false;
    const now = dayjs();
    if (promo.startDate && now.isBefore(dayjs(promo.startDate))) return false;
    if (promo.endDate && now.isAfter(dayjs(promo.endDate))) return false;
    return true;
}

function isPromotionUsable(promo, total) {
    return promo && isPromotionValidByDate(promo) && (!promo.minOrder || total >= promo.minOrder);
}

const CartFooter = ({
                        promotions,
                        selectedPromotion,
                        setSelectedPromotion,
                        total,
                        handleCheckout,
                        setShowQR,
                        loading,
                        cart
                    }) => {
    const validPromotions = Array.isArray(promotions)
        ? promotions.filter(p => isPromotionValidByDate(p))
        : [];

    let discount = 0;
    let promotionInfo = null;
    if (isPromotionUsable(selectedPromotion, total)) {
        discount =
            selectedPromotion.type === "percent"
                ? Math.round((total * selectedPromotion.value) / 100)
                : selectedPromotion.value;
        promotionInfo = selectedPromotion;
    }
    const finalTotal = Math.max(0, total - discount);

    const isCheckoutDisabled = cart?.length === 0 || loading;

    const handleCheckoutWithPromo = () => {
        handleCheckout({
            promotion: promotionInfo,
            discount,
            finalTotal,
        });
    };

    const handleCheckoutQRWithPromo = () => {
        setShowQR(true); // chỉ mở modal QR
    };

    return (
        <>
            <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 500 }}>Khuyến mãi:</span>
                <Select
                    style={{ minWidth: 140, flex: 1 }}
                    value={selectedPromotion ? selectedPromotion.id : undefined}
                    onChange={id => {
                        const promo = promotions.find(p => p.id === id);
                        if (promo && !isPromotionValidByDate(promo)) {
                            setSelectedPromotion(null);
                            return;
                        }
                        setSelectedPromotion(promo);
                    }}
                    allowClear
                    placeholder="Chọn khuyến mãi"
                    size="small"
                >
                    {validPromotions.map(p => (
                        <Select.Option key={p.id} value={p.id}>
                            {p.name} {p.type === "percent" ? `(-${p.value}%)` : `(-${p.value.toLocaleString()}đ)`}
                            {p.minOrder ? ` (Từ ${p.minOrder.toLocaleString()}đ)` : ""}
                            {p.startDate ? ` [${dayjs(p.startDate).format("DD/MM")}` : ""}
                            {p.endDate ? ` - ${dayjs(p.endDate).format("DD/MM")}]` : (p.startDate ? "]" : "")}
                        </Select.Option>
                    ))}
                </Select>
            </div>
            {selectedPromotion && selectedPromotion.minOrder && total < selectedPromotion.minOrder && (
                <div style={{ color: "#faad14", marginBottom: 8, fontWeight: 500 }}>
                    Khuyến mãi này áp dụng cho đơn từ {selectedPromotion.minOrder.toLocaleString()}đ. Hiện không được áp dụng.
                </div>
            )}
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
            <Button
                type="primary"
                block
                size="large"
                style={{ marginBottom: 10, fontWeight: 600, borderRadius: 8 }}
                onClick={handleCheckoutWithPromo}
                disabled={isCheckoutDisabled}
                loading={loading}
            >
                Thanh toán tiền mặt
            </Button>
            <Button
                block
                size="large"
                style={{ fontWeight: 600, borderRadius: 8 }}
                onClick={handleCheckoutQRWithPromo}
                disabled={isCheckoutDisabled}
            >
                Thanh toán QR
            </Button>
        </>
    );
};

export default CartFooter;
