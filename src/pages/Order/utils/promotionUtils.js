import dayjs from "dayjs";

export function isPromotionValidByDate(promo) {
    if (!promo) return false;
    const now = dayjs();
    if (promo.startDate && now.isBefore(dayjs(promo.startDate))) return false;
    if (promo.endDate && now.isAfter(dayjs(promo.endDate).endOf("day"))) return false;
    return true;
}

export function isPromotionUsable(promo, total) {
    return promo && isPromotionValidByDate(promo) && (!promo.minOrder || total >= promo.minOrder);
}

export function calculateDiscount(selectedPromotion, cart, total) {
    if (!selectedPromotion || !isPromotionValidByDate(selectedPromotion)) {
        return {
            discount: 0,
            promotionInfo: null,
            finalTotal: total,
            freeItems: [],
            discountDetails: null
        };
    }

    if (selectedPromotion.promotionType === "buyXGetY") {
        return calculateBuyXGetYDiscount(selectedPromotion, cart, total);
    } else {
        return calculateRegularDiscount(selectedPromotion, total);
    }
}

function calculateRegularDiscount(promo, total) {
    console.log("=== REGULAR DISCOUNT ===");
    if (!promo.minOrder || total >= promo.minOrder) {
        let discount = promo.type === "percent"
            ? Math.round((total * Number(promo.value || 0)) / 100)
            : Number(promo.value || 0);

        // Áp dụng giới hạn giảm tối đa
        if (promo.maxDiscount && promo.maxDiscount > 0) {
            discount = Math.min(discount, Number(promo.maxDiscount));
        }

        console.log("Regular discount calculated:", discount, "Max discount:", promo.maxDiscount);
        return {
            discount,
            promotionInfo: promo,
            finalTotal: Math.max(0, total - discount),
            freeItems: [],
            discountDetails: {
                type: 'regular',
                description: promo.type === "percent"
                    ? `Giảm ${promo.value}%${promo.maxDiscount ? ` (tối đa ${Number(promo.maxDiscount).toLocaleString()}đ)` : ''}`
                    : `Giảm ${Number(promo.value).toLocaleString()}đ`,
                isLimited: !!(promo.maxDiscount && promo.maxDiscount > 0 && promo.type === "percent")
            }
        };
    }

    return {
        discount: 0,
        promotionInfo: null,
        finalTotal: total,
        freeItems: [],
        discountDetails: null
    };
}


function calculateBuyXGetYDiscount(promo, cart, total) {
    console.log("=== BUY X GET Y DISCOUNT ===");
    console.log("Promotion:", promo);

    const { buyQuantity, freeQuantity, isAccumulative = true } = promo;
    console.log(`Buy ${buyQuantity} Get ${freeQuantity}, Accumulative: ${isAccumulative}`);

    // Lọc các món không phải topping và có quantity > 0
    const eligibleItems = cart.filter(item =>
        item.category !== "Topping" &&
        item.quantity > 0
    );

    if (eligibleItems.length === 0) {
        return {
            discount: 0,
            promotionInfo: null,
            finalTotal: total,
            freeItems: [],
            discountDetails: {
                type: 'buyXGetY',
                description: `Không có món nào đủ điều kiện`,
                currentQuantity: 0,
                requiredQuantity: buyQuantity + freeQuantity
            }
        };
    }

    // Tạo danh sách tất cả món với giá đơn vị
    const allItemsWithPrice = [];
    eligibleItems.forEach(item => {
        const unitPrice = item.price + (item.toppingTotal || 0);
        for (let i = 0; i < item.quantity; i++) {
            allItemsWithPrice.push({
                ...item,
                unitPrice,
                originalIndex: allItemsWithPrice.length,
                itemId: `${item.key}_${i}`
            });
        }
    });

    const totalEligibleQuantity = allItemsWithPrice.length;
    const itemsPerSet = buyQuantity + freeQuantity;

    let applicableSets;
    if (isAccumulative) {
        // Lũy kế: áp dụng nhiều lần
        applicableSets = Math.floor(totalEligibleQuantity / itemsPerSet);
    } else {
        // Không lũy kế: chỉ áp dụng 1 lần
        applicableSets = totalEligibleQuantity >= itemsPerSet ? 1 : 0;
    }

    console.log(`Items per set: ${itemsPerSet}, Applicable sets: ${applicableSets}, Accumulative: ${isAccumulative}`);

    if (applicableSets === 0) {
        return {
            discount: 0,
            promotionInfo: promo,
            finalTotal: total,
            freeItems: [],
            discountDetails: {
                type: 'buyXGetY',
                description: `Cần ${itemsPerSet} món để được tặng ${freeQuantity} món`,
                currentQuantity: totalEligibleQuantity,
                requiredQuantity: itemsPerSet
            }
        };
    }

    // Tổng số món được tặng
    const totalFreeItems = applicableSets * freeQuantity;

    // Sắp xếp theo giá từ thấp đến cao để tặng những món rẻ nhất
    allItemsWithPrice.sort((a, b) => a.unitPrice - b.unitPrice);

    // Lấy những món rẻ nhất để tặng
    const freeItems = allItemsWithPrice.slice(0, totalFreeItems);
    let discount = freeItems.reduce((sum, item) => sum + item.unitPrice, 0);

    // Áp dụng giới hạn giảm tối đa
    if (promo.maxDiscount && promo.maxDiscount > 0) {
        discount = Math.min(discount, Number(promo.maxDiscount));
    }

    return {
        discount,
        promotionInfo: promo,
        finalTotal: Math.max(0, total - discount),
        freeItems,
        discountDetails: {
            type: 'buyXGetY',
            description: `Mua ${buyQuantity} tặng ${freeQuantity}${!isAccumulative ? ' (không lũy kế)' : ` (áp dụng ${applicableSets} lần)`}${promo.maxDiscount ? ` - Giảm tối đa ${Number(promo.maxDiscount).toLocaleString()}đ` : ''}`,
            freeItemsCount: totalFreeItems,
            applicableSets,
            currentQuantity: totalEligibleQuantity,
            requiredQuantity: itemsPerSet,
            isAccumulative,
            isLimited: !!(promo.maxDiscount && promo.maxDiscount > 0)
        }
    };
}

export function getPromotionDisplayText(promo) {
    if (!promo) return "";

    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) return '0';
        return Number(value).toLocaleString();
    };

    if (promo.promotionType === "buyXGetY") {
        return `${promo.code} (Mua ${promo.buyQuantity || 0} tặng ${promo.freeQuantity || 0})`;
    } else {
        const discountText = promo.type === "percent"
            ? `(-${promo.value || 0}%)`
            : `(-${formatCurrency(promo.value)}đ)`;
        return `${promo.code} ${discountText}`;
    }
}
