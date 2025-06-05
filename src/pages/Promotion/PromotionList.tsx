import React, {useEffect, useState} from "react";
import {Button, message, Modal, Table} from "antd";
import {CheckCircleTwoTone, DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {createPromotion, deletePromotion, getPromotions, updatePromotion,} from "../../services/promotionService";
import PromotionForm from "./PromotionForm";

const PromotionList: React.FC = () => {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<any>({open: false, item: null});
    const [formLoading, setFormLoading] = useState(false);

    const fetchPromotions = async () => {
        setLoading(true);
        setPromotions(await getPromotions());
        setLoading(false);
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleCreate = async (values: any) => {
        setFormLoading(true);
        try {
            await createPromotion(values);
            message.success("Tạo khuyến mãi thành công!");
            setModal({open: false, item: null});
            fetchPromotions();
        } catch {
            message.error("Lỗi khi tạo khuyến mãi!");
        }
        setFormLoading(false);
    };

    const handleEdit = async (values: any) => {
        setFormLoading(true);
        try {
            await updatePromotion(modal.item.id, values);
            message.success("Cập nhật thành công!");
            setModal({open: false, item: null});
            fetchPromotions();
        } catch {
            message.error("Lỗi khi cập nhật!");
        }
        setFormLoading(false);
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            await deletePromotion(id);
            message.success("Đã xóa khuyến mãi!");
            fetchPromotions();
        } catch {
            message.error("Lỗi khi xóa!");
        }
        setLoading(false);
    };

    // Đặt làm mặc định: chỉ có 1 mã được mặc định
    const handleSetDefault = async (id: string) => {
        setLoading(true);
        try {
            // Bỏ mặc định tất cả mã khác
            await Promise.all(
                promotions
                    .filter((promo) => promo.isDefault && promo.id !== id)
                    .map((promo) => updatePromotion(promo.id, {isDefault: false}))
            );
            // Đặt mặc định cho mã được chọn
            await updatePromotion(id, {isDefault: true});
            message.success("Đã đặt làm mặc định!");
            fetchPromotions();
        } catch {
            message.error("Lỗi khi đặt mặc định!");
        }
        setLoading(false);
    };

    return (
        <div className="p-4 bg-white min-h-screen">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h2 className="text-xl font-bold mb-2 sm:mb-0">Quản lý khuyến mãi</h2>
                <Button
                    type="primary"
                    onClick={() => setModal({open: true, item: null})}
                >
                    Thêm khuyến mãi mới
                </Button>
            </div>
            <Table
                dataSource={promotions}
                rowKey="id"
                loading={loading}
                scroll={{x: true}}
                columns={[
                    {
                        title: "Mã khuyến mãi",
                        dataIndex: "code",
                    },
                    {
                        title: "Loại giảm giá",
                        dataIndex: "type",
                        render: (type) => type === "percent" ? "Phần trăm" : "Số tiền",
                    },
                    {
                        title: "Giá trị giảm",
                        dataIndex: "value",
                        render: (value, record) =>
                            record.type === "percent"
                                ? `${value}%`
                                : `${value.toLocaleString()}đ`,
                    },
                    {
                        title: "Ngày bắt đầu",
                        dataIndex: "startDate",
                        render: (date) => date ? date : "-",
                    },
                    {
                        title: "Ngày kết thúc",
                        dataIndex: "endDate",
                        render: (date) => date ? date : "-",
                    },
                    {
                        title: "Mặc định",
                        key: "isDefault",
                        render: (_: any, record: any) =>
                            <CheckCircleTwoTone
                                twoToneColor={record.isDefault ? "#52c41a" : "#d9d9d9"}
                                title={record.isDefault ? "Mặc định" : "Đặt làm mặc định"}
                                style={{fontSize: 22, verticalAlign: "middle", cursor: "pointer", marginRight: 8}}
                                onClick={() => !record.isDefault && handleSetDefault(record.id)}
                            />,
                    },
                    {
                        title: "Thao tác",
                        key: "actions",
                        render: (_: any, record: any) => (
                            <>
                                <Button
                                    icon={<EditOutlined/>}
                                    type="link"
                                    onClick={() => setModal({open: true, item: record})}
                                >
                                    Sửa
                                </Button>
                                <Button
                                    icon={<DeleteOutlined/>}
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
                title={modal.item ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi mới"}
                onCancel={() => setModal({open: false, item: null})}
                footer={null}
                destroyOnClose
            >
                <PromotionForm
                    initialValues={modal.item}
                    onSubmit={modal.item ? handleEdit : handleCreate}
                    loading={formLoading}
                />
            </Modal>
        </div>
    );
};

export default PromotionList;
