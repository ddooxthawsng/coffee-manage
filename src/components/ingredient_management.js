
import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
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
  Tooltip,
  Alert,
  Modal,
  Select
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  InboxOutlined,
  WarningOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import {
  addIngredient,
  updateIngredient,
  getIngredients,
  deleteIngredient,
  updateIngredientInventory,
  addIngredientStock,
  getLowStockIngredients
} from '../firebase/ingredient_service';

const { Title, Text } = Typography;
const { Option } = Select;

const IngredientManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [lowStockIngredients, setLowStockIngredients] = useState([]);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [stockForm] = Form.useForm();

  useEffect(() => {
    fetchIngredients();
    checkLowStock();
  }, []);

  const fetchIngredients = async () => {
    try {
      const ingredientList = await getIngredients();
      setIngredients(ingredientList);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nguyên liệu:', error);
      message.error('Không thể tải danh sách nguyên liệu');
    }
  };

  const checkLowStock = async () => {
    try {
      const lowStock = await getLowStockIngredients(10);
      setLowStockIngredients(lowStock);
    } catch (error) {
      console.error('Lỗi khi kiểm tra tồn kho:', error);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const ingredientData = {
        name: values.name,
        unit: values.unit,
        unitPrice: values.unitPrice,
        category: values.category,
        inventory: values.inventory || 0,
        minStock: values.minStock || 10
      };

      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, ingredientData);
        message.success('Cập nhật nguyên liệu thành công!');
      } else {
        await addIngredient(ingredientData);
        message.success('Thêm nguyên liệu mới thành công!');
      }

      resetForm();
      fetchIngredients();
      checkLowStock();
    } catch (error) {
      console.error('Lỗi khi lưu nguyên liệu:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setEditingIngredient(null);
  };

  const editIngredient = (ingredient) => {
    form.setFieldsValue({
      name: ingredient.name,
      unit: ingredient.unit,
      unitPrice: ingredient.unitPrice,
      category: ingredient.category,
      inventory: ingredient.inventory || 0,
      minStock: ingredient.minStock || 10
    });
    setEditingIngredient(ingredient);
  };

  const handleDelete = async (ingredientId, ingredientName) => {
    try {
      await deleteIngredient(ingredientId);
      message.success('Xóa nguyên liệu thành công!');
      fetchIngredients();
      checkLowStock();
    } catch (error) {
      console.error('Lỗi khi xóa nguyên liệu:', error);
      message.error('Có lỗi xảy ra khi xóa. Vui lòng thử lại!');
    }
  };

  const handleStockUpdate = async (values) => {
    try {
      const { action, quantity } = values;

      if (action === 'add') {
        await addIngredientStock(selectedIngredient.id, quantity);
        message.success(`Nhập kho ${quantity} ${selectedIngredient.unit} thành công!`);
      } else {
        await updateIngredientInventory(selectedIngredient.id, quantity);
        message.success(`Xuất kho ${quantity} ${selectedIngredient.unit} thành công!`);
      }

      setStockModalVisible(false);
      stockForm.resetFields();
      fetchIngredients();
      checkLowStock();
    } catch (error) {
      console.error('Lỗi khi cập nhật tồn kho:', error);
      message.error('Có lỗi xảy ra khi cập nhật tồn kho!');
    }
  };

  const openStockModal = (ingredient) => {
    setSelectedIngredient(ingredient);
    setStockModalVisible(true);
  };

  const getStockStatus = (ingredient) => {
    const stock = ingredient.inventory || 0;
    const minStock = ingredient.minStock || 10;

    if (stock === 0) {
      return { color: 'red', text: 'Hết hàng' };
    } else if (stock <= minStock) {
      return { color: 'orange', text: 'Sắp hết' };
    } else {
      return { color: 'green', text: 'Còn đủ' };
    }
  };

  return (
      <div style={{ padding: '0 24px' }}>
        <Title level={2}>
          <ExperimentOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          Quản Lý Nguyên Liệu
        </Title>

        {/* Alert tồn kho thấp */}
        {lowStockIngredients.length > 0 && (
            <Alert
                message="Cảnh báo tồn kho thấp!"
                description={
                  <div>
                    Các nguyên liệu sau đây sắp hết: {' '}
                    {lowStockIngredients.map(ing => (
                        <Tag key={ing.id} color="orange" style={{ margin: 2 }}>
                          {ing.name}: {ing.inventory || 0} {ing.unit}
                        </Tag>
                    ))}
                  </div>
                }
                type="warning"
                icon={<WarningOutlined />}
                style={{ marginBottom: 16 }}
                showIcon
            />
        )}

        <Card
            title={
              <span>
            <PlusOutlined style={{ marginRight: 8 }} />
                {editingIngredient ? 'Chỉnh Sửa Nguyên Liệu' : 'Thêm Nguyên Liệu Mới'}
          </span>
            }
            style={{ marginBottom: 24 }}
        >
          <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                inventory: 0,
                minStock: 10
              }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                    label="Tên nguyên liệu"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên nguyên liệu!' }]}
                >
                  <Input
                      prefix={<ExperimentOutlined />}
                      placeholder="Nhập tên nguyên liệu..."
                      size="large"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                    label="Danh mục"
                    name="category"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                >
                  <Select placeholder="Chọn danh mục" size="large">
                    <Option value="coffee">Cà phê</Option>
                    <Option value="milk">Sữa</Option>
                    <Option value="syrup">Syrup</Option>
                    <Option value="powder">Bột</Option>
                    <Option value="topping">Topping</Option>
                    <Option value="other">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                    label="Đơn vị"
                    name="unit"
                    rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}
                >
                  <Input placeholder="g, ml, kg..." size="large" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                    label="Giá đơn vị (VNĐ)"
                    name="unitPrice"
                    rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                >
                  <InputNumber
                      style={{ width: '100%' }}
                      step={100}
                      min={0}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="đ"
                      size="large"
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                    label="Tồn kho hiện tại"
                    name="inventory"
                    rules={[{ required: true, message: 'Vui lòng nhập tồn kho!' }]}
                >
                  <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      step={1}
                      size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                    label="Tồn kho tối thiểu"
                    name="minStock"
                    rules={[{ required: true, message: 'Vui lòng nhập tồn kho tối thiểu!' }]}
                >
                  <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      step={1}
                      size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 24 }}>
              <Space>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    icon={editingIngredient ? <EditOutlined /> : <PlusOutlined />}
                >
                  {editingIngredient ? 'Cập Nhật' : 'Thêm Mới'}
                </Button>
                {editingIngredient && (
                    <Button size="large" onClick={resetForm}>
                      Hủy
                    </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card
            title={
              <span>
            <InboxOutlined style={{ marginRight: 8 }} />
            Danh Sách Nguyên Liệu ({ingredients.length})
          </span>
            }
        >
          {ingredients.length === 0 ? (
              <Empty description="Chưa có nguyên liệu nào. Hãy thêm nguyên liệu đầu tiên!" />
          ) : (
              <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={ingredients}
                  renderItem={ingredient => {
                    const stockStatus = getStockStatus(ingredient);
                    return (
                        <List.Item>
                          <Card
                              hoverable
                              actions={[
                                <Tooltip title="Chỉnh sửa">
                                  <Button
                                      type="text"
                                      icon={<EditOutlined />}
                                      onClick={() => editIngredient(ingredient)}
                                  />
                                </Tooltip>,
                                <Tooltip title="Cập nhật tồn kho">
                                  <Button
                                      type="text"
                                      icon={<InboxOutlined />}
                                      onClick={() => openStockModal(ingredient)}
                                  />
                                </Tooltip>,
                                <Popconfirm
                                    title="Xóa nguyên liệu"
                                    description={`Bạn có chắc chắn muốn xóa "${ingredient.name}"?`}
                                    onConfirm={() => handleDelete(ingredient.id, ingredient.name)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okType="danger"
                                >
                                  <Tooltip title="Xóa">
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                    />
                                  </Tooltip>
                                </Popconfirm>
                              ]}
                          >
                            <Card.Meta
                                title={
                                  <span>
                          <ExperimentOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                                    {ingredient.name}
                        </span>
                                }
                                description={
                                  <div>
                                    <Row gutter={16}>
                                      <Col span={12}>
                                        <Text strong>Danh mục:</Text>
                                        <br />
                                        <Tag color="blue">{ingredient.category}</Tag>
                                      </Col>
                                      <Col span={12}>
                                        <Text strong>Giá:</Text>
                                        <br />
                                        <Text>{ingredient.unitPrice?.toLocaleString()}đ/{ingredient.unit}</Text>
                                      </Col>
                                    </Row>

                                    <Row gutter={16} style={{ marginTop: 8 }}>
                                      <Col span={12}>
                                        <Text strong>Tồn kho:</Text>
                                        <br />
                                        <Tag color={stockStatus.color}>
                                          {ingredient.inventory || 0} {ingredient.unit}
                                        </Tag>
                                      </Col>
                                      <Col span={12}>
                                        <Text strong>Trạng thái:</Text>
                                        <br />
                                        <Tag color={stockStatus.color}>{stockStatus.text}</Tag>
                                      </Col>
                                    </Row>

                                    <Row style={{ marginTop: 8 }}>
                                      <Col span={24}>
                                        <Text strong>Tồn kho tối thiểu:</Text>
                                        <br />
                                        <Text type="secondary">{ingredient.minStock || 10} {ingredient.unit}</Text>
                                      </Col>
                                    </Row>
                                  </div>
                                }
                            />
                          </Card>
                        </List.Item>
                    );
                  }}
              />
          )}
        </Card>

        {/* Modal cập nhật tồn kho */}
        <Modal
            title={`Cập nhật tồn kho - ${selectedIngredient?.name}`}
            open={stockModalVisible}
            onCancel={() => {
              setStockModalVisible(false);
              stockForm.resetFields();
            }}
            footer={null}
        >
          <Form
              form={stockForm}
              layout="vertical"
              onFinish={handleStockUpdate}
              initialValues={{ action: 'add' }}
          >
            <Form.Item
                label="Thao tác"
                name="action"
                rules={[{ required: true }]}
            >
              <Select>
                <Option value="add">
                  <PlusCircleOutlined style={{ color: '#52c41a' }} /> Nhập kho
                </Option>
                <Option value="remove">
                  <MinusCircleOutlined style={{ color: '#ff4d4f' }} /> Xuất kho
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
                label={`Số lượng (${selectedIngredient?.unit})`}
                name="quantity"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng!' },
                  { type: 'number', min: 0.1, message: 'Số lượng phải lớn hơn 0!' }
                ]}
            >
              <InputNumber
                  style={{ width: '100%' }}
                  step={1}
                  min={0.1}
                  addonAfter={selectedIngredient?.unit}
              />
            </Form.Item>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Tồn kho hiện tại: </Text>
              <Tag color="blue">
                {selectedIngredient?.inventory || 0} {selectedIngredient?.unit}
              </Tag>
            </div>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
                <Button onClick={() => {
                  setStockModalVisible(false);
                  stockForm.resetFields();
                }}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
};

export default IngredientManagement;