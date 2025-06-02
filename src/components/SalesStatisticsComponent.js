
import React, { useState, useEffect } from 'react';
import {
  Card,
  DatePicker,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Spin,
  Empty,
  Space,
  Progress,
  Tag,
  Divider
} from 'antd';
import {
  BarChartOutlined,
  DollarOutlined,
  CoffeeOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  PieChartOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { getSalesForDate } from '../firebase/DrinkManagementService';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const { Title, Text } = Typography;

const SalesStatistics = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [sales, setSales] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSalesData();
  }, [selectedDate]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const dateString = selectedDate.format('YYYY-MM-DD');
      const salesData = await getSalesForDate(dateString);
      setSales(salesData);
      calculateStatistics(salesData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu bán hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (salesData) => {
    const stats = {
      totalRevenue: 0,
      totalQuantity: 0,
      drinkStats: {},
      sizeStats: { S: 0, M: 0, L: 0 }
    };

    salesData.forEach(sale => {
      const { drinkName, size, quantity, total } = sale;

      stats.totalRevenue += total;
      stats.totalQuantity += quantity;
      stats.sizeStats[size] += quantity;

      if (!stats.drinkStats[drinkName]) {
        stats.drinkStats[drinkName] = {
          totalQuantity: 0,
          totalRevenue: 0,
          sizes: { S: 0, M: 0, L: 0 }
        };
      }

      stats.drinkStats[drinkName].totalQuantity += quantity;
      stats.drinkStats[drinkName].totalRevenue += total;
      stats.drinkStats[drinkName].sizes[size] += quantity;
    });

    setStatistics(stats);
  };

  const getSizeColor = (size) => {
    const colors = { S: 'green', M: 'blue', L: 'orange' };
    return colors[size] || 'default';
  };

  const getTopSellingDrink = () => {
    const drinkStats = statistics.drinkStats || {};
    const topDrink = Object.entries(drinkStats).sort((a, b) => b[1].totalQuantity - a[1].totalQuantity)[0];
    return topDrink ? topDrink[0] : 'N/A';
  };

  const salesTableColumns = [
    {
      title: (
          <Space>
            <ClockCircleOutlined />
            Thời Gian
          </Space>
      ),
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => timestamp?.toDate?.()?.toLocaleTimeString('vi-VN') || 'N/A',
      sorter: (a, b) => new Date(a.timestamp?.toDate?.() || 0) - new Date(b.timestamp?.toDate?.() || 0),
    },
    {
      title: (
          <Space>
            <CoffeeOutlined />
            Đồ Uống
          </Space>
      ),
      dataIndex: 'drinkName',
      key: 'drinkName',
      sorter: (a, b) => a.drinkName.localeCompare(b.drinkName),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size) => <Tag color={getSizeColor(size)}>Size {size}</Tag>,
      filters: [
        { text: 'Size S', value: 'S' },
        { text: 'Size M', value: 'M' },
        { text: 'Size L', value: 'L' },
      ],
      onFilter: (value, record) => record.size === value,
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => `${quantity} ly`,
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price?.toLocaleString()}đ`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: (
          <Space>
            <DollarOutlined />
            Thành Tiền
          </Space>
      ),
      dataIndex: 'total',
      key: 'total',
      render: (total) => (
          <Text strong style={{ color: '#1890ff' }}>
            {total?.toLocaleString()}đ
          </Text>
      ),
      sorter: (a, b) => a.total - b.total,
    },
  ];

  return (
      <div style={{ padding: '0 24px' }}>
        <Title level={2}>
          <BarChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Thống Kê Doanh Thu
        </Title>

        {/* Date Selector */}
        <Card style={{ marginBottom: 24 }}>
          <Space align="center">
            <CalendarOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
            <Text strong>Chọn ngày thống kê:</Text>
            <DatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                size="large"
            />
          </Space>
        </Card>

        <Spin spinning={loading}>
          {/* Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                    title={
                      <Space>
                        <DollarOutlined style={{ color: '#52c41a' }} />
                        Tổng Doanh Thu
                      </Space>
                    }
                    value={statistics.totalRevenue || 0}
                    suffix="đ"
                    valueStyle={{ color: '#52c41a', fontSize: '28px' }}
                    formatter={value => value.toLocaleString()}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                    title={
                      <Space>
                        <CoffeeOutlined style={{ color: '#1890ff' }} />
                        Số Ly Đã Bán
                      </Space>
                    }
                    value={statistics.totalQuantity || 0}
                    suffix="ly"
                    valueStyle={{ color: '#1890ff', fontSize: '28px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                    title={
                      <Space>
                        <ShoppingCartOutlined style={{ color: '#722ed1' }} />
                        Số Giao Dịch
                      </Space>
                    }
                    value={sales.length}
                    suffix="giao dịch"
                    valueStyle={{ color: '#722ed1', fontSize: '28px' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {/* Size Statistics */}
            <Col xs={24} lg={12}>
              <Card
                  title={
                    <Space>
                      <PieChartOutlined />
                      Thống Kê Theo Size
                    </Space>
                  }
              >
                {Object.keys(statistics.sizeStats || {}).length === 0 ? (
                    <Empty description="Chưa có dữ liệu" />
                ) : (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {Object.entries(statistics.sizeStats || {}).map(([size, quantity]) => {
                        const percentage = statistics.totalQuantity ?
                            Math.round((quantity / statistics.totalQuantity) * 100) : 0;
                        return (
                            <div key={size}>
                              <Row justify="space-between" align="middle">
                                <Col>
                                  <Tag color={getSizeColor(size)} style={{ marginBottom: 8 }}>
                                    Size {size}
                                  </Tag>
                                </Col>
                                <Col>
                                  <Text strong>{quantity} ly ({percentage}%)</Text>
                                </Col>
                              </Row>
                              <Progress
                                  percent={percentage}
                                  size="small"
                                  strokeColor={getSizeColor(size)}
                              />
                            </div>
                        );
                      })}
                    </Space>
                )}
              </Card>
            </Col>

            {/* Top Selling */}
            <Col xs={24} lg={12}>
              <Card
                  title={
                    <Space>
                      <TrophyOutlined />
                      Thông Tin Bổ Sung
                    </Space>
                  }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Đồ uống bán chạy nhất:</Text>
                    <br />
                    <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                      🏆 {getTopSellingDrink()}
                    </Text>
                  </div>
                  <Divider />
                  <div>
                    <Text type="secondary">Trung bình mỗi giao dịch:</Text>
                    <br />
                    <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                      💰 {sales.length ? Math.round(statistics.totalRevenue / sales.length).toLocaleString() : 0}đ
                    </Text>
                  </div>
                  <Divider />
                  <div>
                    <Text type="secondary">Ngày thống kê:</Text>
                    <br />
                    <Text strong>
                      📅 {selectedDate.format('DD/MM/YYYY dddd')}
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Drink Statistics */}
          <Card
              title={
                <Space>
                  <CoffeeOutlined />
                  Thống Kê Theo Đồ Uống
                </Space>
              }
              style={{ marginBottom: 24 }}
          >
            {Object.keys(statistics.drinkStats || {}).length === 0 ? (
                <Empty description="Không có dữ liệu bán hàng cho ngày này" />
            ) : (
                <Row gutter={[16, 16]}>
                  {Object.entries(statistics.drinkStats || {}).map(([drinkName, stats]) => (
                      <Col xs={24} sm={12} lg={8} key={drinkName}>
                        <Card size="small" hoverable>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Title level={5} style={{ margin: 0 }}>
                              <CoffeeOutlined style={{ marginRight: 8, color: '#8B4513' }} />
                              {drinkName}
                            </Title>
                            <Row justify="space-between">
                              <Text type="secondary">Số lượng:</Text>
                              <Text strong>{stats.totalQuantity} ly</Text>
                            </Row>
                            <Row justify="space-between">
                              <Text type="secondary">Doanh thu:</Text>
                              <Text strong style={{ color: '#1890ff' }}>
                                {stats.totalRevenue.toLocaleString()}đ
                              </Text>
                            </Row>
                            <div>
                              <Text type="secondary">Size:</Text>
                              <br />
                              <Space wrap>
                                {Object.entries(stats.sizes).map(([size, qty]) => (
                                    qty > 0 && (
                                        <Tag key={size} color={getSizeColor(size)}>
                                          {size}: {qty}
                                        </Tag>
                                    )
                                ))}
                              </Space>
                            </div>
                          </Space>
                        </Card>
                      </Col>
                  ))}
                </Row>
            )}
          </Card>

          {/* Transaction History */}
          <Card
              title={
                <Space>
                  <ClockCircleOutlined />
                  Lịch Sử Giao Dịch ({sales.length})
                </Space>
              }
          >
            {sales.length === 0 ? (
                <Empty description="Không có giao dịch nào trong ngày này" />
            ) : (
                <Table
                    columns={salesTableColumns}
                    dataSource={sales.map((sale, index) => ({ ...sale, key: sale.id || index }))}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                          `${range[0]}-${range[1]} của ${total} giao dịch`,
                    }}
                    scroll={{ x: 800 }}
                    size="small"
                />
            )}
          </Card>
        </Spin>
      </div>
  );
};

export default SalesStatistics;