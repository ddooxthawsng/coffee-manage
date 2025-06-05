import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Space, Tag, Input, Form, Popconfirm, message, Tooltip, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, AppstoreOutlined, CoffeeOutlined, ReloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getMenuCategories, createMenuCategory, updateMenuCategory, deleteMenuCategory, refreshMenuCategoryCache, type MenuCategory } from '../../services/menuCategoryService';
import { TwitterPicker } from 'react-color';

const MenuCategoryList: React.FC = () => {
  // State cho danh sách danh mục
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [menuCounts, setMenuCounts] = useState<Record<string, number>>({});

  // State cho modal thêm/sửa
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [color, setColor] = useState<string>('#1890ff');
  const [form] = Form.useForm();

  // Fetch categories data
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [data, counts] = await Promise.all([
        getMenuCategories(),
        getMenuCountByCategory()
      ]);
      setCategories(data);
      setMenuCounts(counts);
    } catch (error) {
      message.error('Lỗi khi tải danh mục!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle color change
  const handleColorChange = (color: any) => {
    setColor(color.hex);
    form.setFieldsValue({ color: color.hex });
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory?.id) {
        await updateMenuCategory(editingCategory.id, values);
        message.success('Cập nhật danh mục thành công!');
      } else {
        await createMenuCategory(values);
        message.success('Thêm danh mục thành công!');
      }
      setIsModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error('Đã xảy ra lỗi!');
      console.error(error);
    }
  };

  // Handle editing
  const handleEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    setColor(category.color || '#1890ff');
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      color: category.color,
      status: category.status || 'active',
    });
    setIsModalVisible(true);
  };

  // Handle create new
  const handleCreate = () => {
    setEditingCategory(null);
    setColor('#1890ff');
    form.resetFields();
    form.setFieldsValue({ status: 'active', color: '#1890ff' });
    setIsModalVisible(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      // Kiểm tra xem danh mục có món không
      const menuCount = menuCounts[id] || 0;
      if (menuCount > 0) {
        Modal.confirm({
          title: 'Cảnh báo',
          icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
          content: `Danh mục này đang có ${menuCount} món. Xóa danh mục sẽ ảnh hưởng đến các món này. Bạn có chắc chắn muốn xóa?`,
          okText: 'Xóa',
          cancelText: 'Hủy',
          okButtonProps: { danger: true },
          onOk: async () => {
            await deleteMenuCategory(id);
            message.success('Xóa danh mục thành công!');
            fetchCategories();
          }
        });
      } else {
        await deleteMenuCategory(id);
        message.success('Xóa danh mục thành công!');
        fetchCategories();
      }
    } catch (error) {
      message.error('Lỗi khi xóa danh mục!');
      console.error(error);
    }
  };

  // Modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
  };

  // Handle refresh cache
  const handleRefreshCache = async () => {
    try {
      setLoading(true);
      await refreshMenuCategoryCache();
      fetchCategories();
      message.success('Đã làm mới dữ liệu danh mục!');
    } catch (error) {
      message.error('Lỗi khi làm mới dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  // Columns for the table
  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MenuCategory) => {
        const count = record.id ? menuCounts[record.id] || 0 : 0;
        return (
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: record.color || '#1890ff' }}
            />
            <span>{text}</span>
            {count > 0 && (
              <Badge count={count} className="ml-2" overflowCount={99}>
                <CoffeeOutlined style={{ fontSize: '0px' }} />
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || <span className="text-gray-400">Không có mô tả</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: MenuCategory) => (
        <Space size="middle">
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc muốn xóa danh mục này?"
              onConfirm={() => record.id && handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold flex items-center">
          <AppstoreOutlined className="mr-2" /> Quản lý danh mục Menu
        </h1>
        <Space>
          <Tooltip title="Làm mới dữ liệu">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefreshCache}
              loading={loading}
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Thêm danh mục
          </Button>
        </Space>
      </div>

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            color: '#1890ff',
          }}
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả (không bắt buộc)" />
          </Form.Item>

          <Form.Item name="color" label="Màu sắc">
            <TwitterPicker
              color={color}
              onChangeComplete={handleColorChange}
              colors={[
                '#1890ff', '#13c2c2', '#52c41a', '#fadb14',
                '#fa8c16', '#f5222d', '#722ed1', '#eb2f96',
              ]}
            />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Input.Group compact>
              <Button
                type={form.getFieldValue('status') === 'active' ? 'primary' : 'default'}
                onClick={() => form.setFieldsValue({ status: 'active' })}
                style={{ width: '50%' }}
              >
                Hoạt động
              </Button>
              <Button
                type={form.getFieldValue('status') === 'inactive' ? 'primary' : 'default'}
                onClick={() => form.setFieldsValue({ status: 'inactive' })}
                danger={form.getFieldValue('status') === 'inactive'}
                style={{ width: '50%' }}
              >
                Không hoạt động
              </Button>
            </Input.Group>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end">
              <Button 
                onClick={handleCancel} 
                className="mr-2"
                icon={<CloseCircleOutlined />}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={editingCategory ? <EditOutlined /> : <PlusOutlined />}
              >
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuCategoryList;
