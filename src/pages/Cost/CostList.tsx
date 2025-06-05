import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Tag, message } from "antd";
import CostForm from "./CostForm";
import {
    getCosts,
    createCost,
    updateCost,
    deleteCost,
} from "../../services/costService";

const CostList: React.FC = () => {
    const [costs, setCosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<any>({ open: false, item: null });
    const [formLoading, setFormLoading] = useState(false);

    const fetchCosts = async () => {
        setLoading(true);
        setCosts(await getCosts());
        setLoading(false);
    };

    useEffect(() => {
        fetchCosts();
    }, []);

    const handleCreate = async (values: any) => {
        setFormLoading(true);
        try {
            await createCost(values);
            message.success("Thêm chi phí thành công!");
            setModal({ open: false, item: null });
            fetchCosts();
        } catch {
            message.error("Lỗi khi thêm chi phí!");
        }
        setFormLoading(false);
    };

    const handleEdit = async (values: any) => {
        setFormLoading(true);
        try {
            await updateCost(modal.item.id, values);
            message.success("Cập nhật thành công!");
            setModal({ open: false, item: null });
            fetchCosts();
        } catch {
            message.error("Lỗi khi cập nhật!");
        }
        setFormLoading(false);
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            await deleteCost(id);
            message.success("Đã xóa chi phí!");
            fetchCosts();
        } catch {
            message.error("Lỗi khi xóa!");
        }
        setLoading(false);
    };

    return (
        <div className="p-4 bg-white min-h-screen">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h2 className="text-xl font-bold mb-2 sm:mb-0">Quản lý chi phí</h2>
                <Button
                    type="primary"
                    onClick={() => setModal({ open: true, item: null })}
                >
                    Thêm chi phí
                </Button>
            </div>
            <Table
                dataSource={costs}
                rowKey="id"
                loading={loading}
                scroll={{ x: true }}
                columns={[
                    { title: "Tên chi phí", dataIndex: "name" },
                    {
                        title: "Nhóm",
                        dataIndex: "group",
                        render: (group: string) => <Tag color="blue">{group}</Tag>,
                    },
                    {
                        title: "Số tiền",
                        dataIndex: "amount",
                        render: (amount: number) =>
                            amount.toLocaleString("vi-VN") + " ₫",
                    },
                    { title: "Ngày", dataIndex: "date" },
                    { title: "Ghi chú", dataIndex: "note" },
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
                title={modal.item ? "Cập nhật chi phí" : "Thêm chi phí"}
                onCancel={() => setModal({ open: false, item: null })}
                footer={null}
                destroyOnClose
            >
                <CostForm
                    initialValues={modal.item}
                    onSubmit={modal.item ? handleEdit : handleCreate}
                    loading={formLoading}
                />
            </Modal>
        </div>
    );
};

export default CostList;
