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
    { title: "Tên món", dataIndex: "name", key: "name" },
    { title: "Tổng SL", dataIndex: "totalQty", key: "totalQty" },
    { title: "Tổng giá bán", dataIndex: "totalOriginal", key: "totalOriginal", render: v => v.toLocaleString() },
    { title: "Tổng cost", dataIndex: "totalCost", key: "totalCost", render: v => v.toLocaleString() },
    { title: "Tổng lãi", dataIndex: "totalProfit", key: "totalProfit", render: v => v.toLocaleString() },
    ...sizes.map((size) => ({
        title: `Size ${size}`,
        children: [
            { title: "SL", dataIndex: `size_${size}_qty`, key: `size_${size}_qty` },
            { title: "Giá", dataIndex: `size_${size}_original`, key: `size_${size}_original`, render: v => v.toLocaleString() },
            { title: "Cost", dataIndex: `size_${size}_cost`, key: `size_${size}_cost`, render: v => v.toLocaleString() },
            { title: "Lãi", dataIndex: `size_${size}_profit`, key: `size_${size}_profit`, render: v => v.toLocaleString() },
        ]
    })),
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

// Footer tổng cho bảng
const getFooterSummary = (itemStats, sizes) => {
    const footer = {
        totalQty: 0,
        totalOriginal: 0,
        totalCost: 0,
        totalProfit: 0,
    };
    sizes.forEach(size => {
        footer[`size_${size}_qty`] = 0;
        footer[`size_${size}_original`] = 0;
        footer[`size_${size}_cost`] = 0;
        footer[`size_${size}_profit`] = 0;
    });

    Object.values(itemStats).forEach(item => {
        footer.totalQty += item.totalQty || 0;
        footer.totalOriginal += item.totalOriginal || 0;
        footer.totalCost += item.totalCost || 0;
        footer.totalProfit += item.totalProfit || 0;
        sizes.forEach(size => {
            footer[`size_${size}_qty`] += item.sizes[size]?.qty || 0;
            footer[`size_${size}_original`] += item.sizes[size]?.original || 0;
            footer[`size_${size}_cost`] += item.sizes[size]?.cost || 0;
            footer[`size_${size}_profit`] += item.sizes[size]?.profit || 0;
        });
    });

    return (
        <Table.Summary.Row>
            <Table.Summary.Cell index={0}><b>Tổng cộng</b></Table.Summary.Cell>
            <Table.Summary.Cell index={1}><b>{footer.totalQty}</b></Table.Summary.Cell>
            <Table.Summary.Cell index={2}><b>{footer.totalOriginal.toLocaleString()}</b></Table.Summary.Cell>
            <Table.Summary.Cell index={3}><b>{footer.totalCost.toLocaleString()}</b></Table.Summary.Cell>
            <Table.Summary.Cell index={4}><b>{footer.totalProfit.toLocaleString()}</b></Table.Summary.Cell>
            {sizes.map((size, i) => [
                <Table.Summary.Cell key={`qty${size}`} index={5 + i * 4}><b>{footer[`size_${size}_qty`]}</b></Table.Summary.Cell>,
                <Table.Summary.Cell key={`original${size}`} index={6 + i * 4}><b>{footer[`size_${size}_original`].toLocaleString()}</b></Table.Summary.Cell>,
                <Table.Summary.Cell key={`cost${size}`} index={7 + i * 4}><b>{footer[`size_${size}_cost`].toLocaleString()}</b></Table.Summary.Cell>,
                <Table.Summary.Cell key={`profit${size}`} index={8 + i * 4}><b>{footer[`size_${size}_profit`].toLocaleString()}</b></Table.Summary.Cell>,
            ])}
        </Table.Summary.Row>
    );
};

// Component hiển thị bảng thống kê món/size
const ItemStatsTable = ({ itemStats, title = "Thống kê chi tiết từng món & từng size" }) => {
    if (!itemStats || Object.keys(itemStats).length === 0) return null;
    const sizes = getAllSizes(itemStats);
    const columns = getColumns(sizes);
    const dataSource = getDataSource(itemStats, sizes);
    const footerSummary = () => getFooterSummary(itemStats, sizes);

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
                summary={footerSummary}
            />
        </div>
    );
};

export default ItemStatsTable;
