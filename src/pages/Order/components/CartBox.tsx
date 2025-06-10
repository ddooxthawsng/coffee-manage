import React, {useEffect, useState} from "react";
import {Badge, Button, Select, Tooltip} from "antd";
import {CloseCircleOutlined, DollarOutlined, MobileOutlined, ShoppingCartOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import CartItemList from "./CartItemList";

function isPromotionValidByDate(promo) {
    if (!promo) return false;
    const now = dayjs();
    if (promo.startDate && now.isBefore(dayjs(promo.startDate))) return false;
    if (promo.endDate && now.isAfter(dayjs(promo.endDate).endOf("day")))
        return false;
    return true;
}

function isPromotionUsable(promo, total) {
    return promo && isPromotionValidByDate(promo) && (!promo.minOrder || total >= promo.minOrder);
}

const CartBox = ({
                     cart,
                     promotions,
                     selectedPromotion,
                     setSelectedPromotion,
                     changeQty,
                     removeItem,
                     total,
                     handleCheckout,
                     handleCheckoutQR,
                     setShowDrawer,
                     setShowQR,
                     loading,
                     isMobile,
                     onEditTopping,
                     isLandscape
                 }) => {
    const [collapsed, setCollapsed] = useState(isMobile && !isLandscape);

    useEffect(() => {
        setCollapsed(isMobile && !isLandscape);
    }, [isMobile,isLandscape]);

    // Tính discount và finalTotal
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

    const validPromotions = Array.isArray(promotions)
        ? promotions.filter(p => isPromotionValidByDate(p))
        : [];

    const handleCheckoutWithPromo = () => {
        handleCheckout({
            promotion: promotionInfo,
            discount: discount || 0,
            finalTotal,
        });
    };

    const handleCheckoutQRWithPromo = () => {
        handleCheckoutQR({
            promotion: promotionInfo,
            discount: discount || 0,
            finalTotal,
        });
    };

    return (
        <div
            className="cartbox"
            style={isMobile ? {
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 2px 12px #0001",
                padding: 0,
                width: "100%",
                maxWidth: 420,
                minWidth: 0,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                height:"100%"
            } :  {
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 2px 12px #0001",
                padding: 0,
                width: "100%",
                maxWidth: 420,
                minWidth: 0,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                height:"100%"
            }}
        >
            {/* Khuyến mãi: chỉ hiển thị khi đã chọn */}
            {/*{selectedPromotion && (*/}
            <div style={{
                padding: "14px 20px 4px 20px",
                display: "flex",
                alignItems: "center",
                gap: 8
            }}>
                <span style={{fontWeight: 500, fontSize: 15, minWidth: 70}}>Khuyến mãi:</span>
                <Select
                    style={{minWidth: 140, flex: 1, height: "30px"}}
                    value={selectedPromotion?.id}
                    onChange={id => {
                        const promo = promotions.find(p => p.id === id);
                        if (promo && !isPromotionValidByDate(promo)) {
                            setSelectedPromotion(null);
                            return;
                        }
                        setSelectedPromotion(promo);
                    }}
                    allowClear
                    clearIcon={<CloseCircleOutlined style={{color: "#ff4d4f", fontSize: 20, height: "100%"}}/>}
                    placeholder="Chọn khuyến mãi"
                    size="small"
                >
                    {validPromotions.map(p => (
                        <Select.Option key={p.id} value={p.id}>
                            {p.name} {p.type === "percent" ? `(-${p.value}%)` : `(-${p.value.toLocaleString()}đ)`}
                            {p.minOrder ? ` (Từ ${p.minOrder.toLocaleString()}đ)` : ""}
                        </Select.Option>
                    ))}
                </Select>
            </div>
            {/*)}*/}

            {/* Dòng tổng tiền + icon giỏ hàng */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "2px 20px 2px 20px",
                fontSize: 15
            }}>
                <div>
                    Tạm tính: {(total - (discount ?? 0))?.toLocaleString()} đ (Giảm: -{discount?.toLocaleString()} đ)
                </div>
                <div style={{display: "flex", alignItems: "center", gap: 4}}>
                    <Tooltip title={collapsed ? "Xem chi tiết giỏ hàng" : "Thu gọn giỏ hàng"}>
                        <Badge count={cart.length} size="small" style={{background: "#1890ff"}}>
                            <Button
                                type="text"
                                icon={<ShoppingCartOutlined/>}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{fontSize: 20, color: "#1890ff", padding: 0}}
                            />
                        </Badge>
                    </Tooltip>
                </div>
            </div>

            {/* Danh sách món: chỉ hiển thị khi không collapse */}
            {!collapsed && (
                <div
                    style={{
                        height: "100%",
                        minHeight: 0,
                        overflowY: "auto",
                        padding: "0 20px",
                        background: "#fff" // hoặc màu phù hợp
                    }}
                >
                    <CartItemList
                        cart={cart}
                        changeQty={changeQty}
                        removeItem={removeItem}
                        onEditTopping={onEditTopping}
                    />
                </div>
            )}

            {/* 2 nút thanh toán trên 1 dòng, icon + text nhỏ */}
            <div style={{
                borderTop: "1px solid #f0f0f0",
                background: "#fff",
                padding: "16px 20px 12px 20px",
                display: "flex",
                gap: 10
            }}>
                <Button
                    type="primary"
                    block
                    size="large"
                    style={{
                        fontWeight: 600,
                        borderRadius: 8,
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        fontSize: 15,
                        padding: "0 8px"
                    }}
                    onClick={handleCheckoutWithPromo}
                    disabled={cart.length === 0 || loading}
                    loading={loading}
                >
                    <DollarOutlined/>
                    <span style={{fontSize: 14}}>Tiền mặt</span>
                </Button>
                <Button
                    block
                    size="large"
                    style={{
                        fontWeight: 600,
                        borderRadius: 8,
                        flex: 1,
                        background: "#52c41a",
                        color: "#fff",
                        borderColor: "#52c41a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        fontSize: 15,
                        padding: "0 8px"
                    }}
                    onClick={handleCheckoutQRWithPromo}
                    disabled={cart.length === 0 || loading}
                >
                    <MobileOutlined/>
                    <span style={{fontSize: 14}}>QR</span>
                </Button>
            </div>
        </div>
    );
};

export default CartBox;
