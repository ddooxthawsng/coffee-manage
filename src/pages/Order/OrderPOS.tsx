import {useEffect, useState} from "react";
import MenuGrid from "./components/MenuGrid";
import CartBox from "./components/CartBox";
import DrawerCart from "./components/DrawerCart";
import QRModal from "./components/QRModal";
import SelectToppingModal from "./components/SelectToppingModal";
import RecentInvoiceModal from "./components/RecentInvoiceModal";
import PendingOrderModal from "./components/PendingOrderModal";
import TableSelectModal from "./components/TableSelectModal";
import {getMenus, refreshMenuCache} from "../../services/menuService";
import {createInvoice, getInvoices, updateInvoiceStatus} from "../../services/invoiceService";
import {getQRCodes} from "../../services/qrcodeService";
import {getDefaultPromotion, getPromotions} from "../../services/promotionService";
import {Button, Modal, notification, Tabs} from "antd";
import {EyeOutlined, ReloadOutlined, TransactionOutlined} from "@ant-design/icons";
import {useIsLandscape, usePendingOrders, useWindowWidth} from "./hooks.js"

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

    //Chọn bàn
    const [selectedTable, setSelectedTable] = useState(null);
    const [checkoutType, setCheckoutType] = useState(null); // "cash" hoặc "qr"
    const [checkoutPayload, setCheckoutPayload] = useState(null);

    // Đơn chờ xử lý realtime
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);

    // Hàm tạo key unique cho item trong cart
    const generateCartItemKey = (item, size, toppings = [], customerNote = "") => {
        const toppingKeys = toppings
            .filter(t => t.quantity > 0)
            .map(t => `${t.id}_${t.quantity}`)
            .sort()
            .join("-");

        const noteKey = customerNote ? `_note_${customerNote.replace(/\s+/g, "_")}` : "";

        return `${item.id}_${size.size}_${toppingKeys}${noteKey}`;
    };

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

    // Thêm món vào giỏ (chỉ thêm món cơ bản, không có topping)
    const addToCart = (item, size) => {
        const key = generateCartItemKey(item, size, [], "");

        const existingBasicItem = cart.find((c) =>
            c.id === item.id &&
            c.size === size.size &&
            (!c.toppings || c.toppings.length === 0) &&
            (!c.customerNote || c.customerNote === "")
        );

        if (existingBasicItem) {
            setCart(cart.map((c) =>
                c.key === existingBasicItem.key
                    ? {...c, quantity: c.quantity + 1}
                    : c
            ));
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
                    category: item.category,
                    customerNote: ""
                },
            ]);
        }
    };

    // Cập nhật topping, size và ghi chú cho món trong cart
    const updateToppingAndSize = (oldKey, newToppings, newSize, newNote) => {
        const oldItem = cart.find(item => item.key === oldKey);
        if (!oldItem) return;

        const newKey = generateCartItemKey(
            {id: oldItem.id},
            newSize || {size: oldItem.size},
            newToppings,
            newNote || ""
        );

        const existingItemWithNewConfig = cart.find(item =>
            item.key === newKey && item.key !== oldKey
        );

        if (existingItemWithNewConfig) {
            setCart(cart =>
                cart
                    .map(item =>
                        item.key === newKey
                            ? {...item, quantity: item.quantity + oldItem.quantity}
                            : item
                    )
                    .filter(item => item.key !== oldKey)
            );
        } else {
            setCart(cart =>
                cart.map(item =>
                    item.key === oldKey
                        ? {
                            ...item,
                            key: newKey,
                            toppings: newToppings,
                            toppingTotal: newToppings.reduce(
                                (sum, t) => sum + (t.sizes?.[0]?.price || 0) * (t.quantity || 1), 0
                            ),
                            ...(newSize && {
                                size: newSize.size,
                                price: newSize.price
                            }),
                            customerNote: newNote || item.customerNote || ""
                        }
                        : item
                )
            );
        }
    };

    // Khi bấm nút chỉnh topping trong cart
    const handleEditTopping = (item) => {
        if (item.category !== "Topping") {
            setEditToppingItem(item);
        }
    };

    // Xử lý kết quả từ SelectToppingModal
    const handleConfirmEditTopping = (result) => {
        if (editToppingItem) {
            updateToppingAndSize(
                editToppingItem.key,
                result.toppings,
                result.size,
                result.customerNote
            );
            setEditToppingItem(null);
        }
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

    // Lọc menu theo tab
    let filteredMenu = [];
    if (activeCategory === "Tất cả") {
        filteredMenu = menu.filter((m) => m.category !== undefined && m.category !== null);
    } else if (activeCategory === "Topping") {
        filteredMenu = toppingList;
    } else {
        filteredMenu = menu.filter((m) => m.category === activeCategory);
    }

    // ====== Hóa đơn gần đây ======
    const loadRecentInvoices = async () => {
        let data = await getInvoices({limit: 10});
        data = data.filter(i => i.status === "paid" || i.status === 'processing')
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
            .slice(0, 10);
        setRecentInvoices(data);
        setShowRecentModal(true);
    };

    // ====== Thanh toán ======
    const pendingOrders = usePendingOrders();
    const processingTables = pendingOrders
        .map(order => order.tableNumber)
        .filter(num => typeof num === "number" || typeof num === "string");

    const openTableModal = (type, payload) => {
        setCheckoutType(type);
        setCheckoutPayload(payload);
        setShowTableModal(true);
        setSelectedTable(null);
    };

    const handleConfirmTable = async (orderData) => {
        if (!selectedTable) {
            notification.warning({message: "Vui lòng chọn số bàn!"});
            return;
        }

        setShowTableModal(false);

        if (checkoutType === "cash") {
            await doCheckoutCash(checkoutPayload, selectedTable, orderData);
        } else if (checkoutType === "qr") {
            // Kiểm tra xem có QR nào khả dụng không
            if (qrList.length === 0) {
                notification.error({message: "Không có mã QR nào khả dụng!"});
                return;
            }

            // Kiểm tra xem đã chọn QR chưa
            if (!selectedQr) {
                // Lưu thông tin để xử lý sau
                setCheckoutPayload({...checkoutPayload, tableNumber: selectedTable, orderData});
                setShowQR(true); // Hiển thị modal chọn QR
                return;
            }

            // Nếu đã có QR, tiến hành checkout
            await doCheckoutQR(checkoutPayload, selectedTable, orderData);
        }
    };

    const doCheckoutCash = async ({promotion, discount, finalTotal}, tableNumber, orderData) => {
        if (cart?.length === 0) return;

        const orderTypeText = orderData.orderType === "dine-in" ? "ngồi quán" : "mang về";

        Modal.confirm({
            centered:true,
            title: "Xác nhận thanh toán",
            content: `Bạn có chắc chắn muốn thanh toán đơn hàng ${orderTypeText} bằng tiền mặt cho bàn số ${tableNumber}?`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: async () => {
                setLoading(true);
                await createInvoice({
                    items: cart.map(item => ({
                        ...item,
                        itemTotal: (item.price + (item.toppingTotal || 0)) * item.quantity,
                    })),
                    total: finalTotal + (discount || 0),
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
                    tableNumber,
                    orderType: orderData.orderType,
                });
                notification.success({
                    message: 'Thành công',
                    description: `Đơn hàng ${orderTypeText} đã được tạo thành công!`,
                    placement: 'top',
                    duration: 2,
                });
                setLoading(false);
                setCart([]);
            },
        });
    };

    const doCheckoutQR = async ({promotion, discount, finalTotal}, tableNumber, orderData) => {
        if (cart?.length === 0) return;

        // Nếu chưa có selectedQr, báo lỗi
        if (!selectedQr) {
            notification.error({message: "Vui lòng chọn mã QR!"});
            return;
        }

        setLoading(true);
        const invoice = await createInvoice({
            items: cart.map(item => ({
                ...item,
                itemTotal: (item.price + (item.toppingTotal || 0)) * item.quantity,
            })),
            total: finalTotal + (discount || 0),
            discount,
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
            tableNumber,
            orderType: orderData.orderType,
        });
        setInvoiceId(invoice.id);
        setShowQR(true);
        setLoading(false);
    };

    const handleCheckout = (payload) => {
        openTableModal("cash", payload);
    };

    const handleCheckoutQR = (payload) => {
        openTableModal("qr", payload);
    };

    const handleConfirmPaid = async () => {
        // Nếu có thông tin checkout đang chờ (tức là vừa chọn QR xong)
        if (checkoutPayload && checkoutPayload.tableNumber && checkoutPayload.orderData) {
            await doCheckoutQR(
                {
                    promotion: checkoutPayload.promotion,
                    discount: checkoutPayload.discount,
                    finalTotal: checkoutPayload.finalTotal
                },
                checkoutPayload.tableNumber,
                checkoutPayload.orderData
            );
            setCheckoutPayload(null);
            return;
        }

        // Logic cũ cho trường hợp đã có invoice
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
            className: 'rounded-lg shadow-lg'
        });
    };

    return (
        <div className="flex flex-row h-full w-full bg-gray-50 box-border">
            <main className="flex-1 min-w-0 h-full flex overflow-hidden bg-gray-50 box-border"
                  style={{flexDirection: isLandscape ? "row" : "column"}}>
                {isLandscape ? (
                    <>
                        {/* Bên trái: Header, Tabs, MenuGrid */}
                        <div className="min-w-0 flex flex-col"
                             style={{flex: isSmallLandscape ? 0.6 : 1}}>
                            {/* Header và Tabs */}
                            <div>
                                <div className={`flex flex-row justify-end items-center font-semibold text-blue-500 ${
                                    isSmallLandscape ? "p-1.5 text-sm" : "p-3 px-4 text-lg"
                                }`}>
                                    <div className={`flex items-center ${isSmallLandscape ? "gap-1" : "gap-3"}`}>
                                        <Button
                                            icon={<EyeOutlined/>}
                                            onClick={loadRecentInvoices}
                                            type="default"
                                            size={isSmallLandscape ? "small" : "middle"}
                                            className={isSmallLandscape ? "min-w-9 p-0" : "min-w-30"}
                                        >
                                            {!isSmallLandscape && "Xem hóa đơn gần đây"}
                                        </Button>
                                        <Button
                                            icon={<TransactionOutlined/>}
                                            type="primary"
                                            size={isSmallLandscape ? "small" : "middle"}
                                            className={isSmallLandscape ? "min-w-9 p-0 mr-0" : "min-w-30 mr-2"}
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
                                            className={isSmallLandscape ? "min-w-9 p-0" : ""}
                                        >
                                            {!isSmallLandscape && (menuLoading ? 'Đang tải...' : 'Làm mới menu')}
                                        </Button>
                                    </div>
                                </div>
                                <div className={`overflow-hidden items-center ${
                                    isSmallLandscape ? "px-1 pb-1" : "px-4 pb-2"
                                }`}>
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
                                                <span style={pillTab(c, activeCategory === c)}>
                                                    {c}
                                                </span>
                                            )
                                        }))}
                                        animated={false}
                                    />
                                </div>
                            </div>
                            {/* Menu Grid */}
                            <div className="flex-1 overflow-y-auto min-h-0 box-border">
                                <MenuGrid menu={filteredMenu} addToCart={addToCart}/>
                            </div>
                        </div>
                        {/* Bên phải: CartBox */}
                        <div className={`bg-white border-l border-gray-200 shadow-lg flex flex-col h-full top-0 z-10 ${
                            isSmallLandscape
                                ? "min-w-0"
                                : "w-105 min-w-80 max-w-120"
                        }`}
                             style={{flex: isSmallLandscape ? 0.4 : "unset"}}>
                            <CartBox
                                cart={cart}
                                promotions={promotions}
                                selectedPromotion={selectedPromotion}
                                setSelectedPromotion={setSelectedPromotion}
                                changeQty={changeQty}
                                removeItem={removeItem}
                                total={total}
                                handleCheckout={handleCheckout}
                                handleCheckoutQR={handleCheckoutQR}
                                setShowDrawer={setShowDrawer}
                                setShowQR={setShowQR}
                                loading={loading}
                                isMobile={isMobile}
                                onEditTopping={handleEditTopping}
                                isLandscape={isLandscape}
                            />
                        </div>
                    </>
                ) : (
                    // Portrait/mobile: layout cột dọc
                    <>
                        {/* Header và Tabs */}
                        <div>
                            <div className={`flex justify-between items-center font-semibold text-blue-500 ${
                                isMobile
                                    ? "flex-col items-stretch py-2.5 px-2 text-base gap-2"
                                    : "flex-row py-3 px-4 text-lg gap-0"
                            }`}>
                                <div className={`flex items-center justify-end ${
                                    isMobile ? "gap-2" : "gap-3"
                                }`}>
                                    <Button
                                        icon={<EyeOutlined/>}
                                        onClick={loadRecentInvoices}
                                        type="default"
                                        size={isMobile ? "small" : "middle"}
                                        className={isMobile ? "min-w-10" : "min-w-30"}
                                    >
                                        {!isMobile && "Xem hóa đơn gần đây"}
                                    </Button>
                                    <Button
                                        icon={<TransactionOutlined/>}
                                        type="primary"
                                        className="mr-2"
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
                            <div className={`overflow-hidden ${
                                isMobile ? "px-2 pb-2" : "px-4 pb-2"
                            }`}>
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
                                            <span style={pillTab(c, activeCategory === c)}>
                                                {c}
                                            </span>
                                        )
                                    }))}
                                    animated={false}
                                />
                            </div>
                        </div>
                        {/* Menu Grid */}
                        <div className="flex-1 overflow-y-auto min-h-0 box-border">
                            <MenuGrid menu={filteredMenu} addToCart={addToCart}/>
                        </div>
                        {/* CartBox sticky */}
                        <div className="w-full mx-auto z-10 bg-white border-t border-gray-200 shadow-lg">
                            <CartBox
                                cart={cart}
                                promotions={promotions}
                                selectedPromotion={selectedPromotion}
                                setSelectedPromotion={setSelectedPromotion}
                                changeQty={changeQty}
                                removeItem={removeItem}
                                total={total}
                                handleCheckout={handleCheckout}
                                handleCheckoutQR={handleCheckoutQR}
                                setShowDrawer={setShowDrawer}
                                setShowQR={setShowQR}
                                loading={loading}
                                isMobile={isMobile}
                                onEditTopping={handleEditTopping}
                                isLandscape={isLandscape}
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
                cart={cart}
                promotion={checkoutPayload?.promotion || null}
                discount={checkoutPayload?.discount || 0}
                checkoutPayload={checkoutPayload}
                setCheckoutPayload={setCheckoutPayload}
            />
            <SelectToppingModal
                open={!!editToppingItem}
                onClose={() => setEditToppingItem(null)}
                menuItem={editToppingItem}
                toppingList={toppingList}
                menu={menu}
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
            <TableSelectModal
                open={showTableModal}
                onCancel={() => setShowTableModal(false)}
                onOk={handleConfirmTable}
                selectedTable={selectedTable}
                setSelectedTable={setSelectedTable}
                processingTables={processingTables}
            />
        </div>
    );
};

export default OrderPOS;
