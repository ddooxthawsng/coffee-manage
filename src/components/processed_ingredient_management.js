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
    Select,
    Table,
    Divider,
    Statistic,
    Progress
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ExperimentOutlined,
    InboxOutlined,
    WarningOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
    CoffeeOutlined,
    ToolOutlined,
    CheckCircleOutlined,
    DollarOutlined
} from '@ant-design/icons';
import {
    addProcessedIngredient,
    getProcessedIngredients,
    updateProcessedIngredient,
    deleteProcessedIngredient,
    processRawToProcessed
} from '../firebase/ingredient_service';
import { getIngredients } from '../firebase/ingredient_service';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProcessedIngredientManagement = () => {
    const [processedIngredients, setProcessedIngredients] = useState([]);
    const [rawIngredients, setRawIngredients] = useState([]);
    const [editingProcessed, setEditingProcessed] = useState(null);
    const [form] = Form.useForm();
    const [processForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [processModalVisible, setProcessModalVisible] = useState(false);
    const [selectedRawIngredients, setSelectedRawIngredients] = useState([]);

    useEffect(() => {
        fetchProcessedIngredients();
        fetchRawIngredients();
    }, []);

    const fetchProcessedIngredients = async () => {
        try {
            const processedList = await getProcessedIngredients();
            setProcessedIngredients(processedList);
        } catch (error) {
            message.error('Không thể tải danh sách nguyên liệu thành phẩm');
        }
    };

    const fetchRawIngredients = async () => {
        try {
            const rawList = await getIngredients();
            setRawIngredients(rawList);
        } catch (error) {
            message.error('Không thể tải danh sách nguyên liệu thô');
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const totalCost = calculateTotalCost();
            const unitCost = calculateUnitPrice();

            const processedData = {
                name: values.name,
                description: values.description || '',
                unit: values.unit,
                category: values.category,
                inventory: values.inventory || 0,
                minStock: values.minStock || 10,
                recipe: selectedRawIngredients.map(ing => ({
                    id: ing.ingredientId,
                    name: ing.ingredientName,
                    quantity: ing.quantity,
                    unit: ing.unit,
                    unitPrice: ing.unitPrice
                })),
                outputQuantity: values.outputQuantity,
                totalCostPerBatch: totalCost,
                unitPrice: unitCost,
                isProcessed: true
            };

            if (editingProcessed) {
                await updateProcessedIngredient(editingProcessed.id, processedData);
                message.success('Cập nhật nguyên liệu thành phẩm thành công!');
            } else {
                await addProcessedIngredient(processedData);
                message.success('Thêm nguyên liệu thành phẩm mới thành công!');
            }

            resetForm();
            fetchProcessedIngredients();
        } catch (error) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        form.resetFields();
        setSelectedRawIngredients([]);
        setEditingProcessed(null);
    };

    const editProcessedIngredient = (processed) => {
        const processedRecipe = Array.isArray(processed.recipe) ? processed.recipe : [];
        form.setFieldsValue({
            name: processed.name,
            description: processed.description,
            unit: processed.unit,
            category: processed.category,
            inventory: processed.inventory || 0,
            minStock: processed.minStock || 10,
            outputQuantity: processed.outputQuantity
        });

        setSelectedRawIngredients(processedRecipe.map(ing => ({
            ingredientId: ing.id || '',
            ingredientName: ing.name || '',
            quantity: ing.quantity || 0,
            unit: ing.unit || '',
            unitPrice: ing.unitPrice || 0
        })));
        setEditingProcessed(processed);
    };

    const handleDelete = async (processedId, processedName) => {
        try {
            await deleteProcessedIngredient(processedId);
            message.success('Xóa nguyên liệu thành phẩm thành công!');
            fetchProcessedIngredients();
        } catch (error) {
            message.error('Có lỗi xảy ra khi xóa. Vui lòng thử lại!');
        }
    };

    const addRawIngredientToRecipe = () => {
        setSelectedRawIngredients([
            ...selectedRawIngredients,
            {
                ingredientId: '',
                ingredientName: '',
                quantity: 0,
                unit: '',
                unitPrice: 0
            }
        ]);
    };

    const updateRawIngredientInRecipe = (index, field, value) => {
        const newIngredients = [...selectedRawIngredients];
        if (field === 'ingredientId') {
            const selectedIngredient = rawIngredients.find(ing => ing.id === value);
            if (selectedIngredient) {
                newIngredients[index] = {
                    ...newIngredients[index],
                    ingredientId: value,
                    ingredientName: selectedIngredient.name,
                    unit: selectedIngredient.unit,
                    unitPrice: selectedIngredient.unitPrice
                };
            }
        } else {
            newIngredients[index] = {
                ...newIngredients[index],
                [field]: field === 'quantity' ? parseFloat(value) || 0 : value
            };
        }
        setSelectedRawIngredients(newIngredients);
    };

    const removeRawIngredientFromRecipe = (index) => {
        setSelectedRawIngredients(selectedRawIngredients.filter((_, i) => i !== index));
    };

    const calculateTotalCost = () => {
        return selectedRawIngredients.reduce((total, ing) => {
            return total + (ing.quantity * ing.unitPrice);
        }, 0);
    };

    const calculateUnitPrice = () => {
        const totalCost = calculateTotalCost();
        const outputQuantity = form.getFieldValue('outputQuantity') || 1;
        return totalCost / outputQuantity;
    };

    const handleProcessIngredients = async (values) => {
        try {
            setLoading(true);
            const { processedId, batchQuantity } = values;

            await processRawToProcessed(processedId, batchQuantity);
            message.success(`Chế biến thành công ${batchQuantity} lô!`);

            setProcessModalVisible(false);
            processForm.resetFields();
            fetchProcessedIngredients();
            fetchRawIngredients();
        } catch (error) {
            message.error('Có lỗi xảy ra khi chế biến!');
        } finally {
            setLoading(false);
        }
    };

    const openProcessModal = () => {
        setProcessModalVisible(true);
    };

    const getStockStatus = (processed) => {
        const stock = processed.inventory || 0;
        const minStock = processed.minStock || 10;
        if (stock === 0) {
            return { color: 'red', text: 'Hết hàng', progress: 0 };
        } else if (stock <= minStock) {
            return { color: 'orange', text: 'Sắp hết', progress: 30 };
        } else {
            return { color: 'green', text: 'Còn đủ', progress: 100 };
        }
    };

    const renderRecipeList = (recipe) => {
        if (!Array.isArray(recipe) || recipe.length === 0) {
            return <Text type="secondary">Chưa có công thức</Text>;
        }

        return (
            <div>
                {recipe.map((ingredient, index) => (
                    <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                        {ingredient.name}: {ingredient.quantity} {ingredient.unit}
                    </Tag>
                ))}
            </div>
        );
    };

    const processedColumns = [
        {
            title: 'Tên nguyên liệu thành phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.description}
                    </Text>
                </div>
            )
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (category) => {
                const categoryColors = {
                    syrup: 'purple',
                    sauce: 'orange',
                    base: 'blue',
                    topping: 'green',
                    other: 'default'
                };
                const categoryNames = {
                    syrup: 'Syrup',
                    sauce: 'Nước sốt',
                    base: 'Nguyên liệu cơ bản',
                    topping: 'Topping',
                    other: 'Khác'
                };
                return (
                    <Tag color={categoryColors[category] || 'default'}>
                        {categoryNames[category] || category}
                    </Tag>
                );
            }
        },
        {
            title: 'Đơn vị',
            dataIndex: 'unit',
            key: 'unit',
            width: 80
        },
        {
            title: 'Giá/đơn vị',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            render: (price) => (
                <Text strong style={{ color: '#52c41a' }}>
                    {price?.toLocaleString()}đ
                </Text>
            ),
            width: 120
        },
        {
            title: 'Tồn kho',
            key: 'inventory',
            render: (_, record) => {
                const status = getStockStatus(record);
                return (
                    <div>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Text>{record.inventory || 0} {record.unit}</Text>
                            <Progress
                                percent={status.progress}
                                size="small"
                                status={status.color === 'red' ? 'exception' : status.color === 'orange' ? 'active' : 'success'}
                                showInfo={false}
                            />
                            <Tag color={status.color} size="small">{status.text}</Tag>
                        </Space>
                    </div>
                );
            },
            width: 150
        },
        {
            title: 'Công thức',
            dataIndex: 'recipe',
            key: 'recipe',
            render: renderRecipeList,
            width: 200
        },
        {
            title: 'Sản lượng/lô',
            dataIndex: 'outputQuantity',
            key: 'outputQuantity',
            render: (quantity, record) => `${quantity} ${record.unit}`,
            width: 120
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => editProcessedIngredient(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa nguyên liệu thành phẩm"
                        description={`Bạn có chắc chắn muốn xóa "${record.name}"?`}
                        onConfirm={() => handleDelete(record.id, record.name)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
            width: 100,
            fixed: 'right'
        }
    ];

    const lowStockItems = processedIngredients.filter(item =>
        (item.inventory || 0) <= (item.minStock || 10)
    );

    return (
        <div className="drink-management-container">
            <Title level={2} className="page-title">
                <ExperimentOutlined /> Quản Lý Nguyên Liệu Thành Phẩm
            </Title>

            {/* Statistics Cards */}
            <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card">
                        <Statistic
                            title="Tổng số loại"
                            value={processedIngredients.length}
                            prefix={<ExperimentOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card">
                        <Statistic
                            title="Sắp hết hàng"
                            value={lowStockItems.filter(item => item.inventory > 0).length}
                            prefix={<WarningOutlined style={{ color: '#faad14' }} />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card">
                        <Statistic
                            title="Hết hàng"
                            value={lowStockItems.filter(item => item.inventory <= 0).length}
                            prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card">
                        <Statistic
                            title="Đủ hàng"
                            value={processedIngredients.filter(item =>
                                (item.inventory || 0) > (item.minStock || 10)
                            ).length}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Form thêm/sửa nguyên liệu thành phẩm */}
                <Col xs={24} lg={12}>
                    <Card
                        className="glass-card"
                        title={
                            <Space>
                                <PlusOutlined />
                                {editingProcessed ? 'Chỉnh Sửa Nguyên Liệu Thành Phẩm' : 'Thêm Nguyên Liệu Thành Phẩm'}
                            </Space>
                        }
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            autoComplete="off"
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Tên nguyên liệu thành phẩm"
                                        name="name"
                                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                                    >
                                        <Input placeholder="VD: Nước đường" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Đơn vị tính"
                                        name="unit"
                                        rules={[{ required: true, message: 'Vui lòng nhập đơn vị!' }]}
                                    >
                                        <Input placeholder="VD: ml, lít, kg" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Mô tả"
                                name="description"
                            >
                                <TextArea rows={2} placeholder="Mô tả nguyên liệu thành phẩm..." />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        label="Danh mục"
                                        name="category"
                                        rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                                    >
                                        <Select placeholder="Chọn danh mục">
                                            <Option value="syrup">Syrup</Option>
                                            <Option value="sauce">Nước sốt</Option>
                                            <Option value="base">Nguyên liệu cơ bản</Option>
                                            <Option value="topping">Topping</Option>
                                            <Option value="other">Khác</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Sản lượng/lô"
                                        name="outputQuantity"
                                        rules={[{ required: true, message: 'Vui lòng nhập sản lượng!' }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            step={0.1}
                                            style={{ width: '100%' }}
                                            placeholder="VD: 1250"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Tồn kho tối thiểu"
                                        name="minStock"
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: '100%' }}
                                            placeholder="10"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider>Công thức chế biến</Divider>

                            {selectedRawIngredients.map((ingredient, index) => (
                                <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
                                    <Col span={8}>
                                        <Select
                                            placeholder="Chọn nguyên liệu thô"
                                            value={ingredient.ingredientId}
                                            onChange={(value) => updateRawIngredientInRecipe(index, 'ingredientId', value)}
                                            style={{ width: '100%' }}
                                        >
                                            {rawIngredients.map(raw => (
                                                <Option key={raw.id} value={raw.id}>
                                                    {raw.name} ({raw.unit})
                                                </Option>
                                            ))}
                                        </Select>
                                    </Col>
                                    <Col span={6}>
                                        <InputNumber
                                            placeholder="Số lượng"
                                            value={ingredient.quantity}
                                            onChange={(value) => updateRawIngredientInRecipe(index, 'quantity', value)}
                                            style={{ width: '100%' }}
                                            min={0}
                                            step={0.1}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <Input
                                            placeholder="Đơn vị"
                                            value={ingredient.unit}
                                            disabled
                                            style={{ width: '100%' }}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <Button
                                            type="text"
                                            danger
                                            icon={<MinusCircleOutlined />}
                                            onClick={() => removeRawIngredientFromRecipe(index)}
                                        />
                                    </Col>
                                </Row>
                            ))}

                            <Button
                                type="dashed"
                                onClick={addRawIngredientToRecipe}
                                icon={<PlusCircleOutlined />}
                                style={{ width: '100%', marginBottom: 16 }}
                            >
                                Thêm nguyên liệu thô
                            </Button>

                            {selectedRawIngredients.length > 0 && (
                                <Alert
                                    message={
                                        <div>
                                            <Space direction="vertical" size="small">
                                                <Text strong>
                                                    <DollarOutlined /> Tổng chi phí: {calculateTotalCost().toLocaleString()}đ
                                                </Text>
                                                <Text>
                                                    Giá thành/đơn vị: {calculateUnitPrice().toLocaleString()}đ
                                                </Text>
                                            </Space>
                                        </div>
                                    }
                                    type="info"
                                    style={{ marginBottom: 16 }}
                                />
                            )}

                            <Form.Item>
                                <Space>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        icon={editingProcessed ? <EditOutlined /> : <PlusOutlined />}
                                    >
                                        {editingProcessed ? 'Cập nhật' : 'Thêm mới'}
                                    </Button>
                                    <Button onClick={resetForm}>
                                        Làm mới
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* Chức năng chế biến */}
                <Col xs={24} lg={12}>
                    <Card
                        className="glass-card"
                        title={
                            <Space>
                                <ToolOutlined />
                                Chế biến nguyên liệu
                            </Space>
                        }
                    >
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                icon={<ExperimentOutlined />}
                                onClick={openProcessModal}
                                size="large"
                                style={{ width: '100%' }}
                            >
                                Bắt đầu chế biến
                            </Button>

                            <Alert
                                message="Hướng dẫn chế biến"
                                description="Chọn nguyên liệu thành phẩm và số lô muốn chế biến. Hệ thống sẽ tự động trừ nguyên liệu thô và cộng nguyên liệu thành phẩm vào kho."
                                type="info"
                            />

                            {lowStockItems.length > 0 && (
                                <Alert
                                    message={`Cảnh báo: ${lowStockItems.length} nguyên liệu thành phẩm sắp hết!`}
                                    description={
                                        <div>
                                            {lowStockItems.slice(0, 3).map(item => (
                                                <Tag key={item.id} color="red" style={{ marginBottom: 4 }}>
                                                    {item.name}: {item.inventory} {item.unit}
                                                </Tag>
                                            ))}
                                            {lowStockItems.length > 3 && <Text>... và {lowStockItems.length - 3} mục khác</Text>}
                                        </div>
                                    }
                                    type="warning"
                                />
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* Danh sách nguyên liệu thành phẩm */}
            <Row style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card
                        className="glass-card"
                        title={
                            <Space>
                                <InboxOutlined />
                                Danh sách nguyên liệu thành phẩm
                                <Tag color="blue">{processedIngredients.length} mục</Tag>
                            </Space>
                        }
                    >
                        <Table
                            columns={processedColumns}
                            dataSource={processedIngredients}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `Tổng ${total} nguyên liệu thành phẩm`
                            }}
                            scroll={{ x: 1200 }}
                            locale={{
                                emptyText: (
                                    <Empty
                                        description="Chưa có nguyên liệu thành phẩm nào"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Modal chế biến */}
            <Modal
                title={
                    <Space>
                        <ExperimentOutlined />
                        Chế biến nguyên liệu
                    </Space>
                }
                open={processModalVisible}
                onCancel={() => setProcessModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={processForm}
                    layout="vertical"
                    onFinish={handleProcessIngredients}
                >
                    <Form.Item
                        label="Chọn nguyên liệu thành phẩm"
                        name="processedId"
                        rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu!' }]}
                    >
                        <Select placeholder="Chọn nguyên liệu thành phẩm">
                            {processedIngredients.map(processed => (
                                <Option key={processed.id} value={processed.id}>
                                    {processed.name} (Sản lượng: {processed.outputQuantity} {processed.unit}/lô)
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Số lô chế biến"
                        name="batchQuantity"
                        rules={[{ required: true, message: 'Vui lòng nhập số lô!' }]}
                    >
                        <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            placeholder="VD: 2 (chế biến 2 lô)"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<ExperimentOutlined />}
                            >
                                Bắt đầu chế biến
                            </Button>
                            <Button onClick={() => setProcessModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProcessedIngredientManagement;
