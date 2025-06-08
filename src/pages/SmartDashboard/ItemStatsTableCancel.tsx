import React from "react";
import { Table, Typography } from "antd";

const { Title } = Typography;

// Lấy danh sách các size có trong dữ liệu
const getAllSizes = (itemStats) => {
    const sizeSet = new Set();
    Object.values(itemStats || {}).forEach((item) => {
        Object.keys(item.sizes || {}).forEach((size) => sizeSet.add(size));
    });
    return Array.from(sizeSet);
};

// Hàm tạo columns động theo size
const getColumns = (sizes) => [
    { title: "Mã đơn hàng hủy", dataIndex: "key", key: "key" },
    { title: "Tên món", dataIndex: "name", key: "name" },
    { title: "Tổng SL", dataIndex: "totalQty", key: "totalQty" },
    { title: "Tổng giá bán", dataIndex: "totalOriginal", key: "totalOriginal", render: v => v.toLocaleString() },
];

// Hàm tạo dataSource cho bảng
const getDataSource = (itemStats, sizes) =>
    Object.entries(itemStats).map(([id, stat]) => {
        const row = {
            key: id,
            name: stat.name,
            totalQty: stat.totalQty,
            totalOriginal: stat.totalOriginal,
            totalCost: stat.totalCost,
            totalProfit: stat.totalProfit,
        };
        sizes.forEach((size) => {
            row[`size_${size}_qty`] = stat.sizes[size]?.qty || 0;
            row[`size_${size}_original`] = stat.sizes[size]?.original || 0;
            row[`size_${size}_cost`] = stat.sizes[size]?.cost || 0;
            row[`size_${size}_profit`] = stat.sizes[size]?.profit || 0;
        });
        return row;
    });


// Component hiển thị bảng thống kê món/size
const ItemStatsTableCancel = ({ itemStats, title = "Thống kê chi tiết từng món & từng size" }) => {
    if (!itemStats || Object.keys(itemStats).length === 0) return null;
    const sizes = getAllSizes(itemStats);
    const columns = getColumns(sizes);
    const dataSource = getDataSource(itemStats, sizes);

    return (
        <div style={{ marginTop: 32 }}>
            <Title level={4} style={{ marginBottom: 16 }}>{title}</Title>
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={{ pageSize: 10 }}
                bordered
                size="small"
                scroll={{ x: true }}
            />
        </div>
    );
};

export default ItemStatsTableCancel;
