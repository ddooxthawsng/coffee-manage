import React from "react";
import { Table, Typography } from "antd";
import dayjs from "dayjs";

const { Title } = Typography;

const DiscountStatsTable = ({ discountStats }) => {
    if (!discountStats || Object.keys(discountStats).length === 0) return null;

    const columns = [
        { title: "Mã/Chương trình", dataIndex: "code", key: "code" },
        { title: "Loại", dataIndex: "promotionType", key: "promotionType" },
        { title: "Giá trị", dataIndex: "promotionValue", key: "promotionValue" },
        { title: "Số lần dùng", dataIndex: "count", key: "count" },
        { title: "Tổng tiền đã giảm", dataIndex: "totalDiscount", key: "totalDiscount", render: v => v.toLocaleString() },
        { title: "Tổng giá trị đơn hàng", dataIndex: "totalOrder", key: "totalOrder", render: v => v.toLocaleString() },
        { title: "Lần dùng gần nhất", dataIndex: "lastUsed", key: "lastUsed", render: v => v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "" },
    ];

    const dataSource = Object.values(discountStats);

    // Footer tổng
    const footerSummary = () => {
        const totalCount = dataSource.reduce((sum, d) => sum + d.count, 0);
        const totalDiscount = dataSource.reduce((sum, d) => sum + d.totalDiscount, 0);
        const totalOrder = dataSource.reduce((sum, d) => sum + d.totalOrder, 0);
        return (
            <Table.Summary.Row>
                <Table.Summary.Cell index={0}><b>Tổng cộng</b></Table.Summary.Cell>
                <Table.Summary.Cell index={1}></Table.Summary.Cell>
                <Table.Summary.Cell index={2}></Table.Summary.Cell>
                <Table.Summary.Cell index={3}><b>{totalCount}</b></Table.Summary.Cell>
                <Table.Summary.Cell index={4}><b>{totalDiscount.toLocaleString()}</b></Table.Summary.Cell>
                <Table.Summary.Cell index={5}><b>{totalOrder.toLocaleString()}</b></Table.Summary.Cell>
                <Table.Summary.Cell index={6}></Table.Summary.Cell>
            </Table.Summary.Row>
        );
    };

    return (
        <div style={{ marginTop: 32 }}>
            <Title level={4} style={{ marginBottom: 16 }}>Thống kê mã giảm giá đã dùng</Title>
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                bordered
                size="small"
                summary={footerSummary}
            />
        </div>
    );
};

export default DiscountStatsTable;
