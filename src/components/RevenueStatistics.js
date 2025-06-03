import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Statistic, Row, Col, Table, Spin } from 'antd';
import { getRevenueStatsByPeriod } from '../firebase/revenue_service';
import dayjs from 'dayjs';
import '../styles/DrinkManagementStyles.css';

const { Option } = Select;

const RevenueStatistics = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [filterType, setFilterType] = useState('month');
    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
    const [loading, setLoading] = useState(false);

    const fetchRevenueData = async () => {
        setLoading(true);
        try {
            const month = filterType === 'month' ? selectedMonth : null;
            const result = await getRevenueStatsByPeriod(selectedYear, month);

            setRevenueData(result.data);
            setTotalRevenue(result.totalRevenue);
            setTotalOrders(result.totalOrders);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenueData();
    }, [filterType, selectedYear, selectedMonth]);

    const columns = [
        {
            title: filterType === 'month' ? 'Ngày' : 'Tháng',
            dataIndex: 'period',
            key: 'period',
            render: (text) => {
                if (filterType === 'month') {
                    return dayjs(text).format('DD/MM/YYYY');
                } else {
                    return dayjs(text).format('MM/YYYY');
                }
            }
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value) => (
                <span className="revenue-amount">
          {value.toLocaleString()} VNĐ
        </span>
            ),
            sorter: (a, b) => a.revenue - b.revenue,
        },
        {
            title: 'Số đơn hàng',
            dataIndex: 'orderCount',
            key: 'orderCount',
            sorter: (a, b) => a.orderCount - b.orderCount,
        },
        {
            title: 'Trung bình/đơn',
            key: 'average',
            render: (_, record) => (
                <span>
          {Math.round(record.revenue / record.orderCount).toLocaleString()} VNĐ
        </span>
            )
        }
    ];

    return (
        <div className="drink-management-container">
            <div className="glass-card">
                <h2 className="page-title">📊 Thống Kê Doanh Thu</h2>

                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                        <Select
                            value={filterType}
                            onChange={setFilterType}
                            style={{ width: '100%' }}
                            className="custom-select"
                        >
                            <Option value="month">Theo tháng</Option>
                            <Option value="year">Theo năm</Option>
                        </Select>
                    </Col>
                    <Col span={8}>
                        <DatePicker
                            picker="year"
                            value={dayjs().year(selectedYear)}
                            onChange={(date) => setSelectedYear(date?.year() || dayjs().year())}
                            style={{ width: '100%' }}
                            placeholder="Chọn năm"
                        />
                    </Col>
                    {filterType === 'month' && (
                        <Col span={8}>
                            <Select
                                value={selectedMonth}
                                onChange={setSelectedMonth}
                                style={{ width: '100%' }}
                                className="custom-select"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <Option key={i + 1} value={i + 1}>
                                        Tháng {i + 1}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                    )}
                </Row>

                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                        <Card className="stats-card">
                            <Statistic
                                title="Tổng doanh thu"
                                value={totalRevenue}
                                suffix="VNĐ"
                                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card className="stats-card">
                            <Statistic
                                title="Tổng đơn hàng"
                                value={totalOrders}
                                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card className="stats-card">
                            <Statistic
                                title="Trung bình/đơn"
                                value={totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}
                                suffix="VNĐ"
                                valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card title={`Chi tiết doanh thu ${filterType === 'month' ? 'theo ngày' : 'theo tháng'}`} className="stats-card">
                    <Spin spinning={loading}>
                        <Table
                            columns={columns}
                            dataSource={revenueData}
                            rowKey="period"
                            pagination={{ pageSize: 10 }}
                            className="custom-table"
                        />
                    </Spin>
                </Card>
            </div>
        </div>
    );
};

export default RevenueStatistics;
