import { Row, Col, Card, Statistic, Progress, Tag, Badge, Tooltip, Typography } from 'antd';
import {
    FundOutlined, ShoppingCartOutlined, TeamOutlined, CrownOutlined, ArrowUpOutlined, ArrowDownOutlined, RiseOutlined,
    ThunderboltOutlined, SmileOutlined, FireOutlined, InfoCircleOutlined, UserOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const DashboardStats = ({ loading, dashboardData }:any) => {
    if (!dashboardData) return null;
    console.log("dashboardData",dashboardData)
    return (
        <Row gutter={[16, 16]} style={{ marginTop: 16, marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
                <Card loading={loading} hoverable className="dashboard-card">
                    <Statistic
                        title={
                            <div className="flex items-center justify-between">
                                <span><FundOutlined style={{ color: '#3f8600' }} /> Doanh thu</span>
                                <Tooltip title="Doanh thu từ tất cả đơn hàng trong kỳ">
                                    <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                                </Tooltip>
                            </div>
                        }
                        value={dashboardData.revenue.current}
                        precision={0}
                        valueStyle={{ color: '#3f8600', fontSize: 24 }}
                        suffix="đ"
                        formatter={(value) => value.toLocaleString()}
                    />
                    <div style={{ marginTop: 8 }}>
                        <Text type={dashboardData.revenue.growth >= 0 ? 'success' : 'danger'} className="flex items-center">
                            {dashboardData.revenue.growth >= 0 ?
                                <><ArrowUpOutlined className="mr-1" /> <RiseOutlined className="mr-1" /></> :
                                <ArrowDownOutlined className="mr-1" />}
                            {Math.abs(dashboardData.revenue.growth).toFixed(1)}%
                        </Text>
                        <Text type="secondary"> so với kỳ trước</Text>
                        <Progress
                            percent={Math.min(100, Math.max(0, dashboardData.revenue.growth + 50))}
                            size="small"
                            status={dashboardData.revenue.growth >= 0 ? "success" : "exception"}
                            showInfo={false}
                            style={{ marginTop: 8 }}
                        />
                    </div>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card loading={loading} hoverable className="dashboard-card">
                    <Statistic
                        title={
                            <div className="flex items-center justify-between">
                                <span><ShoppingCartOutlined style={{ color: '#1890ff' }} /> Đơn hàng</span>
                                <Tag color="blue">Mới</Tag>
                            </div>
                        }
                        value={dashboardData.orders.current}
                        valueStyle={{ color: '#1890ff', fontSize: 24 }}
                        suffix={<span className="text-sm ml-1">đơn</span>}
                    />
                    <div style={{ marginTop: 8 }}>
                        <Text type={dashboardData.orders.growth >= 0 ? 'success' : 'danger'} className="flex items-center">
                            {dashboardData.orders.growth >= 0 ?
                                <><ArrowUpOutlined className="mr-1" /> <ThunderboltOutlined className="mr-1" /></> :
                                <ArrowDownOutlined className="mr-1" />}
                            {Math.abs(dashboardData.orders.growth).toFixed(1)}%
                        </Text>
                        <Text type="secondary"> so với kỳ trước</Text>
                        <Progress
                            percent={Math.min(100, Math.max(0, dashboardData.orders.growth + 50))}
                            size="small"
                            status={dashboardData.orders.growth >= 0 ? "success" : "exception"}
                            showInfo={false}
                            style={{ marginTop: 8 }}
                        />
                    </div>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card loading={loading} hoverable className="dashboard-card">
                    <Statistic
                        title={
                            <div className="flex items-center justify-between">
                                <span><TeamOutlined style={{ color: '#722ed1' }} /> Khách hàng</span>
                                <Tooltip title="Số khách hàng duy nhất trong kỳ">
                                    <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                                </Tooltip>
                            </div>
                        }
                        value={dashboardData.customers.current}
                        valueStyle={{ color: '#722ed1', fontSize: 24 }}
                        suffix={<span className="text-sm ml-1">người</span>}
                        prefix={<UserOutlined className="mr-2" />}
                    />
                    <div style={{ marginTop: 8 }}>
                        <Text type={dashboardData.customers.growth >= 0 ? 'success' : 'danger'} className="flex items-center">
                            {dashboardData.customers.growth >= 0 ?
                                <><ArrowUpOutlined className="mr-1" /> <SmileOutlined className="mr-1" /></> :
                                <ArrowDownOutlined className="mr-1" />}
                            {Math.abs(dashboardData.customers.growth).toFixed(1)}%
                        </Text>
                        <Text type="secondary"> so với kỳ trước</Text>
                        <Progress
                            percent={Math.min(100, Math.max(0, dashboardData.customers.growth + 50))}
                            size="small"
                            status={dashboardData.customers.growth >= 0 ? "success" : "exception"}
                            showInfo={false}
                            style={{ marginTop: 8 }}
                        />
                    </div>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card loading={loading} hoverable className="dashboard-card">
                    <Statistic
                        title={
                            <div className="flex items-center justify-between">
                                <span><CrownOutlined style={{ color: '#fa541c' }} /> Đơn hàng TB</span>
                                <Badge count="HOT" style={{ backgroundColor: '#fa541c' }} />
                            </div>
                        }
                        value={dashboardData.avgOrder.current}
                        precision={0}
                        valueStyle={{ color: '#fa541c', fontSize: 24 }}
                        suffix="đ"
                        formatter={(value) => value.toLocaleString()}
                    />
                    <div style={{ marginTop: 8 }}>
                        <Text type={dashboardData.avgOrder.growth >= 0 ? 'success' : 'danger'} className="flex items-center">
                            {dashboardData.avgOrder.growth >= 0 ?
                                <><ArrowUpOutlined className="mr-1" /> <FireOutlined className="mr-1" /></> :
                                <ArrowDownOutlined className="mr-1" />}
                            {Math.abs(dashboardData.avgOrder.growth).toFixed(1)}%
                        </Text>
                        <Text type="secondary"> so với kỳ trước</Text>
                        <Progress
                            percent={Math.min(100, Math.max(0, dashboardData.avgOrder.growth + 50))}
                            size="small"
                            status={dashboardData.avgOrder.growth >= 0 ? "success" : "exception"}
                            showInfo={false}
                            style={{ marginTop: 8 }}
                        />
                    </div>
                </Card>
            </Col>
        </Row>
    );
};

export default DashboardStats;
