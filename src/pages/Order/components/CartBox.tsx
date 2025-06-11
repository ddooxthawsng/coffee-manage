import React, {useEffect, useState} from "react";
import {Badge, Button, Select, Tooltip, Alert} from "antd";
import {CloseCircleOutlined, DollarOutlined, MobileOutlined, ShoppingCartOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import CartItemList from "./CartItemList";
import { calculateDiscount, isPromotionValidByDate, getPromotionDisplayText } from "../utils/promotionUtils";

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

    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) return '0';
        return Number(value).toLocaleString();
    };

    useEffect(() => {
        setCollapsed(isMobile && !isLandscape);
    }, [isMobile, isLandscape]);

    // Sử dụng logic tính toán từ promotionUtils
    const { discount, promotionInfo, finalTotal, discountDetails } = calculateDiscount(selectedPromotion, cart, total);

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
            {/* Khuyến mãi */}
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
                            {getPromotionDisplayText(p)}
                            {p.minOrder ? ` (Từ ${formatCurrency(p.minOrder)}đ)` : ""}
                            {p.startDate ? ` [${dayjs(p.startDate).format("DD/MM")}` : ""}
                            {p.endDate ? ` - ${dayjs(p.endDate).format("DD/MM")}]` : (p.startDate ? "]" : "")}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {/* Hiển thị thông báo khuyến mãi */}
            {selectedPromotion && discountDetails && (
                <div style={{ padding: "0 20px 8px 20px" }}>
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
                    ) : null}
                </div>
            )}

            {/* Hiển thị cảnh báo nếu chưa đủ điều kiện minOrder */}
            {selectedPromotion && selectedPromotion.minOrder > 0 && total < selectedPromotion.minOrder && (
                <div style={{
                    padding: "0 20px 8px 20px",
                    color: "#faad14",
                    fontSize: 13,
                    fontWeight: 500
                }}>
                    Khuyến mãi này áp dụng cho đơn từ {formatCurrency(selectedPromotion.minOrder)}đ
                </div>
            )}

            {/* Dòng tổng tiền - HIỂN THỊ ĐÚNG */}
            <div style={{
                padding: "2px 20px 2px 20px",
                fontSize: 14
            }}>
                {/* Tạm tính */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 2
                }}>
                    <span>Tạm tính:</span>
                    <span style={{ fontWeight: 500 }}>{formatCurrency(total)}đ</span>
                </div>

                {/* Giảm giá */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 2
                }}>
                    <span>Giảm giá:</span>
                    <span style={{ color: "#faad14" }}>-{formatCurrency(discount)}đ</span>
                </div>

                {/* Thanh toán */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#1890ff",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 4
                }}>
                    <span>Thanh toán:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span>{formatCurrency(finalTotal)}đ</span>
                        <Tooltip title={collapsed ? "Xem chi tiết giỏ hàng" : "Thu gọn giỏ hàng"}>
                            <Badge count={cart.length} size="small" style={{background: "#1890ff"}}>
                                <Button
                                    type="text"
                                    icon={<ShoppingCartOutlined/>}
                                    onClick={() => setCollapsed(!collapsed)}
                                    style={{fontSize: 18, color: "#1890ff", padding: 0}}
                                />
                            </Badge>
                        </Tooltip>
                    </div>
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
                        background: "#fff"
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

            {/* 2 nút thanh toán */}
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
