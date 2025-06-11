import React, { useState, useEffect } from "react";
import { Modal, notification, Radio, Select } from "antd";
import { CarryOutOutlined, ShopOutlined, SettingOutlined } from "@ant-design/icons";

const { Option } = Select;

const TableSelectModal = ({
                              open,
                              onCancel,
                              onOk,
                              selectedTable,
                              setSelectedTable,
                              processingTables
                          }) => {
    const [orderType, setOrderType] = useState("dine-in");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [columnsPerRow, setColumnsPerRow] = useState(4);

    // Tự động điều chỉnh số cột theo kích thước màn hình
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);

            if (width < 576) {
                setColumnsPerRow(3);
            } else if (width < 768) {
                setColumnsPerRow(4);
            } else if (width < 1200) {
                setColumnsPerRow(5);
            } else if (width < 1600) {
                setColumnsPerRow(6);
            } else {
                setColumnsPerRow(8);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (open && isMobile) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${window.scrollY}px`;
        } else {
            const scrollY = document.body.style.top;
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
        };
    }, [open, isMobile]);

    const handleConfirm = () => {
        if (!selectedTable || processingTables.includes(selectedTable)) {
            notification.warning({ message: "Vui lòng chọn số bàn!" });
            return;
        }
        onOk({ orderType, tableNumber: selectedTable });
    };

    return (
        <Modal
            open={open}
            title="Chọn loại đơn hàng và số bàn"
            onCancel={onCancel}
            onOk={handleConfirm}
            okText="Xác nhận"
            cancelText="Hủy"
            destroyOnClose
            width={isMobile ? "100vw" : Math.min(800, window.innerWidth * 0.9)}
            centered={!isMobile}
            style={isMobile ? {
                top: 0,
                paddingBottom: 0,
                maxWidth: "100vw",
                margin: 0
            } : {}}
            styles={{
                body: {
                    maxHeight: isMobile ? "calc(100vh - 120px)" : "75vh",
                    overflowY: "auto",
                    padding: isMobile ? "12px" : "20px"
                },
                content: {
                    height: isMobile ? "100vh" : "auto",
                    display: "flex",
                    flexDirection: "column"
                },
                header: {
                    padding: isMobile ? "12px 16px" : "16px 20px",
                    marginBottom: 0
                },
                footer: {
                    padding: isMobile ? "12px 16px" : "16px 20px",
                    marginTop: 0
                }
            }}
        >
            {/* Chọn loại đơn hàng */}
            <div className="mb-4">
                <h4 className="mb-3 text-sm sm:text-base font-semibold">
                    Loại đơn hàng:
                </h4>
                <div className="flex gap-2 w-full">
                    <button
                        onClick={() => setOrderType("dine-in")}
                        className={`
                            flex-1 h-12 flex items-center justify-center 
                            text-sm font-medium rounded-lg border-2 transition-all
                            ${orderType === "dine-in"
                            ? "bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-700 hover:border-blue-300"
                        }
                        `}
                    >
                        <ShopOutlined className="mr-2 text-base" />
                        Ngồi quán
                    </button>
                    <button
                        onClick={() => setOrderType("takeaway")}
                        className={`
                            flex-1 h-12 flex items-center justify-center 
                            text-sm font-medium rounded-lg border-2 transition-all
                            ${orderType === "takeaway"
                            ? "bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-700 hover:border-blue-300"
                        }
                        `}
                    >
                        <CarryOutOutlined className="mr-2 text-base" />
                        Mang về
                    </button>
                </div>
            </div>

            {/* Điều chỉnh số cột - compact hơn */}
            {!isMobile && (
                <div className="mb-4 flex items-center gap-3">
                    <SettingOutlined className="text-gray-500" />
                    <span className="text-sm font-medium">Số ô/dòng:</span>
                    <Select
                        value={columnsPerRow}
                        onChange={setColumnsPerRow}
                        size="small"
                        style={{ width: 80 }}
                    >
                        <Option value={3}>3</Option>
                        <Option value={4}>4</Option>
                        <Option value={5}>5</Option>
                        <Option value={6}>6</Option>
                        <Option value={7}>7</Option>
                        <Option value={8}>8</Option>
                    </Select>
                </div>
            )}

            {/* Chọn số bàn */}
            <div className="flex-1 flex flex-col">
                <h4 className="mb-3 text-sm sm:text-base font-semibold">
                    Chọn số bàn:
                </h4>
                <div className="flex-1 overflow-y-auto">
                    <div
                        className="grid gap-2"
                        style={{
                            gridTemplateColumns: `repeat(${isMobile ? 4 : columnsPerRow}, 1fr)`
                        }}
                    >
                        {Array.from({ length: 30 }).map((_, idx) => {
                            const num = idx + 1;
                            const disabled = processingTables.includes(num) || processingTables.includes(num.toString());
                            const isSelected = selectedTable === num;

                            return (
                                <button
                                    key={num}
                                    disabled={disabled}
                                    onClick={() => !disabled && setSelectedTable(num)}
                                    className={`
                                        relative h-10 sm:h-12 
                                        flex items-center justify-center rounded-lg border-2
                                        text-sm sm:text-base font-semibold transition-all
                                        ${disabled
                                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                        : isSelected
                                            ? "bg-blue-50 border-blue-500 text-blue-600 shadow-md"
                                            : "bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                                    }
                                    `}
                                >
                                    {num}
                                    {disabled && (
                                        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-md flex items-center justify-center">
                                            <span className="text-xs text-red-500 font-medium">
                                                Bận
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Thông tin hướng dẫn - compact */}
            <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-600 text-xs sm:text-sm text-center">
                    {orderType === "dine-in" ? (
                        <span>🍽️ <strong>Ngồi quán:</strong> Khách hàng dùng bữa tại bàn</span>
                    ) : (
                        <span>🥡 <strong>Mang về:</strong> Khách hàng mang đồ ăn về nhà</span>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default TableSelectModal;
