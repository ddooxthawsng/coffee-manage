import React, { useMemo, useState, useEffect } from "react";
import { Statistic, Row, Col, Card, Tag, Segmented, Select, DatePicker, Table, Button, Space } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import * as XLSX from 'xlsx';

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
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

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

    // Reset pagination khi filter thay đổi - ĐÚNG CÁCH
    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [periodStart, group, timeType, customRange]);

    // Lọc chi phí theo thời gian và nhóm - KHÔNG CÒN setPagination
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

    // Hàm export Excel được cải tiến
    const exportToExcel = () => {
        try {
            const wb = XLSX.utils.book_new();

            // === SHEET 1: TỔNG QUAN ===
            const summaryData = [
                ["BÁO CÁO THỐNG KÊ CHI PHÍ", "", "", ""],
                ["", "", "", ""],
                ["Thông tin báo cáo", "", "", ""],
                ["Thời gian xuất:", dayjs().format("DD/MM/YYYY HH:mm:ss"), "", ""],
                ["Khoảng thời gian:", getPeriodLabel(), "", ""],
                ["Nhóm lọc:", group || "Tất cả nhóm", "", ""],
                ["Tổng số chi phí:", filtered.length + " mục", "", ""],
                ["", "", "", ""],
                ["THỐNG KÊ TỔNG QUAN", "", "", ""],
                ["Loại thống kê", "Số tiền (VNĐ)", "Tỷ lệ (%)", "Ghi chú"],
                ["Tổng chi phí (toàn bộ)", totalAll, "100%", "Tất cả chi phí trong hệ thống"],
                ["Tổng chi phí (kỳ báo cáo)", totalPeriod, totalAll > 0 ? ((totalPeriod/totalAll)*100).toFixed(1) + "%" : "0%", "Chi phí trong khoảng thời gian đã chọn"],
                ["", "", "", ""],
                ["PHÂN TÍCH THEO NHÓM", "", "", ""],
                ["Nhóm chi phí", "Số tiền (VNĐ)", "Tỷ lệ (%)", "Số lượng"],
            ];

            // Thêm thống kê chi tiết theo nhóm
            Object.entries(groupStats).forEach(([groupName, amount]) => {
                const percentage = totalPeriod > 0 ? ((amount/totalPeriod)*100).toFixed(1) + "%" : "0%";
                const count = filtered.filter(c => (c.group || "Khác") === groupName).length;
                summaryData.push([groupName, amount, percentage, count + " mục"]);
            });

            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];

            // Định dạng header
            summarySheet['A1'] = { v: "BÁO CÁO THỐNG KÊ CHI PHÍ", t: "s", s: { font: { bold: true, sz: 16 } } };

            XLSX.utils.book_append_sheet(wb, summarySheet, "Tổng quan");

            // === SHEET 2: CHI TIẾT THEO NHÓM ===
            const groupNames = Object.keys(groupStats);

            groupNames.forEach(groupName => {
                const groupData = filtered.filter(c => (c.group || "Khác") === groupName);
                const groupTotal = groupData.reduce((sum, c) => sum + (c.amount || 0), 0);

                const sheetData = [
                    [`CHI PHÍ NHÓM: ${groupName.toUpperCase()}`, "", "", "", "", ""],
                    ["", "", "", "", "", ""],
                    ["Thống kê nhóm:", "", "", "", "", ""],
                    ["Tổng số mục:", groupData.length, "", "", "", ""],
                    ["Tổng số tiền:", groupTotal.toLocaleString("vi-VN") + " ₫", "", "", "", ""],
                    ["Tỷ lệ so với tổng:", totalPeriod > 0 ? ((groupTotal/totalPeriod)*100).toFixed(1) + "%" : "0%", "", "", "", ""],
                    ["", "", "", "", "", ""],
                    ["DANH SÁCH CHI TIẾT", "", "", "", "", ""],
                    ["STT", "Tên chi phí", "Số tiền (VNĐ)", "Ngày", "Ghi chú", "Thời gian tạo"],
                ];

                groupData.forEach((cost, index) => {
                    sheetData.push([
                        index + 1,
                        cost.name || "",
                        cost.amount || 0,
                        cost.date || "",
                        cost.note || "",
                        cost.createdAt ? dayjs(cost.createdAt.toDate()).format("DD/MM/YYYY HH:mm") : ""
                    ]);
                });

                // Thêm dòng tổng cộng
                sheetData.push([
                    "",
                    "TỔNG CỘNG",
                    groupTotal,
                    "",
                    "",
                    ""
                ]);

                const groupSheet = XLSX.utils.aoa_to_sheet(sheetData);
                groupSheet['!cols'] = [
                    { wch: 5 },   // STT
                    { wch: 30 },  // Tên chi phí
                    { wch: 15 },  // Số tiền
                    { wch: 12 },  // Ngày
                    { wch: 30 },  // Ghi chú
                    { wch: 18 }   // Thời gian tạo
                ];

                const sheetName = groupName.length > 31 ? groupName.substring(0, 28) + "..." : groupName;
                XLSX.utils.book_append_sheet(wb, groupSheet, sheetName);
            });

            // === SHEET 3: DANH SÁCH TỔNG HỢP ===
            const allDetailData = [
                ["DANH SÁCH TỔNG HỢP TẤT CẢ CHI PHÍ", "", "", "", "", "", ""],
                ["", "", "", "", "", "", ""],
                [`Khoảng thời gian: ${getPeriodLabel()}`, "", "", "", "", "", ""],
                [`Tổng số: ${filtered.length} mục`, "", "", "", "", "", ""],
                [`Tổng tiền: ${totalPeriod.toLocaleString("vi-VN")} ₫`, "", "", "", "", "", ""],
                ["", "", "", "", "", "", ""],
                ["STT", "Tên chi phí", "Nhóm", "Số tiền (VNĐ)", "Ngày", "Ghi chú", "Thời gian tạo"],
            ];

            filtered.forEach((cost, index) => {
                allDetailData.push([
                    index + 1,
                    cost.name || "",
                    cost.group || "Khác",
                    cost.amount || 0,
                    cost.date || "",
                    cost.note || "",
                    cost.createdAt ? dayjs(cost.createdAt.toDate()).format("DD/MM/YYYY HH:mm") : ""
                ]);
            });

            // Thêm dòng tổng cộng
            allDetailData.push([
                "",
                "",
                "TỔNG CỘNG",
                totalPeriod,
                "",
                "",
                ""
            ]);

            const allDetailSheet = XLSX.utils.aoa_to_sheet(allDetailData);
            allDetailSheet['!cols'] = [
                { wch: 5 },   // STT
                { wch: 30 },  // Tên chi phí
                { wch: 15 },  // Nhóm
                { wch: 15 },  // Số tiền
                { wch: 12 },  // Ngày
                { wch: 30 },  // Ghi chú
                { wch: 18 }   // Thời gian tạo
            ];

            XLSX.utils.book_append_sheet(wb, allDetailSheet, "Danh sách tổng hợp");

            // === SHEET 4: PHÂN TÍCH THỜI GIAN ===
            const timeAnalysis = getTimeAnalysis();
            const timeAnalysisData = [
                ["PHÂN TÍCH CHI PHÍ THEO THỜI GIAN", "", "", ""],
                ["", "", "", ""],
                ["Khoảng thời gian", "Số lượng", "Tổng tiền (VNĐ)", "Trung bình/mục"],
            ];

            timeAnalysis.forEach(item => {
                timeAnalysisData.push([
                    item.period,
                    item.count,
                    item.total,
                    item.count > 0 ? Math.round(item.total / item.count) : 0
                ]);
            });

            const timeAnalysisSheet = XLSX.utils.aoa_to_sheet(timeAnalysisData);
            timeAnalysisSheet['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];

            XLSX.utils.book_append_sheet(wb, timeAnalysisSheet, "Phân tích thời gian");

            // Tạo tên file với timestamp
            const fileName = `Chi-phi-chi-tiet_${getPeriodLabel().replace(/[/\s:]/g, '-')}_${dayjs().format("YYYY-MM-DD_HH-mm")}.xlsx`;

            // Xuất file
            XLSX.writeFile(wb, fileName);

        } catch (error) {
            console.error("Lỗi khi xuất Excel:", error);
        }
    };

