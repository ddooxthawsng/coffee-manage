import React from "react";
import { Button, Modal, Table, Tag, Badge, Divider } from "antd";
import { CheckOutlined, ShopOutlined, CarryOutOutlined, TransactionOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

// Hàm render danh sách món đã order với layout tối ưu
const renderOrderItems = (items, createdAt, record, index, onFinishOrder, isSmallScreen = false) => (
    <div
        className={`
            bg-white p-2 sm:p-4 rounded-lg sm:rounded-2xl border-2 shadow-md relative overflow-hidden mb-1 sm:mb-2
            ${index % 2 === 0 ? 'border-blue-400' : 'border-green-400'}
            ${isSmallScreen ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
        `}
        onClick={isSmallScreen ? () => showConfirmFinishOrder(record, onFinishOrder, index) : undefined}
    >
        {/* Thanh màu bên trái */}
        <div className={`
            absolute left-0 top-0 bottom-0 w-1
            ${index % 2 === 0 ? 'bg-gradient-to-b from-blue-500 to-blue-400' : 'bg-gradient-to-b from-green-500 to-green-400'}
        `} />

        {/* Header thông tin đơn hàng - compact */}
        <div className={`
            p-2 sm:p-3 rounded-lg sm:rounded-xl mb-2 sm:mb-3 text-white shadow-sm ml-1 sm:ml-2
            ${index % 2 === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-gradient-to-r from-green-500 to-green-400'}
        `}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                    {record.orderType === "dine-in" ? (
                        <ShopOutlined className="text-white text-xs sm:text-sm shrink-0" />
                    ) : (
                        <CarryOutOutlined className="text-white text-xs sm:text-sm shrink-0" />
                    )}
                    <span className="font-bold text-sm sm:text-base truncate">
                        Bàn {record.tableNumber}
                    </span>
                    <span className="text-xs sm:text-sm opacity-90 shrink-0">
                        {createdAt ? dayjs(createdAt.toDate?.() || createdAt).format("HH:mm") : ""}
                    </span>
                    <span className="text-xs opacity-75 hidden sm:inline shrink-0">
                        • {record.orderType === "dine-in" ? "Tại chỗ" : "Mang về"}
                    </span>
                </div>
                <div className="bg-white bg-opacity-20 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold shrink-0 ml-1 sm:ml-2">
                    #{index + 1}
                </div>
            </div>
        </div>

        {/* Danh sách món - compact */}
        <div className="px-1 sm:px-3">
            {(items || []).map((item, idx) => (
                <div
                    key={idx}
                    className={`
                        mb-2 sm:mb-3 p-2 sm:p-3 rounded-lg shadow-sm
                        ${index % 2 === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}
                    `}
                >
                    {/* Tên món và số lượng */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-bold text-gray-800 text-sm sm:text-base truncate">
                                {item.name}
                            </span>
                            {item.size && (
                                <span className={`
                                    text-xs sm:text-sm font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border shrink-0
                                    ${index % 2 === 0
                                    ? 'text-blue-600 bg-blue-100 border-blue-300'
                                    : 'text-green-600 bg-green-100 border-green-300'
                                }
                                `}>
                                    {item.size}
                                </span>
                            )}
                        </div>

                        {/* Số lượng compact */}
                        {item.quantity && (
                            <div className={`
                                w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-white text-xs sm:text-sm rounded-md shadow-sm ml-2
                                ${index % 2 === 0
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                : 'bg-gradient-to-br from-green-500 to-green-600'
                            }
                            `}>
                                {item.quantity}
                            </div>
                        )}
                    </div>

                    {/* Topping */}
                    {item.toppings && item.toppings.length > 0 && (
                        <div className={`
                            p-2 rounded-md text-xs sm:text-sm mb-2
                            ${index % 2 === 0 ? 'bg-blue-100 border border-blue-300' : 'bg-green-100 border border-green-300'}
                        `}>
                            <span className={`font-bold mr-1 ${index % 2 === 0 ? 'text-blue-700' : 'text-green-700'}`}>
                                🧋
                            </span>
                            <span className="text-gray-600 font-medium">
                                {item.toppings.map(t => `${t.name}${t.quantity > 1 ? ` x${t.quantity}` : ""}`).join(", ")}
                            </span>
                        </div>
                    )}

                    {/* Ghi chú */}
                    {item.customerNote && (
                        <div className="p-2 bg-orange-50 border border-orange-200 border-l-2 border-l-orange-400 rounded-md text-xs sm:text-sm">
                            <span className="text-orange-600 font-bold mr-1">📝</span>
                            <span className="text-orange-700 font-medium">{item.customerNote}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Indicator cho mobile - hiển thị khi có thể click */}
        {isSmallScreen && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-80">
                ✓
            </div>
        )}
    </div>
);

// Modal xác nhận
const showConfirmFinishOrder = (record, onFinishOrder, index) => {
    Modal.confirm({
        centered: true,
        title: (
            <div className="flex items-center gap-3 text-base sm:text-lg font-bold text-gray-800">
                <CheckOutlined className="text-green-500 text-lg sm:text-xl" />
                Xác nhận hoàn thành đơn #{index + 1}
            </div>
        ),
        content: (
            <div>
                <div className="p-3 bg-gray-50 rounded-lg mb-4 text-sm sm:text-base font-medium text-gray-800 border border-gray-200">
                    Bạn có chắc chắn muốn hoàn thành đơn hàng này?
                </div>
                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                    {renderOrderItems(record.items, record.createdAt, record, index, onFinishOrder, false)}
                </div>
            </div>
        ),
        okText: "✅ HOÀN THÀNH",
        cancelText: "❌ HỦY",
        okButtonProps: {
            className: "bg-green-500 border-green-500 font-bold text-sm h-9 sm:h-10"
        },
        cancelButtonProps: {
            className: "font-semibold text-sm h-9 sm:h-10"
        },
        width: "90vw",
        style: { maxWidth: 600 },
        onOk: async () => {
            onFinishOrder(record.id);
        }
    });
};

const PendingOrderModal = ({ open, onClose, orders, onFinishOrder }) => {
    // Detect screen size
    const [isSmallScreen, setIsSmallScreen] = React.useState(window.innerWidth < 640);

    React.useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={
                <div className="flex items-center gap-2 sm:gap-3 text-base sm:text-xl font-bold text-gray-800">
                    <TransactionOutlined className="text-blue-500 text-lg sm:text-2xl" />
                    <span className="text-sm sm:text-xl">ĐƠN CHỜ XỬ LÝ</span>
                    <Badge
                        count={orders?.filter(order => order.status === "processing")?.length || 0}
                        className="bg-red-500 text-xs font-bold min-w-5 sm:min-w-7 h-5 sm:h-7"
                    />
                </div>
            }
            footer={null}
            // Thay đổi để modal full màn hình
            width="100vw"
            height="100vh"
            style={{
                maxWidth: "100vw",
                maxHeight: "100vh",
                margin: 0,
                padding: 0,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
            styles={{
                body: {
                    overflowY: "auto",
                    padding: isSmallScreen ? "4px" : "12px",
                    background: "#f5f5f5"
                },
                content: {
                    height: "100vh",
                    borderRadius: 0
                },
                header: {
                    borderRadius: 0,
                    marginBottom: 0
                }
            }}
            className="!p-0 !m-0"
            maskStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)'
            }}
        >
            <div className="flex flex-col gap-1 sm:gap-3 h-full">
                {[...orders]
                    .filter(order => order.status === "processing")
                    .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
                    .map((record, index) => (
                        <div
                            key={record.id}
                            className={`
                                bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden
                                ${isSmallScreen ? 'p-1' : 'p-2 sm:p-3 flex gap-3'}
                            `}
                        >
                            <div className={`${isSmallScreen ? 'w-full' : 'flex-1 min-w-0'}`}>
                                {renderOrderItems(record.items, record.createdAt, record, index, onFinishOrder, isSmallScreen)}
                            </div>

                            {/* Nút hoàn thành - chỉ hiển thị trên desktop */}
                            {!isSmallScreen && (
                                <div className="flex flex-col items-center justify-center gap-2 w-16 shrink-0">
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        icon={<CheckOutlined />}
                                        size="large"
                                        className="bg-green-500 border-green-500 shadow-lg w-12 h-12 text-base"
                                        onClick={() => showConfirmFinishOrder(record, onFinishOrder, index)}
                                    />
                                    <span className="text-xs font-semibold text-green-600 text-center leading-tight">
                                        HOÀN<br />THÀNH
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                }
            </div>

            {/* Hướng dẫn cho mobile */}
            {isSmallScreen && orders?.filter(order => order.status === "processing")?.length > 0 && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <span className="text-xs text-blue-600 font-medium">
                        💡 Chạm vào đơn hàng để hoàn thành
                    </span>
                </div>
            )}

            {orders?.filter(order => order.status === "processing")?.length === 0 && (
                <div className="text-center p-8 sm:p-15 text-gray-500 text-base sm:text-lg bg-white rounded-lg shadow-sm">
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-5">🎉</div>
                    <div className="font-semibold text-lg sm:text-xl mb-2">
                        Không có đơn hàng nào đang chờ xử lý
                    </div>
                    <div className="text-sm sm:text-base">
                        Tất cả đơn hàng đã được hoàn thành!
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default PendingOrderModal;
