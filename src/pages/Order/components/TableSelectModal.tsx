import {useState} from "react";
import {Modal, notification, Radio} from "antd";
import {CarryOutOutlined, ShopOutlined} from "@ant-design/icons";

const TableSelectModal = ({
                              open,
                              onCancel,
                              onOk,
                              selectedTable,
                              setSelectedTable,
                              processingTables
                          }) => {
    console.log("processingTables", processingTables)
    const [orderType, setOrderType] = useState("dine-in");
    const isMobile = window.innerWidth < 768;

    const handleConfirm = () => {
        if (!selectedTable || processingTables.includes(selectedTable)) {
            notification.warning({message: "Vui lòng chọn số bàn!"});
            return;
        }
        onOk({orderType, tableNumber: selectedTable});
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
            width={isMobile ? "95%" : 650}
            centered
        >
            {/* Chọn loại đơn hàng */}
            <div style={{marginBottom: 24}}>
                <h4 style={{marginBottom: 16, fontSize: 16, fontWeight: 600}}>
                    Loại đơn hàng:
                </h4>
                <Radio.Group
                    value={orderType}
                    onChange={e => setOrderType(e.target.value)}
                    style={{width: "100%"}}
                >
                    <div style={{display: "flex", gap: 12, width: "100%"}}>
                        <Radio.Button
                            value="dine-in"
                            style={{
                                flex: 1,
                                height: 60,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 16,
                                fontWeight: 500,
                                borderRadius: 8,
                                background: orderType === "dine-in" ? "#e6f7ff" : "#fff"
                            }}
                        >
                            <ShopOutlined style={{marginRight: 8, fontSize: 18}}/>
                            Ngồi quán
                        </Radio.Button>
                        <Radio.Button
                            value="takeaway"
                            style={{
                                flex: 1,
                                height: 60,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 16,
                                fontWeight: 500,
                                borderRadius: 8,
                                background: orderType === "takeaway" ? "#e6f7ff" : "#fff"
                            }}
                        >
                            <CarryOutOutlined style={{marginRight: 8, fontSize: 18}}/>
                            Mang về
                        </Radio.Button>
                    </div>
                </Radio.Group>
            </div>

            {/* Chọn số bàn (hiện cho cả hai loại) */}
            <div>
                <h4 style={{marginBottom: 16, fontSize: 16, fontWeight: 600}}>
                    Chọn số bàn:
                </h4>
                <Radio.Group
                    value={selectedTable}
                    onChange={e => setSelectedTable(e.target.value)}
                    style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(5, 1fr)",
                        gap: isMobile ? 8 : 12,
                        width: "100%"
                    }}
                >
                    {Array.from({length: 30}).map((_, idx) => {
                        const num = idx + 1;
                        const disabled = processingTables.includes(num) || processingTables.includes(num.toString());
                        const isSelected = selectedTable === num;

                        return (
                            <Radio.Button
                                key={num}
                                value={num}
                                disabled={disabled}
                                style={{
                                    height: isMobile ? 48 : 56,
                                    minWidth: isMobile ? 48 : 56,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: isMobile ? 16 : 18,
                                    fontWeight: 600,
                                    borderRadius: 8,
                                    border: isSelected ? "2px solid #1890ff" : "2px solid #d9d9d9",
                                    background: disabled
                                        ? "#f5f5f5"
                                        : isSelected
                                            ? "#e6f7ff"
                                            : "#fff",
                                    color: disabled
                                        ? "#bfbfbf"
                                        : isSelected
                                            ? "#1890ff"
                                            : "#262626",
                                    position: "relative"
                                }}
                            >
                                {num}
                                {disabled && (
                                    <div style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: "rgba(0, 0, 0, 0.1)",
                                        borderRadius: 6,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <span style={{
                                            fontSize: isMobile ? 10 : 12,
                                            color: "#ff4d4f",
                                            fontWeight: 500
                                        }}>
                                            Bận
                                        </span>
                                    </div>
                                )}
                            </Radio.Button>
                        );
                    })}
                </Radio.Group>
            </div>

            {/* Thông tin hướng dẫn */}
            <div style={{
                marginTop: 16,
                padding: "12px 16px",
                background: "#f6f8fa",
                borderRadius: 8,
                border: "1px solid #e1e4e8"
            }}>
                <div style={{
                    color: "#586069",
                    fontSize: isMobile ? 13 : 14,
                    lineHeight: 1.4,
                    textAlign: "center"
                }}>
                    {orderType === "dine-in" ? (
                        <>
                            <span style={{fontWeight: 500}}>🍽️ Ngồi quán:</span>
                            <br/>
                            Khách hàng sẽ ngồi tại bàn để dùng bữa
                        </>
                    ) : (
                        <>
                            <span style={{fontWeight: 500}}>🥡 Mang về:</span>
                            <br/>
                            Khách hàng sẽ mang đồ ăn về nhà (vẫn cần chọn số bàn để quản lý)
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default TableSelectModal;
