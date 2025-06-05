import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Tag, message } from "antd";
import MenuForm from "./MenuForm";
import {
    getMenus,
    createMenu,
    updateMenu,
    deleteMenu,
} from "../../services/menuService";
import { CoffeeOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const MenuList: React.FC = () => {
    const [menus, setMenus] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<any>({ open: false, item: null });
    const [formLoading, setFormLoading] = useState(false);

    const fetchMenus = async () => {
        setLoading(true);
        setMenus(await getMenus());
        setLoading(false);
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const handleCreate = async (values: any) => {
        setFormLoading(true);
        try {
            await createMenu(values);
            message.success("Thêm món mới thành công!");
            setModal({ open: false, item: null });
            fetchMenus();
        } catch {
            message.error("Lỗi khi thêm món!");
        }
        setFormLoading(false);
    };

    const handleEdit = async (values: any) => {
        setFormLoading(true);
        try {
            await updateMenu(modal.item.id, values);
            message.success("Cập nhật món thành công!");
            setModal({ open: false, item: null });
            fetchMenus();
        } catch {
            message.error("Lỗi khi cập nhật!");
        }
        setFormLoading(false);
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            await deleteMenu(id);
            message.success("Đã xóa món!");
            fetchMenus();
        } catch {
            message.error("Lỗi khi xóa!");
        }
        setLoading(false);
    };

    return (
        <div className="p-4 bg-white min-h-screen">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h2 className="text-xl font-bold mb-2 sm:mb-0 flex items-center text-menu">
                    <CoffeeOutlined className="mr-2 text-2xl" />
                    Quản lý Menu
                </h2>
                <Button
                    type="primary"
                    className="bg-menu hover:bg-orange-600 text-white"
                    onClick={() => setModal({ open: true, item: null })}
                >
                    Thêm món mới
                </Button>
            </div>
            <Table
                dataSource={menus}
                rowKey="id"
                loading={loading}
                scroll={{ x: true }}
                columns={[
                    {
                        title: "Tên món",
                        dataIndex: "name",
                        render: (name: string) => (
                            <span className="text-menu font-semibold flex items-center">
                <CoffeeOutlined className="mr-1" />
                                {name}
              </span>
                        ),
                    },
                    {
                        title: "Danh mục",
                        dataIndex: "category",
                        filters: [
                            { text: "Cà phê", value: "Cà phê" },
                            { text: "Trà", value: "Trà" },
                            { text: "Nước ép", value: "Nước ép" },
                            { text: "Khác", value: "Khác" },
                        ],
                        onFilter: (value, record) => record.category === value,
                    },
                    {
                        title: "Size & Giá",
                        dataIndex: "sizes",
                        render: (sizes: any[]) =>
                            sizes && sizes.length > 0 ? (
                                <div>
                                    {sizes.map((s, idx) => (
                                        <div key={s.size || idx}>
                                            <span style={{ fontWeight: 500 }}>{s.size}</span>
                                            {": "}
                                            <span style={{ color: "#fa8c16" }}>{s.price?.toLocaleString()}đ</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span style={{ color: "#aaa" }}>Chưa có</span>
                            ),
                    },
                    {
                        title: "Trạng thái",
                        dataIndex: "status",
                        render: (status: string) =>
                            status === "active" ? (
                                <Tag color="success" icon={<CheckCircleOutlined />}>
                                    Đang bán
                                </Tag>
                            ) : (
                                <Tag color="danger" icon={<CloseCircleOutlined />}>
                                    Ngừng bán
                                </Tag>
                            ),
                    },
                    {
                        title: "Thao tác",
                        key: "actions",
                        render: (_, record) => (
                            <>
                                <Button
                                    type="link"
                                    onClick={() => setModal({ open: true, item: record })}
                                >
                                    Sửa
                                </Button>
                                <Button
                                    type="link"
                                    danger
                                    onClick={() => handleDelete(record.id)}
                                >
                                    Xóa
                                </Button>
                            </>
                        ),
                    },
                ]}
            />
            <Modal
                open={modal.open}
                title={modal.item ? "Cập nhật món" : "Thêm món mới"}
                onCancel={() => setModal({ open: false, item: null })}
                footer={null}
                destroyOnClose
            >
                <MenuForm
                    initialValues={modal.item}
                    onSubmit={modal.item ? handleEdit : handleCreate}
                    loading={formLoading}
                />
            </Modal>
        </div>
    );
};

export default MenuList;
