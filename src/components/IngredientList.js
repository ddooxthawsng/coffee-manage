import React from 'react';
import {
    Card,
    List,
    Space,
    Tag,
    Empty,
    Typography
} from 'antd';
import {
    ExperimentOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const IngredientList = ({ processedIngredients }) => {
    return (
        <Card
            className="glass-card"
            title={
                <Space>
                    <ExperimentOutlined />
                    Nguyên liệu thành phẩm có sẵn
                </Space>
            }
        >
            <List
                dataSource={processedIngredients}
                renderItem={(ingredient) => (
                    <List.Item>
                        <List.Item.Meta
                            title={
                                <Space>
                                    <Text strong>{ingredient.name}</Text>
                                    <Tag color="blue">{ingredient.unit}</Tag>
                                </Space>
                            }
                            description={
                                <Space direction="vertical" size="small">
                                    <Text>Giá: {ingredient.unitPrice?.toLocaleString()}đ/{ingredient.unit}</Text>
                                    <Text>Tồn kho: {ingredient.inventory || 0} {ingredient.unit}</Text>
                                </Space>
                            }
                        />
                    </List.Item>
                )}
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
    );
};

export default IngredientList;
