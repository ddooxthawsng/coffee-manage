import React from "react";
import { Button, Select, Alert } from "antd";
import dayjs from "dayjs";
import { calculateDiscount, isPromotionValidByDate, getPromotionDisplayText } from "../utils/promotionUtils";

const CartFooter = ({
                        promotions,
                        selectedPromotion,
                        setSelectedPromotion,
                        total,
                        handleCheckout,
                        handleCheckoutQR,
                        loading,
                        cart
                    }) => {
    const validPromotions = Array.isArray(promotions)
        ? promotions.filter(p => isPromotionValidByDate(p))
        : [];

    const { discount, promotionInfo, finalTotal, discountDetails } = calculateDiscount(selectedPromotion, cart, total);
    const isCheckoutDisabled = cart?.length === 0 || loading;

    // Tạo payload cho checkout
    const checkoutPayload = {
        promotion: promotionInfo,
        discount,
        finalTotal,
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
                            {getPromotionDisplayText(p)}
                            {p.minOrder ? ` (Từ ${p.minOrder.toLocaleString()}đ)` : ""}
                            {p.startDate ? ` [${dayjs(p.startDate).format("DD/MM")}` : ""}
                            {p.endDate ? ` - ${dayjs(p.endDate).format("DD/MM")}]` : (p.startDate ? "]" : "")}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {/* Hiển thị thông báo khuyến mãi */}
            {selectedPromotion && discountDetails && (
                <div style={{ marginBottom: 8 }}>
                    {discountDetails.type === 'buyXGetY' && discount === 0 ? (
                        <Alert
                            message={`Cần ${discountDetails.requiredQuantity} món để được tặng ${selectedPromotion.freeQuantity} món (hiện có ${discountDetails.currentQuantity} món)`}
                            type="warning"
                            size="small"
                            showIcon
                        />
                    ) : discountDetails.type === 'buyXGetY' && discount > 0 ? (
                        <Alert
                            message={`${discountDetails.description} - Tặng ${discountDetails.freeItemsCount} món rẻ nhất`}
                            type="success"
                            size="small"
                            showIcon
                        />
                    ) : discountDetails.type === 'regular' && discountDetails.isLimited && discount > 0 ? (
                        <Alert
                            message={discountDetails.description}
                            type="success"
                            size="small"
                            showIcon
                        />
                    ) : null}
                </div>
            )}

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
                onClick={() => handleCheckout(checkoutPayload)}
                disabled={isCheckoutDisabled}
                loading={loading}
            >
                Thanh toán tiền mặt
            </Button>
            <Button
                block
                size="large"
                style={{ fontWeight: 600, borderRadius: 8 }}
                onClick={() => handleCheckoutQR(checkoutPayload)}
                disabled={isCheckoutDisabled}
            >
                Thanh toán QR
            </Button>
        </>
    );
};

export default CartFooter;
