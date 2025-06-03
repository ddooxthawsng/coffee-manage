import React from 'react';
import {
    Card,
    Table,
    Space,
    Tag,
    Button,
    Tooltip,
    Popconfirm,
    Empty,
    Typography
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    InboxOutlined,
    GiftOutlined,
    PercentageOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const DrinkList = ({ drinks, onEdit, onDelete }) => {
    const renderIngredientsList = (drinkIngredients) => {
        if (!Array.isArray(drinkIngredients) || drinkIngredients.length === 0) {
            return <Text type="secondary">Chưa có công thức</Text>;
        }

        return (
            <div>
                {drinkIngredients.map((ingredient, index) => (
                    <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                        {ingredient.name}: {ingredient.quantity} {ingredient.unit}
                    </Tag>
                ))}
            </div>
        );
    };

    const renderComboItems = (comboItems) => {
        if (!Array.isArray(comboItems) || comboItems.length === 0) {
            return <Text type="secondary">Chưa có món trong combo</Text>;
        }

        return (
            <div>
                {comboItems.map((item, index) => (
                    <Tag key={index} color="purple" style={{ marginBottom: 4 }}>
                        {item.name} ({item.size})
                    </Tag>
                ))}
            </div>
        );
    };

    const drinkColumns = [
        {
            title: 'Tên đồ uống',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <Space>
                        <Text strong>{text}</Text>
                        {record.isCombo && <Tag color="purple" icon={<GiftOutlined />}>COMBO</Tag>}
                    </Space>
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
            render: (category, record) => {
                if (record.isCombo) {
                    return <Tag color="purple">Combo</Tag>;
                }

                const categoryColors = {
                    coffee: 'brown',
                    tea: 'green',
                    juice: 'orange',
                    smoothie: 'purple',
                    other: 'default'
                };
                const categoryNames = {
                    coffee: 'Cà phê',
                    tea: 'Trà',
                    juice: 'Nước ép',
                    smoothie: 'Sinh tố',
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
            title: 'Giá bán',
            key: 'price',
            render: (_, record) => {
                const availableSizes = record.availableSizes || Object.keys(record.price || {});
                return (
                    <div>
                        {availableSizes.map(size => (
                            <Tag key={size} color={size === 'S' ? 'green' : size === 'M' ? 'blue' : 'orange'}>
                                {size}: {record.price?.[size]?.toLocaleString()}đ
                            </Tag>
                        ))}
                        {record.isCombo && record.discountPercent > 0 && (
                            <div style={{ marginTop: 4 }}>
                                <Tag color="red" icon={<PercentageOutlined />}>
                                    Giảm {record.discountPercent}%
                                </Tag>
                            </div>
                        )}
                    </div>
                );
            },
            width: 200
        },
        {
            title: 'Chi phí',
            dataIndex: 'totalCost',
            key: 'totalCost',
            render: (cost) => (
                <Text strong style={{ color: '#f5222d' }}>
                    {cost?.toLocaleString()}đ
                </Text>
            ),
            width: 100
        },
        {
            title: 'Thành phần',
            key: 'components',
            render: (_, record) => {
                if (record.isCombo) {
                    return renderComboItems(record.comboItems);
                } else {
                    return renderIngredientsList(record.ingredients);
                }
            },
            width: 200
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
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa đồ uống"
                        description={`Bạn có chắc chắn muốn xóa "${record.name}"?`}
                        onConfirm={() => onDelete(record.id, record.name)}
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

    return (
        <Card
            className="glass-card"
            title={
                <Space>
                    <InboxOutlined />
                    Danh sách đồ uống & combo
                    <Tag color="blue">{drinks.length} mục</Tag>
                </Space>
            }
        >
            <Table
                columns={drinkColumns}
                dataSource={drinks}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `Tổng ${total} đồ uống & combo`
                }}
                scroll={{ x: 1200 }}
                locale={{
                    emptyText: (
                        <Empty
                            description="Chưa có đồ uống nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    )
                }}
            />
        </Card>
    );
};

export default DrinkList;
