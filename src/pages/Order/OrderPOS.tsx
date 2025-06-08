import React, {useEffect, useState} from "react";
import MenuGrid from "./components/MenuGrid";
import CartBox from "./components/CartBox";
import DrawerCart from "./components/DrawerCart";
import QRModal from "./components/QRModal";
import SelectToppingModal from "./components/SelectToppingModal";
import RecentInvoiceModal from "./components/RecentInvoiceModal";
import PendingOrderModal from "./components/PendingOrderModal";
import {getMenus, refreshMenuCache} from "../../services/menuService";
import {createInvoice, getInvoices, updateInvoiceStatus} from "../../services/invoiceService";
import {getQRCodes} from "../../services/qrcodeService";
import {getDefaultPromotion, getPromotions} from "../../services/promotionService";
import {Button, notification, Tabs} from "antd";
import {EyeOutlined, ReloadOutlined, TransactionOutlined} from "@ant-design/icons";
import {collection, getFirestore, onSnapshot, query, where} from "firebase/firestore";

// Hook kiểm tra landscape (nằm ngang)
function useIsLandscape() {
    const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
    useEffect(() => {
        const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return isLandscape;
}

function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return width;
}

function usePendingOrders() {
    const [pendingOrders, setPendingOrders] = useState([]);
    useEffect(() => {
        const db = getFirestore();
        const q = query(
            collection(db, "invoices"),
            where("status", "==", "processing")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Đơn cũ nhất ở trên
            orders.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            setPendingOrders(orders);
        });
        return () => unsubscribe();
    }, []);
    return pendingOrders;
}

const customTabStyle = {
    marginBottom: 4,
    background: "#f6f7fa",
    border: "none",
    borderRadius: 20,
    padding: "2px 0",
    minHeight: 36,
    overflowX: "hidden",
    whiteSpace: "nowrap"
};

const pillTab = (label, active) => ({
    display: "inline-block",
    borderRadius: 16,
    padding: "4px 14px",
    margin: "0 2px",
    fontSize: 13,
    fontWeight: 500,
    background: active ? "#1890ff" : "#f0f2f5",
    color: active ? "#fff" : "#222",
    boxShadow: active ? "0 2px 8px #1890ff22" : "none",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s"
});

