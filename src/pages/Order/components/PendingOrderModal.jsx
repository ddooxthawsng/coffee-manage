import React from "react";
import {Button, Modal, Table} from "antd";
import {CheckOutlined} from "@ant-design/icons";
import dayjs from "dayjs";

const PendingOrderModal = ({open, onClose, orders, onFinishOrder}) => (
    <Modal
        open={open}
        onCancel={onClose}
        title="Đơn chờ xử lý"
        footer={null}
        width={800}
    >
        <Table
            dataSource={
                [...orders]
                    .filter(order => order.status === "processing")
                    .sort(
                        (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
                    )
            }
            rowKey="id"
            size="small"
            columns={[
                {
                    title: "Món đã order",
                    dataIndex: "items",
                    width: 300,
                    render: ((items, record) => {
                        return (
                            <>
                                {console.log("items", record)}
                                <span
                                    style={{fontWeight: "bold"}}>{record.createdAt ? "Thời gian order : " + dayjs(record.createdAt.toDate?.() || record.createdAt).format("HH:mm:ss DD/MM/YYYY") : ""}</span>
                                <ul style={{margin: 0}}>
                                    {(items || []).map((item, idx) => (
                                        <li key={idx}>
                                            <b>{item.name}</b>
                                            {item.size && <span style={{color: "#888"}}> ({item.size})</span>}
                                            {item.quantity && <> × <b>{item.quantity}</b></>}
                                            {item.toppings && item.toppings.length > 0 && (
                                                <span style={{color: "#888", marginLeft: 8}}>
                                            [Topping: {item.toppings.map(t => `${t.name}${t.quantity > 1 ? ` x${t.quantity}` : ""}`).join(", ")}]
                                        </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )
                    })
                },
                {
                    title: "",
                    dataIndex: "id",
                    render: (id, record) => (
                        record.status === "processing" ? (
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<CheckOutlined/>}
                                size="small"
                                onClick={() => onFinishOrder(record.id)}
                            />
                        ) : <span style={{color: "#52c41a"}}>✓</span>
                    ),
                    width: 20,
                    align: "end"
                }
            ]}
            pagination={false}
            scroll={{x: true}}
        />
    </Modal>
);

export default PendingOrderModal;
