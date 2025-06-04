import React, {useEffect, useState} from 'react';
import {
    Alert,
    Button,
    Card,
    Col,
    Divider,
    Empty,
    InputNumber,
    List,
    message,
    Modal,
    Radio,
    Row,
    Select,
    Space,
    Statistic,
    Switch,
    Tag,
    Tooltip,
    Typography
} from 'antd';
import {
    CheckCircleOutlined,
    CoffeeOutlined,
    DeleteOutlined,
    DollarOutlined,
    InfoCircleOutlined,
    MinusOutlined,
    MoneyCollectOutlined,
    PlusOutlined,
    QrcodeOutlined,
    ShoppingCartOutlined,
    WarningOutlined
} from '@ant-design/icons';
import {addInvoice, getDrinks, recordSale} from '../firebase/DrinkManagementService';
import {getProcessedIngredients, updateProcessedIngredientInventory} from '../firebase/ingredient_service';
import {getQRCodes} from '../firebase/qrcode_service';

const {Title, Text} = Typography;

const SalesPage = () => {
    const [drinks, setDrinks] = useState([]);
    const [processedIngredients, setProcessedIngredients] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [availableQRs, setAvailableQRs] = useState([]);
    const [selectedQRId, setSelectedQRId] = useState(null);
    const [paymentQR, setPaymentQR] = useState(null);
    const [allowNegativeStock, setAllowNegativeStock] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('cash'); // Mặc định là tiền mặt

    useEffect(() => {
        fetchDrinks();
        fetchProcessedIngredients();
        fetchQRCodes();
    }, []);

    const fetchDrinks = async () => {
        try {
            const drinkList = await getDrinks();
            setDrinks(drinkList);
        } catch (error) {
            message.error('Không thể tải danh sách đồ uống');
        }
    };

    const fetchProcessedIngredients = async () => {
        try {
            const processedList = await getProcessedIngredients();
            setProcessedIngredients(processedList);
        } catch (error) {
            message.error('Không thể tải danh sách nguyên liệu thành phẩm');
        }
    };

    const fetchQRCodes = async () => {
        try {
            const qrList = await getQRCodes();
            setAvailableQRs(qrList);
            const defaultQR = qrList.find(qr => qr.isDefault);
            if (defaultQR) {
                setSelectedQRId(defaultQR.id);
            }
        } catch (error) {
            message.error('Không thể tải danh sách QR codes');
        }
    };

    const generateQRContent = (qrData, amount, description) => {
        const orderItems = cart.map(item => `${item.drinkName} (${item.size}): ${item.quantity}x`).join(', ');
        return JSON.stringify({
            bankCode: qrData.bankCode,
            bankName: qrData.bankName,
            accountNumber: qrData.accountNumber,
            accountName: qrData.accountName,
            amount: amount,
            description: description || `Thanh toan don hang - ${orderItems}`,
            orderId: `ORDER_${Date.now()}`,
            timestamp: new Date().toISOString(),
            items: cart.length,
            totalAmount: amount
        });
    };

    const checkDrinkAvailability = (drink) => {
        if (!Array.isArray(drink.ingredients) || drink.ingredients.length === 0) {
            return {canMake: 999, limitingIngredient: null, hasStock: true};
        }

        if (allowNegativeStock) {
            return {canMake: 999, limitingIngredient: null, hasStock: true};
        }

        let minPossible = 999;
        let limitingIngredient = null;

        for (const recipeIngredient of drink.ingredients) {
            const ingredient = processedIngredients.find(ing => ing.id === recipeIngredient.id);
            if (ingredient) {
                const availableStock = ingredient.inventory || 0;
                const neededPerDrink = recipeIngredient.quantity || 0;
                if (neededPerDrink > 0) {
                    const possibleQuantity = Math.floor(availableStock / neededPerDrink);
                    if (possibleQuantity < minPossible) {
                        minPossible = possibleQuantity;
                        limitingIngredient = ingredient.name;
                    }
                }
            } else {
                return {canMake: 0, limitingIngredient: recipeIngredient.name, hasStock: false};
            }
        }

        return {
            canMake: Math.max(0, minPossible),
            limitingIngredient,
            hasStock: minPossible > 0
        };
    };

    const addToCart = (drink, size) => {
        const availability = checkDrinkAvailability(drink);

        if (!allowNegativeStock && availability.canMake <= 0) {
            message.warning(`Không thể làm ${drink.name} do thiếu ${availability.limitingIngredient}`);
            return;
        }

        const cartItem = {
            id: `${drink.id}-${size}`,
            drinkId: drink.id,
            drinkName: drink.name,
            size: size,
            price: drink.price[size],
            quantity: 1,
            maxQuantity: allowNegativeStock ? 999 : availability.canMake,
            ingredients: drink.ingredients || [],
            hasStock: availability.hasStock
        };

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === cartItem.id);
            if (existingItem) {
                if (allowNegativeStock) {
                    return prevCart.map(item =>
                        item.id === cartItem.id
                            ? {...item, quantity: item.quantity + 1}
                            : item
                    );
                } else {
                    const totalQuantityInCart = prevCart
                        .filter(item => item.drinkId === drink.id)
                        .reduce((sum, item) => sum + item.quantity, 0);

                    if (totalQuantityInCart < availability.canMake) {
                        return prevCart.map(item =>
                            item.id === cartItem.id
                                ? {...item, quantity: item.quantity + 1}
                                : item
                        );
                    } else {
                        message.warning(`Không đủ nguyên liệu! Chỉ có thể làm ${availability.canMake} ly`);
                        return prevCart;
                    }
                }
            } else {
                return [...prevCart, cartItem];
            }
        });
    };

    const updateCartQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            setCart(prevCart => prevCart.filter(item => item.id !== itemId));
        } else {
            setCart(prevCart =>
                prevCart.map(item => {
                    if (item.id === itemId) {
                        if (allowNegativeStock || newQuantity <= item.maxQuantity) {
                            return {...item, quantity: newQuantity};
                        } else {
                            message.warning(`Không đủ nguyên liệu! Tối đa ${item.maxQuantity} ly`);
                            return item;
                        }
                    }
                    return item;
                })
            );
        }
    };

    const removeFromCart = (itemId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    };

    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    // Function xử lý thanh toán tiền mặt
    const handleCashPayment = async () => {
        if (cart.length === 0) {
            message.warning('Giỏ hàng trống!');
            return;
        }

        try {
            setLoading(true);

            const invoiceId = `INV_${Date.now()}`;
            const invoiceNumber = `HD${String(Date.now()).slice(-6)}`;
            const timestamp = new Date();

            const invoiceData = {
                invoiceId: invoiceId,
                invoiceNumber: invoiceNumber,
                timestamp: timestamp,
                items: cart.map(item => ({
                    drinkId: item.drinkId,
                    drinkName: item.drinkName,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity
                })),
                totalAmount: getTotalAmount(),
                totalQuantity: getTotalItems(),
                paymentMethod: 'CASH',
                qrCodeUsed: 'N/A',
                status: 'completed',
                allowedNegativeStock: allowNegativeStock
            };

            // Thêm hóa đơn vào database
            await addInvoice(invoiceData);

            // Ghi nhận từng sale với invoiceId
            for (const item of cart) {
                const drink = drinks.find(d => d.id === item.drinkId);

                // Trừ nguyên liệu thành phẩm
                if (drink?.ingredients) {
                    for (const ingredient of drink.ingredients) {
                        const requiredAmount = ingredient.quantity * item.quantity;
                        await updateProcessedIngredientInventory(ingredient.id, requiredAmount);
                    }
                }

                // Ghi nhận sale với invoiceId
                await recordSale({
                    invoiceId: invoiceId,
                    drinkId: item.drinkId,
                    drinkName: item.drinkName,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity,
                    timestamp: timestamp,
                    paymentMethod: 'CASH',
                    qrCodeUsed: 'N/A',
                    status: 'completed'
                });
            }

            message.success(`Thanh toán tiền mặt thành công! Hóa đơn: ${invoiceNumber} - Tổng tiền: ${getTotalAmount().toLocaleString()}đ`);
            setCart([]);
            fetchProcessedIngredients();
        } catch (error) {
            message.error('Có lỗi xảy ra khi thanh toán!');
        } finally {
            setLoading(false);
        }
    };


    // Function xử lý thanh toán QR hoàn tất
    const handlePaymentComplete = async () => {
        try {
            setLoading(true);

            const invoiceId = `INV_${Date.now()}`;
            const invoiceNumber = `HD${String(Date.now()).slice(-6)}`;
            const timestamp = new Date();

            const invoiceData = {
                invoiceId: invoiceId,
                invoiceNumber: invoiceNumber,
                timestamp: timestamp,
                items: cart.map(item => ({
                    drinkId: item.drinkId,
                    drinkName: item.drinkName,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity
                })),
                totalAmount: getTotalAmount(),
                totalQuantity: getTotalItems(),
                paymentMethod: 'QR_CODE',
                qrCodeUsed: paymentQR.bankName,
                status: 'completed',
                allowedNegativeStock: allowNegativeStock
            };

            await addInvoice(invoiceData);

            for (const item of cart) {
                const drink = drinks.find(d => d.id === item.drinkId);

                if (drink?.ingredients) {
                    for (const ingredient of drink.ingredients) {
                        const requiredAmount = ingredient.quantity * item.quantity;
                        await updateProcessedIngredientInventory(ingredient.id, requiredAmount);
                    }
                }

                await recordSale({
                    invoiceId: invoiceId,
                    drinkId: item.drinkId,
                    drinkName: item.drinkName,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity,
                    timestamp: timestamp,
                    paymentMethod: 'QR_CODE',
                    qrCodeUsed: paymentQR.bankName,
                    status: 'completed'
                });
            }

            message.success(`Thanh toán QR thành công! Hóa đơn: ${invoiceNumber}`);
            setCart([]);
            setQrModalVisible(false);
            fetchProcessedIngredients();
        } catch (error) {
            message.error('Có lỗi xảy ra khi thanh toán!');
        } finally {
            setLoading(false);
        }
    };

    const renderIngredientsList = (drinkIngredients) => {
        if (!Array.isArray(drinkIngredients) || drinkIngredients.length === 0) {
            return <Text type="secondary">Chưa có công thức</Text>;
        }

        return (
            <div>
                {drinkIngredients.map((ingredient, index) => {
                    const processedIngredient = processedIngredients.find(ing => ing.id === ingredient.id);
                    const stock = processedIngredient?.inventory || 0;
                    const needed = ingredient.quantity || 0;
                    const canMake = needed > 0 ? Math.floor(stock / needed) : 999;

                    return (
                        <Tag
                            key={index}
                            color={
                                allowNegativeStock ? 'blue' :
                                    canMake > 5 ? 'green' :
                                        canMake > 0 ? 'orange' : 'red'
                            }
                            style={{marginBottom: 4}}
                        >
                            {ingredient.name}: {needed} {ingredient.unit}
                            <Text style={{fontSize: '11px'}}> (Có: {stock})</Text>
                        </Tag>
                    );
                })}
            </div>
        );
    };

    // Function tạo QR content theo chuẩn VietQR
    const generateVietQRContent = (qrData, amount, description) => {
        // Format theo chuẩn VietQR cho ngân hàng Việt Nam
        const bankCode = qrData.bankCode || 'VCB'; // Mã ngân hàng
        const accountNumber = qrData.accountNumber;
        const accountName = qrData.accountName;

        // Tạo nội dung thanh toán theo format chuẩn
        const paymentInfo = {
            bankCode: bankCode,
            accountNo: accountNumber,
            accountName: accountName,
            acqId: '970436', // Mã định danh cho VietQR
            amount: amount,
            addInfo: description || `Thanh toan don hang ${Date.now()}`,
            format: 'compact2'
        };

        // Tạo URL theo chuẩn VietQR
        const vietQRUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${paymentInfo.acqId}.jpg?amount=${amount}&addInfo=${encodeURIComponent(paymentInfo.addInfo)}&accountName=${encodeURIComponent(accountName)}`;

        return vietQRUrl;
    };

    // Function tạo QR content cho MoMo
    const generateMoMoQRContent = (amount, description) => {
        // Format cho MoMo QR
        return `2|99|${amount}|${description}|0|0|0||vn`;
    };

    // Function tạo QR content theo chuẩn EMV
    const generateEMVQRContent = (qrData, amount, description) => {
        const merchantAccount = qrData.accountNumber;
        const merchantName = qrData.accountName;

        // EMV QR Code format cho thanh toán
        let qrString = '';
        qrString += '00020101021238'; // Payload Format Indicator + Point of Initiation
        qrString += '5802VN'; // Country Code (Vietnam)
        qrString += '5303704'; // Transaction Currency (VND)
        qrString += `54${amount.toString().padStart(2, '0')}${amount}`; // Transaction Amount
        qrString += `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`; // Merchant Name
        qrString += '6007Ho Chi Minh'; // Merchant City
        qrString += `62${(description.length + 4).toString().padStart(2, '0')}08${description.length.toString().padStart(2, '0')}${description}`; // Additional Data

        // Tính CRC16
        const crc = calculateCRC16(qrString + '6304');
        qrString += '6304' + crc;

        return qrString;
    };

    // Function tính CRC16 cho EMV QR
    const calculateCRC16 = (data) => {
        let crc = 0xFFFF;
        for (let i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc = crc << 1;
                }
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    };

    // ... các function khác giữ nguyên ...

    const handleCheckout = async () => {
        if (cart.length === 0) {
            message.warning('Giỏ hàng trống!');
            return;
        }

        if (paymentMethod === 'cash') {
            await handleCashPayment();
            return;
        }

        if (!selectedQRId) {
            message.warning('Vui lòng chọn QR code thanh toán!');
            return;
        }

        const selectedQR = availableQRs.find(qr => qr.id === selectedQRId);
        if (!selectedQR) {
            message.error('QR code không hợp lệ!');
            return;
        }

        const total = getTotalAmount();
        const description = `Thanh toan ${cart.length} mon - ${cart.map(item => `${item.drinkName}(${item.size})`).join(', ')}`;

        // Tạo QR content theo chuẩn VietQR
        const vietQRContent = generateEMVQRContent(selectedQR, total, description);

        setPaymentQR({
            ...selectedQR,
            amount: total,
            description: description,
            qrContent: vietQRContent,
            vietQRUrl: generateVietQRContent(selectedQR, total, description)
        });
        setQrModalVisible(true);
    };

    return (
        <div className="drink-management-container">
            <Title level={2} className="page-title">
                <ShoppingCartOutlined/> Bán Hàng
            </Title>

            {/* Statistics */}
            <Row gutter={[24, 16]} style={{marginBottom: 24}}>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card">
                        <Statistic
                            title="Đồ uống có sẵn"
                            value={drinks.length}
                            prefix={<CoffeeOutlined style={{color: '#1890ff'}}/>}
                            valueStyle={{color: '#1890ff'}}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card">
                        <Statistic
                            title="Món trong giỏ"
                            value={getTotalItems()}
                            prefix={<ShoppingCartOutlined style={{color: '#52c41a'}}/>}
                            valueStyle={{color: '#52c41a'}}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card">
                        <Statistic
                            title="Tổng tiền"
                            value={getTotalAmount()}
                            precision={0}
                            suffix="đ"
                            prefix={<DollarOutlined style={{color: '#faad14'}}/>}
                            valueStyle={{color: '#faad14'}}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card">
                        <Statistic
                            title="Phương thức"
                            value={paymentMethod === 'cash' ? 'Tiền mặt' : 'QR Code'}
                            prefix={paymentMethod === 'cash' ?
                                <MoneyCollectOutlined style={{color: '#52c41a'}}/> :
                                <QrcodeOutlined style={{color: '#722ed1'}}/>
                            }
                            valueStyle={{color: paymentMethod === 'cash' ? '#52c41a' : '#722ed1'}}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Danh sách đồ uống */}
                <Col xs={24} lg={16}>
                    <Card
                        className="glass-card"
                        title={
                            <Space>
                                <CoffeeOutlined/>
                                Danh sách đồ uống
                            </Space>
                        }
                        extra={
                            <Space>
                                <Text>Cho phép tồn kho âm:</Text>
                                <Switch
                                    checked={allowNegativeStock}
                                    onChange={setAllowNegativeStock}
                                    checkedChildren="BẬT"
                                    unCheckedChildren="TẮT"
                                />
                                <Tooltip
                                    title="Khi bật, bạn có thể bán kể cả khi không đủ nguyên liệu. Tồn kho sẽ chuyển thành số âm.">
                                    <InfoCircleOutlined style={{color: '#1890ff'}}/>
                                </Tooltip>
                            </Space>
                        }
                    >
                        {!allowNegativeStock && (
                            <Alert
                                message="Chế độ kiểm tra tồn kho"
                                description="Hiện tại đang kiểm tra tồn kho. Bạn chỉ có thể bán khi đủ nguyên liệu."
                                type="info"
                                style={{marginBottom: 16}}
                                showIcon
                            />
                        )}

                        {allowNegativeStock && (
                            <Alert
                                message="Chế độ tồn kho âm"
                                description="Bạn có thể bán thoải mái. Tồn kho sẽ chuyển thành số âm nếu không đủ nguyên liệu."
                                type="warning"
                                style={{marginBottom: 16}}
                                showIcon
                            />
                        )}

                        <Row gutter={[16, 16]}>
                            {drinks.map(drink => {
                                const availability = checkDrinkAvailability(drink);
                                const canSell = allowNegativeStock || availability.canMake > 0;

                                return (
                                    <Col xs={24} sm={12} lg={8} key={drink.id}>
                                        <Card
                                            size="small"
                                            title={drink.name}
                                            extra={
                                                allowNegativeStock ? (
                                                    <Tag color="blue">Không giới hạn</Tag>
                                                ) : (
                                                    <Tag
                                                        color={availability.canMake > 5 ? 'green' : availability.canMake > 0 ? 'orange' : 'red'}>
                                                        {availability.canMake > 0 ? `Còn ${availability.canMake}` : 'Hết'}
                                                    </Tag>
                                                )
                                            }
                                            actions={[
                                                drink.price?.S && <Button
                                                    size="small"
                                                    onClick={() => addToCart(drink, 'S')}
                                                    disabled={!canSell}
                                                    type={canSell ? 'default' : 'dashed'}
                                                >
                                                    S: {drink.price?.S?.toLocaleString()}đ
                                                </Button>,
                                                drink.price?.M && <Button
                                                    size="small"
                                                    onClick={() => addToCart(drink, 'M')}
                                                    disabled={!canSell}
                                                    type={canSell ? 'default' : 'dashed'}
                                                >
                                                    M: {drink.price?.M?.toLocaleString()}đ
                                                </Button>,
                                                drink.price?.L && <Button
                                                    size="small"
                                                    onClick={() => addToCart(drink, 'L')}
                                                    disabled={!canSell}
                                                    type={canSell ? 'default' : 'dashed'}
                                                >
                                                    L: {drink.price?.L?.toLocaleString()}đ
                                                </Button>
                                            ].filter(Boolean)}
                                        >
                                            <div style={{marginBottom: 8}}>
                                                <Text type="secondary">{drink.description}</Text>
                                            </div>
                                            {/*<div>*/}
                                            {/*    <Text strong>Nguyên liệu:</Text>*/}
                                            {/*    {renderIngredientsList(drink.ingredients)}*/}
                                            {/*</div>*/}
                                            {/*{!allowNegativeStock && availability.canMake <= 0 && (*/}
                                            {/*    <Alert*/}
                                            {/*        message={`Thiếu: ${availability.limitingIngredient}`}*/}
                                            {/*        type="error"*/}
                                            {/*        size="small"*/}
                                            {/*        style={{marginTop: 8}}*/}
                                            {/*    />*/}
                                            {/*)}*/}
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    </Card>
                </Col>

                {/* Giỏ hàng và thanh toán */}
                <Col xs={24} lg={8}>
                    <Card
                        className="glass-card"
                        title={
                            <Space>
                                <ShoppingCartOutlined/>
                                Giỏ hàng ({getTotalItems()} món)
                            </Space>
                        }
                    >
                        {/* Chọn phương thức thanh toán */}
                        <div style={{marginBottom: 16}}>
                            <Text strong>Phương thức thanh toán:</Text>
                            <Radio.Group
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{width: '100%', marginTop: 8}}
                            >
                                <Radio.Button value="cash" style={{width: '50%', textAlign: 'center'}}>
                                    <Space>
                                        <MoneyCollectOutlined/>
                                        Tiền mặt
                                    </Space>
                                </Radio.Button>
                                <Radio.Button value="qr" style={{width: '50%', textAlign: 'center'}}>
                                    <Space>
                                        <QrcodeOutlined/>
                                        QR Code
                                    </Space>
                                </Radio.Button>
                            </Radio.Group>
                        </div>

                        {/* Chọn QR Code (chỉ hiện khi chọn phương thức QR) */}
                        {paymentMethod === 'qr' && (
                            <div style={{marginBottom: 16}}>
                                <Text strong>Chọn QR Code:</Text>
                                <Select
                                    style={{width: '100%', marginTop: 8}}
                                    placeholder="Chọn QR code"
                                    value={selectedQRId}
                                    onChange={setSelectedQRId}
                                >
                                    {availableQRs.map(qr => (
                                        <Select.Option key={qr.id} value={qr.id}>
                                            <Space>
                                                <Tag color={qr.isDefault ? 'gold' : 'default'}>
                                                    {qr.bankName}
                                                </Tag>
                                                {qr.isDefault && <Text type="secondary">(Mặc định)</Text>}
                                            </Space>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                        )}

                        <Divider/>

                        {/* Danh sách món trong giỏ */}
                        <List
                            dataSource={cart}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            type="text"
                                            icon={<MinusOutlined/>}
                                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                        />,
                                        <InputNumber
                                            size="small"
                                            min={1}
                                            max={allowNegativeStock ? 999 : item.maxQuantity}
                                            value={item.quantity}
                                            onChange={(value) => updateCartQuantity(item.id, value)}
                                            style={{width: 60}}
                                        />,
                                        <Button
                                            type="text"
                                            icon={<PlusOutlined/>}
                                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                            disabled={!allowNegativeStock && item.quantity >= item.maxQuantity}
                                        />,
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined/>}
                                            onClick={() => removeFromCart(item.id)}
                                        />
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Text>{item.drinkName}</Text>
                                                <Tag color="blue">{item.size}</Tag>
                                                {!item.hasStock && !allowNegativeStock && (
                                                    <Tag color="red" icon={<WarningOutlined/>}>Thiếu NL</Tag>
                                                )}
                                                {!item.hasStock && allowNegativeStock && (
                                                    <Tag color="orange" icon={<InfoCircleOutlined/>}>Tồn kho âm</Tag>
                                                )}
                                            </Space>
                                        }
                                        description={
                                            <Space direction="vertical" size="small">
                                                <Text>{item.price.toLocaleString()}đ x {item.quantity}</Text>
                                                <Text strong style={{color: '#52c41a'}}>
                                                    = {(item.price * item.quantity).toLocaleString()}đ
                                                </Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                            locale={{
                                emptyText: (
                                    <Empty
                                        description="Giỏ hàng trống"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )
                            }}
                        />

                        <Divider/>

                        {/* Tổng tiền và thanh toán */}
                        <div style={{textAlign: 'center'}}>
                            <Title level={3} style={{color: '#52c41a', margin: '16px 0'}}>
                                Tổng: {getTotalAmount().toLocaleString()}đ
                            </Title>

                            <Button
                                type="primary"
                                size="large"
                                icon={paymentMethod === 'cash' ? <MoneyCollectOutlined/> : <QrcodeOutlined/>}
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || (paymentMethod === 'qr' && !selectedQRId)}
                                loading={loading && paymentMethod === 'cash'}
                                style={{width: '100%'}}
                            >
                                {paymentMethod === 'cash' ? 'Thanh toán tiền mặt' : 'Thanh toán QR Code'}
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Modal QR Code thanh toán */}
            <Modal
                title={
                    <Space>
                        <QrcodeOutlined/>
                        Thanh toán QR Code - {paymentQR?.bankName}
                    </Space>
                }
                open={qrModalVisible}
                onCancel={() => setQrModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setQrModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button
                        key="complete"
                        type="primary"
                        loading={loading}
                        onClick={handlePaymentComplete}
                        icon={<CheckCircleOutlined/>}
                    >
                        Xác nhận đã thanh toán
                    </Button>
                ]}
                width={700}
            >
                {paymentQR && (
                    <div style={{textAlign: 'center'}}>
                        <div style={{marginBottom: 20}}>
                            <img
                                src={paymentQR.vietQRUrl}
                                alt="VietQR Code"
                                style={{
                                    maxWidth: 250,
                                    border: '2px solid #f0f0f0',
                                    borderRadius: '8px'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>

                        <Card style={{marginTop: 20, textAlign: 'left'}}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Text strong>Ngân hàng:</Text> {paymentQR.bankName}
                                </Col>
                                <Col span={12}>
                                    <Text strong>Số TK:</Text> {paymentQR.accountNumber}
                                </Col>
                                <Col span={12}>
                                    <Text strong>Chủ TK:</Text> {paymentQR.accountName}
                                </Col>
                                <Col span={12}>
                                    <Text strong>Số tiền:</Text>
                                    <Text style={{color: '#52c41a', fontWeight: 'bold'}}>
                                        {paymentQR.amount.toLocaleString()}đ
                                    </Text>
                                </Col>
                                <Col span={24}>
                                    <Text strong>Nội dung:</Text> {paymentQR.description}
                                </Col>
                            </Row>
                        </Card>

                        <Alert
                            message="Hướng dẫn thanh toán"
                            description={
                                <div>
                                    <p><strong>Cách 1:</strong> Mở ứng dụng ngân hàng → Quét QR → Quét mã QR phía trên
                                    </p>
                                    <p><strong>Cách 2:</strong> Mở MoMo/ZaloPay → Quét QR → Quét mã QR phía trên</p>
                                    <p><strong>Lưu ý:</strong> Kiểm tra số tiền và nội dung trước khi xác nhận thanh
                                        toán</p>
                                </div>
                            }
                            type="info"
                            style={{marginTop: 16, textAlign: 'left'}}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SalesPage;
