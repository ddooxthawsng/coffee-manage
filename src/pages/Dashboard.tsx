import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin, Typography } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getDashboardData } from "../services/dashboardService";

const { Title } = Typography;

const Dashboard: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardData().then((res) => {
            setData(res);
            setLoading(false);
        });
    }, []);

    const chartData = data
        ? Object.entries(data.revenueByDate).map(([date, revenue]) => ({
            date,
            revenue,
        }))
        : [];

    return (
        <div className="min-h-screen p-4 bg-white">
            <Title level={2} style={{ color: "#111" }}>Tổng quan hệ thống</Title>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Tổng doanh thu"
                                    value={data.totalRevenue}
                                    precision={0}
                                    valueStyle={{ color: "#3f8600" }}
                                    suffix="₫"
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Tổng chi phí"
                                    value={data.totalCost}
                                    precision={0}
                                    valueStyle={{ color: "#cf1322" }}
                                    suffix="₫"
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic title="Số đơn hàng" value={data.orderCount} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic title="Số khoản chi" value={data.costCount} />
                            </Card>
                        </Col>
                    </Row>
                    <Card title="Biểu đồ doanh thu theo ngày">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="#1890ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            )}
        </div>
    );
};

export default Dashboard;
