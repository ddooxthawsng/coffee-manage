import React, { useEffect, useState } from "react";
import { Table, Button, Modal, message, Popconfirm, Tag } from "antd";
import UserForm from "./UserForm";
import {
    createUser,
    getUsers,
    updateUser,
    deleteUser,
} from "../../services/userService";

const UserList: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ open: false, user: null });
    const [formLoading, setFormLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        setUsers(await getUsers());
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (values: any) => {
        setFormLoading(true);
        try {
            await createUser(values.email, values.password, {
                name: values.name,
                role: values.role,
            });
            message.success("Tạo tài khoản thành công!");
            setModal({ open: false, user: null });
            fetchUsers();
        } catch (err: any) {
            message.error(err.message || "Lỗi khi tạo tài khoản!");
        }
        setFormLoading(false);
    };

    const handleEdit = async (values: any) => {
        setFormLoading(true);
        try {
            // @ts-ignore
            await updateUser(modal.user.id, {
                name: values.name,
                role: values.role,
            });
            message.success("Cập nhật thành công!");
            setModal({ open: false, user: null });
            fetchUsers();
        } catch (err: any) {
            message.error(err.message || "Lỗi khi cập nhật!");
        }
        setFormLoading(false);
    };

    const handleDelete = async (uid: string) => {
        setLoading(true);
        try {
            await deleteUser(uid);
            message.success("Đã xóa tài khoản!");
            fetchUsers();
        } catch (err: any) {
            message.error(err.message || "Lỗi khi xóa!");
        }
        setLoading(false);
    };

    return (
        <div className="p-4 bg-white min-h-screen">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h2 className="text-xl font-bold mb-2 sm:mb-0">Quản lý tài khoản</h2>
                <Button
                    type="primary"
                    onClick={() => setModal({ open: true, user: null })}
                >
                    Thêm tài khoản
                </Button>
            </div>
            <Table
                dataSource={users}
                rowKey="id"
                loading={loading}
                scroll={{ x: true }}
                columns={[
                    { title: "Họ tên", dataIndex: "name" },
                    { title: "Email", dataIndex: "email" },
                    {
                        title: "Vai trò",
                        dataIndex: "role",
                        render: (role: string) =>
                            role === "admin" ? (
                                <Tag color="red">Quản trị viên</Tag>
                            ) : (
                                <Tag color="blue">Nhân viên</Tag>
                            ),
                    },
                    {
                        title: "Thao tác",
                        key: "actions",
                        render: (_, record) => (
                            <>
                                <Button
                                    type="link"
                                    onClick={() => setModal({ open: true, user: record })}
                                >
                                    Sửa
                                </Button>
                                <Popconfirm
                                    title="Bạn chắc chắn muốn xóa?"
                                    onConfirm={() => handleDelete(record.id)}
                                >
                                    <Button type="link" danger>
                                        Xóa
                                    </Button>
                                </Popconfirm>
                            </>
                        ),
                    },
                ]}
            />
            <Modal
                open={modal.open}
                title={modal.user ? "Cập nhật tài khoản" : "Tạo tài khoản"}
                onCancel={() => setModal({ open: false, user: null })}
                footer={null}
                destroyOnClose
            >
                <UserForm
                    initialValues={modal.user}
                    onSubmit={modal.user ? handleEdit : handleCreate}
                    loading={formLoading}
                />
            </Modal>
        </div>
    );
};

export default UserList;
