import React, {useEffect, useState} from "react";
import {Badge, Button, Select, Tooltip, Alert, Modal} from "antd";
import { DollarOutlined, MobileOutlined, ShoppingCartOutlined, EyeOutlined} from "@ant-design/icons";
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
    const [showCartModal, setShowCartModal] = useState(false);

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

    // Xử lý checkout từ modal
    const handleCheckoutFromModal = () => {
        setShowCartModal(false);
        handleCheckoutWithPromo();
    };

    const handleCheckoutQRFromModal = () => {
        setShowCartModal(false);
        handleCheckoutQRWithPromo();
    };

    return (
        <>
            <div className="flex flex-col h-full bg-white rounded-2xl shadow-md overflow-hidden">
                {/* Header - Khuyến mãi */}
                <div className="p-3 sm:p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="font-medium text-sm sm:text-base min-w-fit">Khuyến mãi:</span>
                        <Select
                            className="flex-1 min-w-0"
                            size="small"
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
                            placeholder="Chọn khuyến mãi"
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

                    {/* Thông báo khuyến mãi */}
                    {selectedPromotion && discountDetails && (
                        <div className="mb-2">
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

                    {/* Cảnh báo minOrder */}
                    {selectedPromotion && selectedPromotion.minOrder > 0 && total < selectedPromotion.minOrder && (
                        <div className="text-orange-500 text-xs sm:text-sm font-medium">
                            Khuyến mãi này áp dụng cho đơn từ {formatCurrency(selectedPromotion.minOrder)}đ
                        </div>
                    )}
                </div>

                {/* Summary - Luôn hiển thị */}
                <div className="p-3 sm:p-4 border-b border-gray-100">
                    {/* Tạm tính */}
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Tạm tính:</span>
                        <span className="font-medium text-sm">{formatCurrency(total)}đ</span>
                    </div>

                    {/* Giảm giá - chỉ hiển thị khi có */}
                    {discount > 0 && (
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Giảm giá:</span>
                            <span className="text-orange-500 text-sm font-medium">-{formatCurrency(discount)}đ</span>
                        </div>
                    )}

                    {/* Thanh toán */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="font-semibold text-base text-blue-600">Thanh toán:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-blue-600">{formatCurrency(finalTotal)}đ</span>
                            <div className="flex items-center gap-1">
                                <Tooltip title="Xem chi tiết giỏ hàng">
                                    <Badge count={cart.length} size="small">
                                        <Button
                                            type="text"
                                            icon={<EyeOutlined/>}
                                            onClick={() => setShowCartModal(true)}
                                            className="text-green-500 hover:text-green-600"
                                            size="small"
                                        />
                                    </Badge>
                                </Tooltip>
                                <Tooltip title={collapsed ? "Mở rộng giỏ hàng" : "Thu gọn giỏ hàng"}>
                                    <Badge count={cart.length} size="small">
                                        <Button
                                            type="text"
                                            icon={<ShoppingCartOutlined/>}
                                            onClick={() => setCollapsed(!collapsed)}
                                            className="text-blue-500 hover:text-blue-600"
                                            size="small"
                                        />
                                    </Badge>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danh sách món - Chỉ hiển thị khi không collapse */}
                {!collapsed && (
                    <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4" style={isMobile && !isLandscape ? {maxHeight:"50vh"} : {}}>
                        <CartItemList
                            cart={cart}
                            changeQty={changeQty}
                            removeItem={removeItem}
                            onEditTopping={onEditTopping}
                        />
                    </div>
                )}

                {/* Nút thanh toán - Luôn hiển thị ở cuối */}
                <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex gap-2">
                        <Button
                            type="primary"
                            size="large"
                            className="flex-1 h-12 font-semibold rounded-lg"
                            onClick={handleCheckoutWithPromo}
                            disabled={cart.length === 0 || loading}
                            loading={loading}
                        >
                            <DollarOutlined className="mr-1" />
                            Tiền mặt
                        </Button>
                        <Button
                            size="large"
                            className="flex-1 h-12 font-semibold rounded-lg bg-green-500 hover:bg-green-600 border-green-500 text-white"
                            onClick={handleCheckoutQRWithPromo}
                            disabled={cart.length === 0 || loading}
                        >
                            <MobileOutlined className="mr-1" />
                            QR
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal toàn màn hình */}
            <Modal
                title={
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Chi tiết giỏ hàng</span>
                        <Badge count={cart.length} size="small">
                            <ShoppingCartOutlined className="text-blue-500" />
                        </Badge>
                    </div>
                }
                open={showCartModal}
                onCancel={() => setShowCartModal(false)}
                footer={null}
                width="100vw"
                style={{
                    top: 0,
                    paddingBottom: 0,
                    maxWidth: '100vw'
                }}
                styles={{
                    body: {
                        height: 'calc(100vh - 110px)',
                        padding: 0,
                        overflow: 'hidden'
                    },
                    content: {
                        height: '100vh',
                        margin: 0,
                        borderRadius: 0
                    }
                }}
                destroyOnClose
            >
                <div className="flex flex-col h-full">
                    {/* Khuyến mãi section */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="font-medium text-base min-w-fit">Khuyến mãi:</span>
                            <Select
                                className="flex-1 min-w-0"
                                size="middle"
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
                                placeholder="Chọn khuyến mãi"
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

                        {/* Thông báo khuyến mãi */}
                        {selectedPromotion && discountDetails && (
                            <div className="mb-2">
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

                        {/* Cảnh báo minOrder */}
                        {selectedPromotion && selectedPromotion.minOrder > 0 && total < selectedPromotion.minOrder && (
                            <div className="text-orange-500 text-sm font-medium">
                                Khuyến mãi này áp dụng cho đơn từ {formatCurrency(selectedPromotion.minOrder)}đ
                            </div>
                        )}
                    </div>

                    {/* Danh sách món */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <CartItemList
                            cart={cart}
                            changeQty={changeQty}
                            removeItem={removeItem}
                            onEditTopping={onEditTopping}
                        />
                    </div>

                    {/* Summary và nút thanh toán */}
                    <div className="border-t border-gray-100 bg-white p-4">
                        {/* Tạm tính */}
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-base text-gray-600">Tạm tính:</span>
                            <span className="font-medium text-base">{formatCurrency(total)}đ</span>
                        </div>

                        {/* Giảm giá */}
                        {discount > 0 && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-base text-gray-600">Giảm giá:</span>
                                <span className="text-orange-500 text-base font-medium">-{formatCurrency(discount)}đ</span>
                            </div>
                        )}

                        {/* Thanh toán */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100 mb-4">
                            <span className="font-semibold text-xl text-blue-600">Thanh toán:</span>
                            <span className="font-bold text-2xl text-blue-600">{formatCurrency(finalTotal)}đ</span>
                        </div>

                        {/* Nút thanh toán */}
                        <div className="flex gap-3">
                            <Button
                                type="primary"
                                size="large"
                                className="flex-1 h-14 font-semibold rounded-lg text-lg"
                                onClick={handleCheckoutFromModal}
                                disabled={cart.length === 0 || loading}
                                loading={loading}
                            >
                                <DollarOutlined className="mr-2" />
                                Tiền mặt
                            </Button>
                            <Button
                                size="large"
                                className="flex-1 h-14 font-semibold rounded-lg bg-green-500 hover:bg-green-600 border-green-500 text-white text-lg"
                                onClick={handleCheckoutQRFromModal}
                                disabled={cart.length === 0 || loading}
                            >
                                <MobileOutlined className="mr-2" />
                                QR
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default CartBox;
