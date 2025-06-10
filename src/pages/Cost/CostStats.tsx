import React, { useMemo, useState } from "react";
import { Statistic, Row, Col, Card, Tag, Segmented, Select, DatePicker, Table } from "antd";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

const TIME_OPTIONS = [
    { label: "Ngày", value: "day" },
    { label: "Tuần", value: "week" },
    { label: "Tháng", value: "month" },
    { label: "Năm", value: "year" },
    { label: "Tùy chọn", value: "custom" },
];

const CostStats: React.FC<{ costs: any[] }> = ({ costs }) => {
    const [timeType, setTimeType] = useState<"day" | "week" | "month" | "year" | "custom">("month");
    const [group, setGroup] = useState<string | undefined>(undefined);
    const [customRange, setCustomRange] = useState<[Dayjs, Dayjs] | null>(null);

    // Tính ngày bắt đầu cho từng loại
    const today = dayjs();
    const periodStart = useMemo(() => {
        switch (timeType) {
            case "day":
                return today.startOf("day");
            case "week":
                return today.startOf("week");
            case "month":
                return today.startOf("month");
            case "year":
                return today.startOf("year");
            default:
                return today.startOf("month");
        }
    }, [timeType, today]);

    // Lọc chi phí theo thời gian và nhóm
    const filtered = useMemo(() => {
        let data = costs;
        if (timeType === "custom" && customRange && customRange[0] && customRange[1]) {
            data = data.filter((c) =>
                dayjs(c.date).isSameOrAfter(customRange[0].startOf("day")) &&
                dayjs(c.date).isSameOrBefore(customRange[1].endOf("day"))
            );
        } else if (timeType !== "custom") {
            data = data.filter((c) =>
                dayjs(c.date).isSameOrAfter(periodStart)
            );
        }
        if (group) data = data.filter((c) => c.group === group);
        return data;
    }, [costs, periodStart, group, timeType, customRange]);

    // Thống kê tổng các mốc
    const totalAll = costs.reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalPeriod = filtered.reduce((sum, c) => sum + (c.amount || 0), 0);

    // Thống kê theo nhóm
    const groupStats = useMemo(() => {
        const result: Record<string, number> = {};
        for (const c of filtered) {
            const key = c.group || "Khác";
            result[key] = (result[key] || 0) + (c.amount || 0);
        }
        return result;
    }, [filtered]);

    // Danh sách nhóm chi phí
    const groupOptions = Array.from(new Set(costs.map(c => c.group || "Khác"))).map(g => ({
        value: g,
        label: g,
    }));

    return (
        <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col>
                    <Segmented
                        options={TIME_OPTIONS}
                        value={timeType}
                        onChange={val => setTimeType(val as any)}
                    />
                </Col>
                <Col>
                    <Select
                        allowClear
                        placeholder="Lọc theo nhóm"
                        value={group}
                        onChange={setGroup}
                        style={{ minWidth: 140 }}
                        options={groupOptions}
                    />
                </Col>
                {timeType === "custom" && (
                    <Col>
                        <RangePicker
                            value={customRange as any}
                            onChange={dates => setCustomRange(dates as [Dayjs, Dayjs] | null)}
                            format="DD/MM/YYYY"
                            allowClear
                        />
                    </Col>
                )}
            </Row>
            <Row gutter={[16, 16]}>
                <Col xs={12} md={8}>
                    <Statistic
                        title="Tổng chi phí"
                        value={totalAll}
                        suffix="₫"
                        valueStyle={{ color: "#d4380d" }}
                    />
                </Col>
                <Col xs={12} md={8}>
                    <Statistic
                        title={`Chi phí ${
                            timeType === "custom"
                                ? "tùy chọn"
                                : TIME_OPTIONS.find(t => t.value === timeType)?.label?.toLowerCase() || ""
                        }`}
                        value={totalPeriod}
                        suffix="₫"
                        valueStyle={{ color: "#096dd9" }}
                    />
                </Col>
            </Row>
            <Card size="small" style={{ marginTop: 24 }} title="Chi phí theo nhóm">
                <Row gutter={[16, 16]}>
                    {Object.keys(groupStats).length === 0 && (
                        <Col>
                            <Tag color="default">Không có dữ liệu</Tag>
                        </Col>
                    )}
                    {Object.keys(groupStats).map((g) => (
                        <Col xs={24} sm={12} md={6} key={g}>
                            <Tag color="blue">{g}</Tag>
                            <b>{groupStats[g].toLocaleString("vi-VN")} ₫</b>
                        </Col>
                    ))}
                </Row>
            </Card>
            <Card size="small" style={{ marginTop: 24 }} title="Danh sách chi phí đã lọc">
                <Table
                    dataSource={filtered}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    columns={[
                        { title: "Tên chi phí", dataIndex: "name" },
                        {
                            title: "Nhóm",
                            dataIndex: "group",
                            render: (group: string) => <Tag color="blue">{group}</Tag>,
                        },
                        {
                            title: "Số tiền",
                            dataIndex: "amount",
                            render: (amount: number) =>
                                amount.toLocaleString("vi-VN") + " ₫",
                        },
                        { title: "Ngày", dataIndex: "date" },
                        { title: "Ghi chú", dataIndex: "note" },
                    ]}
                />
            </Card>
        </div>
    );
};

export default CostStats;
