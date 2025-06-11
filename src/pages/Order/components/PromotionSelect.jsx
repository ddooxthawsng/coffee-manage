import React from "react";
import { Select, message } from "antd";
import dayjs from "dayjs";
import { isPromotionValidByDate, getPromotionDisplayText } from "../utils/promotionUtils";

const PromotionSelect = ({
                             promotions,
                             selectedPromotion,
                             setSelectedPromotion,
                             total
                         }) => {
    const validPromotions = Array.isArray(promotions)
        ? promotions.filter(p => isPromotionValidByDate(p))
        : [];

    const handleSelectPromotion = id => {
        const promo = promotions.find(p => p.id === id);
        if (promo && !isPromotionValidByDate(promo)) {
            let msg = "Khuyến mãi không hợp lệ.";
            const now = dayjs();
            if (promo.startDate && now.isBefore(dayjs(promo.startDate))) {
                msg = `Khuyến mãi này chỉ áp dụng từ ngày ${dayjs(promo.startDate).format("DD/MM/YYYY")}`;
            } else if (promo.endDate && now.isAfter(dayjs(promo.endDate))) {
                msg = `Khuyến mãi này đã hết hạn từ ngày ${dayjs(promo.endDate).format("DD/MM/YYYY")}`;
            }
            message.warning(msg);
            setSelectedPromotion(null);
            return;
        }
        setSelectedPromotion(promo);
    };

    return (
        <Select
            style={{ minWidth: 140, flex: 1 }}
            value={selectedPromotion ? selectedPromotion.id : undefined}
            onChange={handleSelectPromotion}
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
    );
};

export default PromotionSelect;
