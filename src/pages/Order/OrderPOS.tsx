import React, { useEffect, useState } from "react";
import MenuTabs from "./components/MenuTabs";
import MenuGrid from "./components/MenuGrid";
import CartBox from "./components/CartBox";
import DrawerCart from "./components/DrawerCart";
import QRModal from "./components/QRModal";
import { getMenus } from "../../services/menuService";
import { createInvoice, updateInvoiceStatus } from "../../services/invoiceService";
import { getQRCodes } from "../../services/qrcodeService";
import { getPromotions, getDefaultPromotion } from "../../services/promotionService";
import { Row, Col } from "antd";

const OrderPOS: React.FC = () => {
    // Responsive mobile: true nếu nhỏ hơn 900px
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 900);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [menu, setMenu] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [showDrawer, setShowDrawer] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [qrList, setQrList] = useState<any[]>([]);
    const [selectedQr, setSelectedQr] = useState<any>();
    const [invoiceId, setInvoiceId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Giảm giá
    const [promotions, setPromotions] = useState<any[]>([]);
    const [selectedPromotion, setSelectedPromotion] = useState<any>(null);

    // Tab loại menu
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("Tất cả");

    useEffect(() => {
        getMenus().then((menus) => {
            setMenu(menus);
            const cats = Array.from(new Set(menus.map((m: any) => m.category).filter(Boolean)));
            setCategories(["Tất cả", ...cats]);
        });
        getQRCodes().then(setQrList);
        getPromotions().then(setPromotions);
        getDefaultPromotion().then((promo) => {
            if (promo) setSelectedPromotion(promo);
        });
    }, []);

    // Thêm món vào giỏ
    const addToCart = (item: any, size: any) => {
        const key = item.id + "_" + size.size;
        const exist = cart.find((c) => c.key === key);
        if (exist) {
            setCart(cart.map((c) => (c.key === key ? { ...c, quantity: c.quantity + 1 } : c)));
        } else {
            setCart([
                ...cart,
                {
                    key,
                    id: item.id,
                    name: item.name,
                    size: size.size,
                    price: size.price,
                    quantity: 1,
                },
            ]);
        }
    };

    // Thay đổi số lượng trong giỏ
    const changeQty = (key: string, qty: number) => {
        setCart(
            cart
                .map((c) => (c.key === key ? { ...c, quantity: Math.max(1, qty) } : c))
                .filter((c) => c.quantity > 0)
        );
    };

    // Xoá món
    const removeItem = (key: string) => {
        setCart(cart.filter((c) => c.key !== key));
    };

    // Tổng tiền trước giảm giá
    const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

    // Tính số tiền giảm
    const discount = selectedPromotion
        ? selectedPromotion.type === "percent"
            ? Math.round((total * selectedPromotion.value) / 100)
            : selectedPromotion.value
        : 0;

    // Tổng tiền sau giảm giá
    const finalTotal = Math.max(0, total - discount);

    // Thanh toán thường (không QR)
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        await createInvoice({
            items: cart,
            total,
            discount,
            finalTotal,
            promotionId: selectedPromotion?.id || null,
            promotionCode: selectedPromotion?.code || null,
            status: "paid",
            createdAt: new Date(),
            paymentMethod: "cash",
        });
        setLoading(false);
        setCart([]);
    };

    // Thanh toán QR
    const handleCheckoutQR = async () => {
        if (cart.length === 0 || !selectedQr) return;
        setLoading(true);
        const invoice = await createInvoice({
            items: cart,
            total,
            discount,
            finalTotal,
            promotionId: selectedPromotion?.id || null,
            promotionCode: selectedPromotion?.code || null,
            status: "unpaid",
            createdAt: new Date(),
            paymentMethod: "qr",
            qrId: selectedQr.id,
        });
        setInvoiceId(invoice.id);
        setShowQR(true);
        setLoading(false);
    };

    // Xác nhận đã thanh toán QR
    const handleConfirmPaid = async () => {
        if (invoiceId) {
            await updateInvoiceStatus(invoiceId, "paid");
        }
        setShowQR(false);
        setCart([]);
        setInvoiceId(null);
        setSelectedQr(undefined);
    };

    // Lọc menu theo loại
    const filteredMenu =
        activeCategory === "Tất cả"
            ? menu
            : menu.filter((m: any) => m.category === activeCategory);

    // MOBILE: flex column, menu flex:1, CartBox luôn ở cuối (không fixed)
    if (isMobile) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "#f6f7fa",
                    width: "100vw",
                    maxWidth: "100vw",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                    position: "relative",
                    height: "100vh",
                }}
            >
                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        boxSizing: "border-box",
                        width: "100vw",
                        maxWidth: "100vw",
                        overflow: "auto",
                        padding: "12px 4px 0 4px",
                    }}
                >
                    <MenuTabs
                        categories={categories}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />
                    <div style={{ flex: 1, width: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
                        <MenuGrid menu={filteredMenu} addToCart={addToCart} />
                    </div>
                </div>
                {/* CartBox luôn là phần cuối cùng */}
                <div style={{ width: "100vw", maxWidth: "100vw", flexShrink: 0 }}>
                    <CartBox
                        cart={cart}
                        promotions={promotions}
                        selectedPromotion={selectedPromotion}
                        setSelectedPromotion={setSelectedPromotion}
                        changeQty={changeQty}
                        removeItem={removeItem}
                        total={total}
                        discount={discount}
                        finalTotal={finalTotal}
                        handleCheckout={handleCheckout}
                        setShowDrawer={setShowDrawer}
                        setShowQR={setShowQR}
                        loading={loading}
                        isMobile={true}
                    />
                </div>
                <DrawerCart
                    cart={cart}
                    showDrawer={showDrawer}
                    setShowDrawer={setShowDrawer}
                    changeQty={changeQty}
                    removeItem={removeItem}
                />
                <QRModal
                    showQR={showQR}
                    setShowQR={setShowQR}
                    selectedQr={selectedQr}
                    setSelectedQr={setSelectedQr}
                    qrList={qrList}
                    finalTotal={finalTotal}
                    invoiceId={invoiceId}
                    handleCheckoutQR={handleCheckoutQR}
                    handleConfirmPaid={handleConfirmPaid}
                    loading={loading}
                />
            </div>
        );
    }

    // Desktop layout
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f6f7fa",
                width: "100vw",
                maxWidth: "100vw",
                overflowX: "hidden",
                boxSizing: "border-box",
                position: "relative",
            }}
        >
            <Row
                gutter={[24, 24]}
                justify="center"
                style={{
                    margin: 0,
                    width: "100%",
                    boxSizing: "border-box",
                    maxWidth: "100vw",
                }}
            >
                <Col
                    xs={24}
                    md={16}
                    style={{
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        width: "100%",
                        maxWidth: 900,
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            padding: 16,
                            width: "100%",
                            maxWidth: 900,
                            margin: "0 auto",
                            boxSizing: "border-box",
                        }}
                    >
                        <MenuTabs
                            categories={categories}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                        />
                        <MenuGrid menu={filteredMenu} addToCart={addToCart} />
                    </div>
                </Col>
                <Col
                    xs={24}
                    md={8}
                    style={{
                        minWidth: 0,
                        display: "flex",
                        width: 360,
                        maxWidth: 410,
                        justifyContent: "center",
                    }}
                >
                    <div style={{ padding: 16, width: "100%", maxWidth: 410 }}>
                        <CartBox
                            cart={cart}
                            promotions={promotions}
                            selectedPromotion={selectedPromotion}
                            setSelectedPromotion={setSelectedPromotion}
                            changeQty={changeQty}
                            removeItem={removeItem}
                            total={total}
                            discount={discount}
                            finalTotal={finalTotal}
                            handleCheckout={handleCheckout}
                            setShowDrawer={setShowDrawer}
                            setShowQR={setShowQR}
                            loading={loading}
                            isMobile={false}
                        />
                    </div>
                </Col>
            </Row>
            <DrawerCart
                cart={cart}
                showDrawer={showDrawer}
                setShowDrawer={setShowDrawer}
                changeQty={changeQty}
                removeItem={removeItem}
            />
            <QRModal
                showQR={showQR}
                setShowQR={setShowQR}
                selectedQr={selectedQr}
                setSelectedQr={setSelectedQr}
                qrList={qrList}
                finalTotal={finalTotal}
                invoiceId={invoiceId}
                handleCheckoutQR={handleCheckoutQR}
                handleConfirmPaid={handleConfirmPaid}
                loading={loading}
            />
        </div>
    );
};

export default OrderPOS;
