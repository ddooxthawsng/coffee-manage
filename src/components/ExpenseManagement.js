import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Space,
  Row,
  Col,
  List,
  Tag,
  Typography,
  message,
  Popconfirm,
  Empty,
  DatePicker,
  Modal,
  Statistic,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { addExpense, updateExpense, getExpenses, deleteExpense } from '../firebase/expense_management_service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [statistics, setStatistics] = useState({});

  const expenseCategories = [
    { value: 'equipment', label: '🔧 Thiết bị & Dụng cụ', color: 'blue' },
    { value: 'supplies', label: '📦 Vật tư tiêu hao', color: 'green' },
    { value: 'maintenance', label: '🔨 Bảo trì & Sửa chữa', color: 'orange' },
    { value: 'utilities', label: '⚡ Điện nước & Tiện ích', color: 'purple' },
    { value: 'rent', label: '🏠 Thuê mặt bằng', color: 'red' },
    { value: 'marketing', label: '📢 Marketing & Quảng cáo', color: 'cyan' },
    { value: 'transport', label: '🚚 Vận chuyển & Logistics', color: 'gold' },
    { value: 'other', label: '📋 Chi phí khác', color: 'default' }
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    filterExpensesByDate();
    calculateStatistics();
  }, [expenses, selectedDateRange]);

  const fetchExpenses = async () => {
    try {
      const expenseList = await getExpenses();
      setExpenses(expenseList);
    } catch (error) {
      console.error('Lỗi khi tải danh sách chi phí:', error);
      message.error('Không thể tải danh sách chi phí');
    }
  };

  const filterExpensesByDate = () => {
    if (!selectedDateRange || selectedDateRange.length !== 2) {
      setFilteredExpenses(expenses);
      return;
    }

    const [startDate, endDate] = selectedDateRange;
    const filtered = expenses.filter(expense => {
      const expenseDate = dayjs(expense.date);
      return expenseDate.isAfter(startDate.startOf('day')) && expenseDate.isBefore(endDate.endOf('day'));
    });
    setFilteredExpenses(filtered);
  };

  const calculateStatistics = () => {
    const stats = {
      totalExpense: 0,
      categoryStats: {},
      monthlyTrend: {}
    };

    filteredExpenses.forEach(expense => {
      stats.totalExpense += expense.amount;

      // Category statistics
      if (!stats.categoryStats[expense.category]) {
        stats.categoryStats[expense.category] = {
          total: 0,
          count: 0
        };
      }
      stats.categoryStats[expense.category].total += expense.amount;
      stats.categoryStats[expense.category].count += 1;
    });

    setStatistics(stats);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const expenseData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, { ...expenseData, updatedAt: new Date() });
        message.success('Cập nhật chi phí thành công!');
      } else {
        await addExpense(expenseData);
        message.success('Thêm chi phí mới thành công!');
      }

      resetForm();
      fetchExpenses();
    } catch (error) {
      console.error('Lỗi khi lưu chi phí:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setEditingExpense(null);
  };

  const editExpense = (expense) => {
    form.setFieldsValue({
      ...expense,
      date: dayjs(expense.date)
    });
    setEditingExpense(expense);
  };

  const handleDelete = async (expenseId, expenseName) => {
    try {
      await deleteExpense(expenseId);
      message.success('Xóa chi phí thành công!');
      fetchExpenses();
    } catch (error) {
      console.error('Lỗi khi xóa chi phí:', error);
      message.error('Có lỗi xảy ra khi xóa. Vui lòng thử lại!');
    }
  };

  const getCategoryInfo = (categoryValue) => {
    return expenseCategories.find(cat => cat.value === categoryValue) ||
           { label: categoryValue, color: 'default' };
  };

  const showExpenseDetails = (expense) => {
    const categoryInfo = getCategoryInfo(expense.category);

    Modal.info({
      title: (
        <Space>
          <InfoCircleOutlined style={{ color: '#1890ff' }} />
          Chi Tiết Chi Phí
        </Space>
      ),
      width: 500,
      content: (
        <div style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Tên chi phí: </Text>
              <Text>{expense.name}</Text>
            </div>
            <div>
              <Text strong>Danh mục: </Text>
              <Tag color={categoryInfo.color}>{categoryInfo.label}</Tag>
            </div>
            <div>
              <Text strong>Số tiền: </Text>
              <Text style={{ color: '#f50', fontSize: '16px', fontWeight: 'bold' }}>
                {expense.amount?.toLocaleString()}đ
              </Text>
            </div>
            <div>
              <Text strong>Ngày phát sinh: </Text>
              <Text>{dayjs(expense.date).format('DD/MM/YYYY')}</Text>
            </div>
            <div>
              <Text strong>Nhà cung cấp: </Text>
              <Text>{expense.supplier || 'Không có'}</Text>
            </div>
            {expense.description && (
              <div>
                <Text strong>Mô tả: </Text>
                <Text>{expense.description}</Text>
              </div>
            )}
            <Divider />
            <div>
              <Text type="secondary">
                Tạo: {dayjs(expense.createdAt?.toDate?.()).format('DD/MM/YYYY HH:mm')}
              </Text>
              {expense.updatedAt && (
                <>
                  <br />
                  <Text type="secondary">
                    Cập nhật: {dayjs(expense.updatedAt?.toDate?.()).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </>
              )}
            </div>
          </Space>
        </div>
      ),
    });
  };

  return (
    <div style={{ padding: '0 24px' }}>
      <Title level={2}>
        <ShoppingOutlined style={{ marginRight: 8, color: '#722ed1' }} />
        Quản Lý Chi Phí Phát Sinh
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng Chi Phí"
              value={statistics.totalExpense || 0}
              suffix="đ"
              valueStyle={{ color: '#f50' }}
              prefix={<DollarOutlined />}
              formatter={value => value.toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Số Giao Dịch"
              value={filteredExpenses.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Chi Phí Trung Bình"
              value={filteredExpenses.length ? Math.round(statistics.totalExpense / filteredExpenses.length) : 0}
              suffix="đ"
              valueStyle={{ color: '#722ed1' }}
              formatter={value => value.toLocaleString()}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <span>
            <PlusOutlined style={{ marginRight: 8 }} />
            {editingExpense ? 'Chỉnh Sửa Chi Phí' : 'Thêm Chi Phí Mới'}
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            date: dayjs(),
            category: 'other'
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên chi phí"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên chi phí!' }]}
              >
                <Input
                  prefix={<FileTextOutlined />}
                  placeholder="Nhập tên chi phí..."
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select placeholder="Chọn danh mục chi phí" size="large">
                  {expenseCategories.map(category => (
                    <Option key={category.value} value={category.value}>
                      {category.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Số tiền (VNĐ)"
                name="amount"
                rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  step={1000}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="đ"
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Ngày phát sinh"
                name="date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Nhà cung cấp"
                name="supplier"
              >
                <Input
                  size="large"
                  placeholder="Tên nhà cung cấp (tùy chọn)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả chi tiết"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Mô tả chi tiết về chi phí này..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={editingExpense ? <EditOutlined /> : <PlusOutlined />}
              >
                {editingExpense ? 'Cập Nhật' : 'Thêm Mới'}
              </Button>
              {editingExpense && (
                <Button size="large" onClick={resetForm}>
                  Hủy
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Date Range Filter */}
      <Card title="🔍 Lọc Theo Thời Gian" style={{ marginBottom: 24 }}>
        <Space align="center">
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <Text strong>Khoảng thời gian:</Text>
          <DatePicker.RangePicker
            value={selectedDateRange}
            onChange={setSelectedDateRange}
            format="DD/MM/YYYY"
            size="large"
          />
          <Text type="secondary">
            ({filteredExpenses.length} giao dịch)
          </Text>
        </Space>
      </Card>

      {/* Expense List */}
      <Card
        title={
          <span>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Danh Sách Chi Phí ({filteredExpenses.length})
          </span>
        }
      >
        {filteredExpenses.length === 0 ? (
          <Empty description="Chưa có chi phí nào trong khoảng thời gian này" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredExpenses}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} chi phí`,
            }}
            renderItem={expense => {
              const categoryInfo = getCategoryInfo(expense.category);
              return (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<InfoCircleOutlined />}
                      onClick={() => showExpenseDetails(expense)}
                    >
                      Chi tiết
                    </Button>,
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => editExpense(expense)}
                    >
                      Sửa
                    </Button>,
                    <Popconfirm
                      title="Xóa chi phí này?"
                      description={`Bạn có chắc muốn xóa "${expense.name}"?`}
                      onConfirm={() => handleDelete(expense.id, expense.name)}
                      okText="Xóa"
                      cancelText="Hủy"
                      icon={<WarningOutlined style={{ color: 'red' }} />}
                    >
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong style={{ fontSize: '16px' }}>
                          {expense.name}
                        </Text>
                        <Tag color={categoryInfo.color}>
                          {categoryInfo.label}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <Space>
                          <Text strong style={{ color: '#f50', fontSize: '18px' }}>
                            {expense.amount?.toLocaleString()}đ
                          </Text>
                          <Text type="secondary">•</Text>
                          <Text type="secondary">
                            📅 {dayjs(expense.date).format('DD/MM/YYYY')}
                          </Text>
                          {expense.supplier && (
                            <>
                              <Text type="secondary">•</Text>
                              <Text type="secondary">🏪 {expense.supplier}</Text>
                            </>
                          )}
                        </Space>
                        {expense.description && (
                          <Text type="secondary" ellipsis>
                            📝 {expense.description}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default ExpenseManagement;