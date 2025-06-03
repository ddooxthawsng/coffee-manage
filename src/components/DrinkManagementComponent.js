import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  message,
  Statistic
} from 'antd';
import {
  CoffeeOutlined,
  ExperimentOutlined,
  DollarOutlined,
  GiftOutlined
} from '@ant-design/icons';
import DrinkForm from './DrinkForm';
import DrinkList from './DrinkList';
import IngredientList from './IngredientList';
import { getDrinks, deleteDrink } from '../firebase/DrinkManagementService';
import { getProcessedIngredients } from '../firebase/ingredient_service';

const { Title } = Typography;

const DrinkManagement = () => {
  const [drinks, setDrinks] = useState([]);
  const [processedIngredients, setProcessedIngredients] = useState([]);
  const [editingDrink, setEditingDrink] = useState(null);

  useEffect(() => {
    fetchDrinks();
    fetchProcessedIngredients();
  }, []);

  const fetchDrinks = async () => {
    try {
      const drinkList = await getDrinks();
      setDrinks(drinkList);
    } catch (error) {
      message.error('Không thể tải danh sách đồ uống');
    }
  };

  const fetchProcessedIngredients = async () => {
    try {
      const processedList = await getProcessedIngredients();
      setProcessedIngredients(processedList);
    } catch (error) {
      message.error('Không thể tải danh sách nguyên liệu thành phẩm');
    }
  };

  const handleDelete = async (drinkId, drinkName) => {
    try {
      await deleteDrink(drinkId);
      message.success('Xóa đồ uống thành công!');
      fetchDrinks();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa. Vui lòng thử lại!');
    }
  };

  const regularDrinks = drinks.filter(drink => !drink.isCombo);
  const comboDrinks = drinks.filter(drink => drink.isCombo);

  return (
      <div className="drink-management-container">
        <Title level={2} className="page-title">
          <CoffeeOutlined /> Quản Lý Đồ Uống & Combo
        </Title>

        {/* Statistics Cards */}
        <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card className="stats-card">
              <Statistic
                  title="Tổng số đồ uống"
                  value={regularDrinks.length}
                  prefix={<CoffeeOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stats-card">
              <Statistic
                  title="Số combo"
                  value={comboDrinks.length}
                  prefix={<GiftOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stats-card">
              <Statistic
                  title="Nguyên liệu thành phẩm"
                  value={processedIngredients.length}
                  prefix={<ExperimentOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stats-card">
              <Statistic
                  title="Chi phí trung bình"
                  value={drinks.length > 0 ?
                      drinks.reduce((sum, drink) => sum + (drink.totalCost || 0), 0) / drinks.length : 0
                  }
                  precision={0}
                  suffix="đ"
                  prefix={<DollarOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Form thêm/sửa đồ uống */}
          <Col xs={24} lg={12}>
            <DrinkForm
                editingDrink={editingDrink}
                setEditingDrink={setEditingDrink}
                processedIngredients={processedIngredients}
                drinks={drinks}
                onSuccess={fetchDrinks}
            />
          </Col>

          {/* Danh sách nguyên liệu thành phẩm */}
          <Col xs={24} lg={12}>
            <IngredientList processedIngredients={processedIngredients} />
          </Col>
        </Row>

        {/* Danh sách đồ uống */}
        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <DrinkList
                drinks={drinks}
                onEdit={setEditingDrink}
                onDelete={handleDelete}
            />
          </Col>
        </Row>
      </div>
  );
};

export default DrinkManagement;