// Hàm phân tích theo thời gian
    const getTimeAnalysis = () => {
        const analysis: { period: string; count: number; total: number }[] = [];

        if (timeType === "custom" && customRange) {
            // Phân tích theo ngày trong khoảng tùy chọn
            const start = customRange[0];
            const end = customRange[1];
            const days = end.diff(start, 'day') + 1;

            for (let i = 0; i < days; i++) {
                const currentDay = start.add(i, 'day');
                const dayData = filtered.filter(c =>
                    dayjs(c.date).format('YYYY-MM-DD') === currentDay.format('YYYY-MM-DD')
                );

                analysis.push({
                    period: currentDay.format('DD/MM/YYYY'),
                    count: dayData.length,
                    total: dayData.reduce((sum, c) => sum + (c.amount || 0), 0)
                });
            }
        } else {
            // Phân tích theo tuần trong tháng hiện tại
            const startOfPeriod = periodStart;
            const endOfPeriod = today;
            const weeks = Math.ceil(endOfPeriod.diff(startOfPeriod, 'day') / 7);

            for (let i = 0; i < weeks; i++) {
                const weekStart = startOfPeriod.add(i * 7, 'day');
                const weekEnd = weekStart.add(6, 'day');

                const weekData = filtered.filter(c => {
                    const costDate = dayjs(c.date);
                    return costDate.isSameOrAfter(weekStart) && costDate.isSameOrBefore(weekEnd);
                });

                analysis.push({
                    period: `Tuần ${i + 1} (${weekStart.format('DD/MM')} - ${weekEnd.format('DD/MM')})`,
                    count: weekData.length,
                    total: weekData.reduce((sum, c) => sum + (c.amount || 0), 0)
                });
            }
        }

        return analysis;
    };


    const getPeriodLabel = () => {
        if (timeType === "custom" && customRange && customRange[0] && customRange[1]) {
            return `${customRange[0].format("DD/MM/YYYY")} - ${customRange[1].format("DD/MM/YYYY")}`;
        }
        const option = TIME_OPTIONS.find(t => t.value === timeType);
        return option ? option.label : "Tháng";
    };

    const handleTableChange = (paginationConfig: any) => {
        setPagination({
            current: paginationConfig.current,
            pageSize: paginationConfig.pageSize,
        });
    };

    return (
        <div>
            <Row gutter={16} style={{ marginBottom: 16 }} align="middle">
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
                <Col>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={exportToExcel}
                        disabled={filtered.length === 0}
                    >
                        Xuất Excel
                    </Button>
                </Col>
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
                <Col xs={12} md={8}>
                    <Statistic
                        title="Số lượng chi phí"
                        value={filtered.length}
                        valueStyle={{ color: "#52c41a" }}
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
                            <Space direction="vertical" size={0}>
                                <Tag color="blue">{g}</Tag>
                                <b style={{ color: "#d4380d" }}>
                                    {groupStats[g].toLocaleString("vi-VN")} ₫
                                </b>
                            </Space>
                        </Col>
                    ))}
                </Row>
            </Card>

            <Card
                size="small"
                style={{ marginTop: 24 }}
                title={
                    <Space>
                        <span>Danh sách chi phí đã lọc</span>
                        <Tag color="blue">{filtered.length} mục</Tag>
                    </Space>
                }
            >
                <Table
                    dataSource={filtered}
                    rowKey="id"
                    size="small"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: filtered.length,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} chi phí`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={handleTableChange}
                    columns={[
                        {
                            title: "STT",
                            key: "index",
                            width: 60,
                            render: (_, __, index) =>
                                (pagination.current - 1) * pagination.pageSize + index + 1
                        },
                        {
                            title: "Tên chi phí",
                            dataIndex: "name",
                            sorter: (a, b) => a.name.localeCompare(b.name, 'vi'),
                        },
                        {
                            title: "Nhóm",
                            dataIndex: "group",
                            render: (group: string) => <Tag color="blue">{group}</Tag>,
                            filters: groupOptions.map(g => ({ text: g.label, value: g.value })),
                            onFilter: (value, record) => record.group === value,
                        },
                        {
                            title: "Số tiền",
                            dataIndex: "amount",
                            sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
                            render: (amount: number) => (
                                <span style={{ fontWeight: 600, color: '#d4380d' }}>
                                    {amount?.toLocaleString("vi-VN")} ₫
                                </span>
                            ),
                        },
                        {
                            title: "Ngày",
                            dataIndex: "date",
                            sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
                        },
                        {
                            title: "Ghi chú",
                            dataIndex: "note",
                            render: (note: string) => note || <span style={{ color: '#ccc' }}>-</span>
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default CostStats;