const OrderPOS = () => {
    const isLandscape = useIsLandscape();
    const windowWidth = useWindowWidth();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Xác định màn hình nhỏ + landscape
    const isSmallLandscape = isLandscape && windowWidth < 1100;

    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [showDrawer, setShowDrawer] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [qrList, setQrList] = useState([]);
    const [selectedQr, setSelectedQr] = useState();
    const [invoiceId, setInvoiceId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [menuLoading, setMenuLoading] = useState(false);

    const [promotions, setPromotions] = useState([]);
    const [selectedPromotion, setSelectedPromotion] = useState(null);

    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState("Tất cả");

    // Topping
    const [toppingList, setToppingList] = useState([]);
    const [editToppingItem, setEditToppingItem] = useState(null);

    // Hóa đơn gần đây
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [showRecentModal, setShowRecentModal] = useState(false);

    // Đơn chờ xử lý realtime
    const [showPendingModal, setShowPendingModal] = useState(false);
    const pendingOrders = usePendingOrders();

    // Load menu và topping
    const loadMenuData = async () => {
        setMenuLoading(true);
        try {
            const menus = await getMenus();
            setMenu(menus);
            const cats = Array.from(new Set(menus.map((m) => m.category).filter(Boolean)));
            setCategories([...cats, "Tất cả"]);
            const toppings = menus.filter((m) => m.category === "Topping");
            setToppingList(toppings);
        } catch (error) {
            alert('Không thể tải danh sách món. Vui lòng thử lại sau.');
        } finally {
            setMenuLoading(false);
        }
    };

    useEffect(() => {
        loadMenuData();
        getQRCodes().then(setQrList);
        getPromotions().then(setPromotions);
        getDefaultPromotion().then((promo) => {
            if (promo) setSelectedPromotion(promo);
        });
    }, []);

    // Thêm món vào giỏ
    const addToCart = (item, size) => {
        const key = item.id + "_" + size.size;
        const exist = cart.find((c) => c.key === key);
        if (exist) {
            setCart(cart.map((c) => (c.key === key ? {...c, quantity: c.quantity + 1} : c)));
        } else {
            setCart([
                ...cart,
                {
                    key,
                    id: item.id,
                    name: item.name,
                    size: size.size,
                    price: size.price,
                    toppings: [],
                    toppingTotal: 0,
                    quantity: 1,
                    category: item.category
                },
            ]);
        }
    };

    // Cập nhật topping cho món trong cart
    const updateTopping = (key, newToppings) => {
        setCart(cart =>
            cart.map(item =>
                item.key === key
                    ? {
                        ...item,
                        toppings: newToppings,
                        toppingTotal: newToppings.reduce(
                            (sum, t) => sum + (t.sizes?.[0]?.price || 0) * (t.quantity || 1), 0
                        )
                    }
                    : item
            )
        );
    };

    // Khi bấm nút chỉnh topping trong cart
    const handleEditTopping = (item) => {
        if (item.category !== "Topping") {
            setEditToppingItem(item);
        }
    };
    const handleConfirmEditTopping = (newToppings) => {
        updateTopping(editToppingItem.key, newToppings);
        setEditToppingItem(null);
    };

    // Thay đổi số lượng trong giỏ
    const changeQty = (key, qty) => {
        setCart(
            cart
                .map((c) => (c.key === key ? {...c, quantity: Math.max(1, qty)} : c))
                .filter((c) => c.quantity > 0)
        );
    };

    // Xoá món
    const removeItem = (key) => {
        setCart(cart.filter((c) => c.key !== key));
    };

    // Tổng tiền trước giảm giá
    const total = cart.reduce((sum, c) => sum + (c.price + (c.toppingTotal || 0)) * c.quantity, 0);

    // Lọc menu theo tab, tab "Topping" sẽ hiển thị đúng toppingList
    let filteredMenu = [];
    if (activeCategory === "Tất cả") {
        filteredMenu = menu.filter((m) => m.category !== undefined && m.category !== null);
    } else if (activeCategory === "Topping") {
        filteredMenu = toppingList;
    } else {
        filteredMenu = menu.filter((m) => m.category === activeCategory);
    }

    // ====== Hóa đơn gần đây ======
    // const loadRecentInvoices = async () => {
    //     let data = await getInvoices();
    //     data = data.filter(i => i.status === "paid" || i.status === 'processing')
    //         .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    //         .slice(0, 10);
    //     setRecentInvoices(data);
    //     setShowRecentModal(true);
    // };

    // ====== Thanh toán (nhận đúng thông tin từ CartBox) ======
    const handleCheckout = async ({promotion, discount, finalTotal}) => {
        if (cart?.length === 0) return;
        setLoading(true);
        await createInvoice({
            items: cart.map(item => ({
                ...item,
                itemTotal: (item.price + (item.toppingTotal || 0)) * item.quantity,
            })),
            total,
            discount,
            finalTotal,
            promotionId: promotion?.id || null,
            promotionCode: promotion?.code || null,
            promotionName: promotion?.name || null,
            promotionType: promotion?.type || null,
            promotionValue: promotion?.value || null,
            status: "processing",
            createdAt: new Date(),
            paymentMethod: "cash",
            createdUser: localStorage.getItem("email") || null,
        });
        notification.success({
            message: 'Thành công',
            description: 'Đơn hàng đã được tạo thành công!',
            placement: 'top',
            duration: 1,
            style: {
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }
        });
        setLoading(false);
        setCart([]);
    };

    const handleCheckoutQR = async ({promotion, discount, finalTotal}) => {
        if (cart?.length === 0 || !selectedQr) return;
        setLoading(true);
        const safeDiscount = typeof discount === "number" ? discount : 0;
        const invoice = await createInvoice({
            items: cart.map(item => ({
                ...item,
                itemTotal: (item.price + (item.toppingTotal || 0)) * item.quantity,
            })),
            total,
            discount: safeDiscount,
            finalTotal,
            promotionId: promotion?.id || null,
            promotionCode: promotion?.code || null,
            promotionName: promotion?.name || null,
            promotionType: promotion?.type || null,
            promotionValue: promotion?.value || null,
            status: "processing",
            createdAt: new Date(),
            paymentMethod: "qr",
            qrId: selectedQr.id,
            createdUser: localStorage.getItem("email") || null,
        });
        setInvoiceId(invoice.id);
        setShowQR(true);
        setLoading(false);
    };

    // Xác nhận đã thanh toán QR
    const handleConfirmPaid = async () => {
        if (invoiceId) {
            await updateInvoiceStatus(invoiceId, "processing");
        }
        setShowQR(false);
        setCart([]);
        setInvoiceId(null);
        setSelectedQr(undefined);
    };

    const handleFinishOrder = async (invoiceId) => {
        await updateInvoiceStatus(invoiceId, "paid");
        notification.success({
            message: 'Thành công',
            description: 'Đơn hàng đã được xử lý thành công!',
            placement: 'top',
            duration: 1,
            style: {
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }
        });
    };

    // ========== LAYOUT ==========

    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            height: "100%",
            width: "100%",
            background: "#f6f7fa",
            boxSizing: "border-box"
        }}>
            <main style={{
                flex: 1,
                minWidth: 0,
                height: "100%",
                display: "flex",
                flexDirection: isLandscape ? "row" : "column",
                background: "#f6f7fa",
                boxSizing: "border-box",
                overflow: "hidden"
            }}>
                {isLandscape ? (
                    <>
                        {/* Bên trái: Header, Tabs, MenuGrid */}
                        <div style={{
                            flex: isSmallLandscape ? 0.6 : 1,
                            minWidth: 0,
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            {/* Header và Tabs */}
                            <div>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "end",
                                    alignItems: "center",
                                    padding: isSmallLandscape ? "6px 6px" : "12px 16px",
                                    fontWeight: 600,
                                    fontSize: isSmallLandscape ? 14 : 18,
                                    color: "#1890ff"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: isSmallLandscape ? 4 : 12
                                    }}>
                                        {/*<Button*/}
                                        {/*    icon={<EyeOutlined/>}*/}
                                        {/*    onClick={loadRecentInvoices}*/}
                                        {/*    type="default"*/}
                                        {/*    size={isSmallLandscape ? "small" : "middle"}*/}
                                        {/*    style={{*/}
                                        {/*        minWidth: isSmallLandscape ? 36 : 120,*/}
                                        {/*        padding: isSmallLandscape ? 0 : undefined*/}
                                        {/*    }}*/}
                                        {/*>*/}
                                        {/*    {!isSmallLandscape && "Xem hóa đơn gần đây"}*/}
                                        {/*</Button>*/}
                                        <Button
                                            icon={<TransactionOutlined/>}
                                            type="primary"
                                            size={isSmallLandscape ? "small" : "middle"}
                                            style={{
                                                marginRight: isSmallLandscape ? 0 : 8,
                                                minWidth: isSmallLandscape ? 36 : 120,
                                                padding: isSmallLandscape ? 0 : undefined
                                            }}
                                            onClick={() => setShowPendingModal(true)}
                                        >
                                            {!isSmallLandscape && "Đơn chờ xử lý"}
                                        </Button>
                                        <Button
                                            type="link"
                                            icon={<ReloadOutlined spin={menuLoading}/>}
                                            onClick={refreshMenuCache}
                                            loading={menuLoading}
                                            size={isSmallLandscape ? "small" : "middle"}
                                            style={{
                                                minWidth: isSmallLandscape ? 36 : undefined,
                                                padding: isSmallLandscape ? 0 : undefined
                                            }}
                                        >
                                            {!isSmallLandscape && (menuLoading ? 'Đang tải...' : 'Làm mới menu')}
                                        </Button>
                                    </div>
                                </div>
                                <div style={{
                                    padding: isSmallLandscape ? "0 4px 4px 4px" : "0 16px 8px 16px",
                                    placeItems: "center",
                                    overflow: "hidden"
                                }}>
                                    {/* Tabs nhỏ gọn nếu landscape nhỏ */}
                                    <Tabs
                                        activeKey={activeCategory}
                                        onChange={setActiveCategory}
                                        size="small"
                                        tabBarGutter={2}
                                        tabBarStyle={customTabStyle}
                                        moreIcon={null}
                                        items={categories.map(c => ({
                                            key: c,
                                            label: (
                                                <span
                                                    style={pillTab(c, activeCategory === c)}
                                                >
                {c}
            </span>
                                            )
                                        }))}
                                        animated={false}
                                    />
                                </div>
                            </div>
                            {/* Nội dung menu, flex: 1, overflow-y: auto */}
                            <div style={{
                                flex: 1,
                                overflowY: "auto",
                                minHeight: 0,
                                boxSizing: "border-box"
                            }}>
                                <MenuGrid menu={filteredMenu} addToCart={addToCart}/>
                            </div>
                        </div>
                        {/* Bên phải: CartBox */}
                        <div style={{
                            flex: isSmallLandscape ? 0.4 : "unset",
                            width: isSmallLandscape ? "unset" : 420,
                            minWidth: isSmallLandscape ? 0 : 320,
                            maxWidth: isSmallLandscape ? "unset" : 480,
                            background: "#fff",
                            borderLeft: "1px solid #eee",
                            boxShadow: "-2px 0 8px #0001",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            // position: "sticky",
                            top: 0,
                            zIndex: 10
                        }}>
                            <CartBox
                                cart={cart}
                                promotions={promotions}
                                selectedPromotion={selectedPromotion}
                                setSelectedPromotion={setSelectedPromotion}
                                changeQty={changeQty}
                                removeItem={removeItem}
                                total={total}
                                handleCheckout={handleCheckout}
                                setShowDrawer={setShowDrawer}
                                setShowQR={setShowQR}
                                loading={loading}
                                isMobile={isMobile}
                                onEditTopping={handleEditTopping}
                            />
                        </div>
                    </>
                ) : (
                    // Portrait/mobile: layout cột dọc, CartBox ở dưới cùng
                    <>
                        {/* Header và Tabs */}
                        <div>
                            <div style={{
                                display: "flex",
                                flexDirection: isMobile ? "column" : "row",
                                justifyContent: "space-between",
                                alignItems: isMobile ? "stretch" : "center",
                                padding: isMobile ? "10px 8px" : "12px 16px",
                                fontWeight: 600,
                                fontSize: isMobile ? 16 : 18,
                                color: "#1890ff",
                                gap: isMobile ? 8 : 0
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: isMobile ? 8 : 12,
                                    justifyContent: "flex-end"
                                }}>
                                    {/*<Button*/}
                                    {/*    icon={<EyeOutlined/>}*/}
                                    {/*    onClick={loadRecentInvoices}*/}
                                    {/*    type="default"*/}
                                    {/*    size={isMobile ? "small" : "middle"}*/}
                                    {/*    style={{minWidth: isMobile ? 40 : 120}}*/}
                                    {/*>*/}
                                    {/*    {!isMobile && "Xem hóa đơn gần đây"}*/}
                                    {/*</Button>*/}
                                    <Button
                                        icon={<TransactionOutlined/>}
                                        type="primary"
                                        style={{marginRight: 8}}
                                        size={isMobile ? "small" : "middle"}
                                        onClick={() => setShowPendingModal(true)}
                                    >
                                        {!isMobile && "Đơn chờ xử lý"}
                                    </Button>
                                    <Button
                                        type="link"
                                        icon={<ReloadOutlined spin={menuLoading}/>}
                                        onClick={refreshMenuCache}
                                        loading={menuLoading}
                                        size={isMobile ? "small" : "middle"}
                                    >
                                        {!isMobile && (menuLoading ? 'Đang tải...' : 'Làm mới menu')}
                                    </Button>
                                </div>
                            </div>
                            <div style={{
                                padding: isMobile ? "0 8px 8px 8px" : "0 16px 8px 16px",
                                overflow: "hidden"
                            }}>
                                <Tabs
                                    activeKey={activeCategory}
                                    onChange={setActiveCategory}
                                    size="small"
                                    tabBarGutter={2}
                                    tabBarStyle={customTabStyle}
                                    moreIcon={null}
                                    items={categories.map(c => ({
                                        key: c,
                                        label: (
                                            <span
                                                style={pillTab(c, activeCategory === c)}
                                            >
                {c}
            </span>
                                        )
                                    }))}
                                    animated={false}
                                />
                            </div>
                        </div>
                        {/* Nội dung menu, flex: 1, overflow-y: auto */}
                        <div style={{
                            flex: 1,
                            overflowY: "auto",
                            minHeight: 0,
                            boxSizing: "border-box"
                        }}>
                            <MenuGrid menu={filteredMenu} addToCart={addToCart}/>
                        </div>
                        {/* CartBox sticky ở dưới cùng, luôn hiển thị */}
                        <div style={{
                            width: "100%",
                            // maxWidth: 420,
                            margin: "0 auto",
                            // position: "sticky",
                            // bottom: 0,
                            // left: 0,
                            // right: 0,
                            zIndex: 10,
                            background: "#fff",
                            borderTop: "1px solid #eee",
                            boxShadow: "0 -2px 8px #0001"
                        }}>
                            <CartBox
                                cart={cart}
                                promotions={promotions}
                                selectedPromotion={selectedPromotion}
                                setSelectedPromotion={setSelectedPromotion}
                                changeQty={changeQty}
                                removeItem={removeItem}
                                total={total}
                                handleCheckout={handleCheckout}
                                setShowDrawer={setShowDrawer}
                                setShowQR={setShowQR}
                                loading={loading}
                                isMobile={isMobile}
                                onEditTopping={handleEditTopping}
                            />
                        </div>
                    </>
                )}
            </main>
            {/* Các modal */}
            <DrawerCart
                cart={cart}
                showDrawer={showDrawer}
                setShowDrawer={setShowDrawer}
                changeQty={changeQty}
                removeItem={removeItem}
                onEditTopping={handleEditTopping}
            />
            <QRModal
                showQR={showQR}
                setShowQR={setShowQR}
                selectedQr={selectedQr}
                setSelectedQr={setSelectedQr}
                qrList={qrList}
                finalTotal={cart.reduce((sum, c) => sum + (c.price + (c.toppingTotal || 0)) * c.quantity, 0)}
                invoiceId={invoiceId}
                handleCheckoutQR={handleCheckoutQR}
                handleConfirmPaid={handleConfirmPaid}
                loading={loading}
                setCart={setCart}
            />
            <SelectToppingModal
                open={!!editToppingItem}
                onClose={() => setEditToppingItem(null)}
                menuItem={editToppingItem}
                toppingList={toppingList}
                onConfirm={handleConfirmEditTopping}
                isEdit
            />
            <RecentInvoiceModal
                open={showRecentModal}
                onClose={() => setShowRecentModal(false)}
                invoices={recentInvoices}
            />
            <PendingOrderModal
                open={showPendingModal}
                onClose={() => setShowPendingModal(false)}
                orders={pendingOrders}
                onFinishOrder={handleFinishOrder}
            />
        </div>
    );
};

export default OrderPOS;
