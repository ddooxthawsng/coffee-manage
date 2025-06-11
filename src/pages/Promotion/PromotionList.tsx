import React, {useEffect, useState} from "react";
import {Button, message, Modal, Table, Space, Tooltip, Popconfirm, Tag} from "antd";
import {CheckCircleTwoTone, DeleteOutlined, EditOutlined, PlusOutlined, ExclamationCircleOutlined, TagOutlined, ReloadOutlined, GiftOutlined, PercentageOutlined} from "@ant-design/icons";
import {createPromotion, deletePromotion, getPromotions, updatePromotion,} from "../../services/promotionService";
import PromotionForm from "./PromotionForm";
import dayjs from "dayjs";
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
                <h2 className="text-xl font-bold mb-2 sm:mb-0 flex items-center">
                    <TagOutlined className="mr-2" /> Quản lý khuyến mãi
                </h2>
                <Space>
                    <Tooltip title="Làm mới dữ liệu">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchPromotions}
                            loading={loading}
                        />
                    </Tooltip>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setModal({open: true, item: null})}
                    >
                        Thêm khuyến mãi mới
                    </Button>
                </Space>
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
                        width: 120,
                        render: (code) => (
                            <strong style={{ color: '#1890ff' }}>{code}</strong>
                        ),
                    },
                    {
                        title: "Loại khuyến mãi",
                        dataIndex: "promotionType",
                        width: 140,
                        render: (type) => {
                            if (type === "buyXGetY") {
                                return (
                                    <Tag icon={<GiftOutlined />} color="green">
                                        Mua X tặng Y
                                    </Tag>
                                );
                            }
                            return (
                                <Tag icon={<PercentageOutlined />} color="blue">
                                    Giảm giá
                                </Tag>
                            );
                        },
                    },
                    {
                        title: "Chi tiết khuyến mãi",
                        key: "details",
                        width: 220,
                        render: (_, record) => {
                            if (record.promotionType === "buyXGetY") {
                                return (
                                    <div>
                                        <div className="font-medium">
                                            Mua {record.buyQuantity} tặng {record.freeQuantity}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {record.isAccumulative ? 'Có lũy kế' : 'Không lũy kế'}
                                            {record.maxDiscount > 0 && (
                                                <div>Tối đa: {record.maxDiscount?.toLocaleString()}đ</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            const discountText = record.type === "percent"
                                ? `${record.value}%`
                                : `${record.value?.toLocaleString()}đ`;

                            return (
                                <div>
                                    <div className="font-medium">
                                        Giảm {discountText}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {record.minOrder > 0 && (
                                            <div>Đơn từ {record.minOrder?.toLocaleString()}đ</div>
                                        )}
                                        {record.maxDiscount > 0 && (
                                            <div>Tối đa: {record.maxDiscount?.toLocaleString()}đ</div>
                                        )}
                                    </div>
                                </div>
                            );
                        },
                    },
                    {
                        title: "Thời gian áp dụng",
                        key: "dateRange",
                        width: 160,
                        render: (_, record) => {
                            const startDate = record.startDate;
                            const endDate = record.endDate;

                            if (!startDate && !endDate) {
                                return <Tag color="purple">Không giới hạn</Tag>;
                            }

                            return (
                                <div className="text-sm">
                                    {startDate && (
                                        <div>Từ: {startDate}</div>
                                    )}
                                    {endDate && (
                                        <div>Đến: {endDate}</div>
                                    )}
                                </div>
                            );
                        },
                    },
                    {
                        title: "Trạng thái",
                        key: "status",
                        width: 100,
                        render: (_, record) => {
                            const now = dayjs();
                            const startDate = record.startDate ? dayjs(record.startDate) : null;
                            const endDate = record.endDate ? dayjs(record.endDate) : null;

                            if (startDate && now.isBefore(startDate.startOf('day'))) {
                                return <Tag color="orange">Sắp diễn ra</Tag>;
                            }

                            if (endDate && now.isAfter(endDate.endOf('day'))) {
                                return <Tag color="red">Đã hết hạn</Tag>;
                            }

                            return <Tag color="green">Đang hoạt động</Tag>;
                        },
                    },
                    {
                        title: "Mặc định",
                        key: "isDefault",
                        width: 80,
                        align: "center",
                        render: (_: any, record: any) =>
                            <CheckCircleTwoTone
                                twoToneColor={record.isDefault ? "#52c41a" : "#d9d9d9"}
                                title={record.isDefault ? "Mặc định" : "Đặt làm mặc định"}
                                style={{fontSize: 22, verticalAlign: "middle", cursor: "pointer"}}
                                onClick={() => !record.isDefault && handleSetDefault(record.id)}
                            />,
                    },
                    {
                        title: "Thao tác",
                        key: "actions",
                        width: 100,
                        fixed: "right",
                        render: (_: any, record: any) => (
                            <Space size="small">
                                <Tooltip title="Sửa">
                                    <Button
                                        icon={<EditOutlined/>}
                                        type="text"
                                        size="small"
                                        onClick={() => setModal({open: true, item: record})}
                                    />
                                </Tooltip>
                                <Tooltip title="Xóa">
                                    <Popconfirm
                                        title="Xóa khuyến mãi"
                                        description="Bạn có chắc muốn xóa khuyến mãi này?"
                                        onConfirm={() => handleDelete(record.id)}
                                        okText="Có"
                                        cancelText="Không"
                                        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                                    >
                                        <Button
                                            icon={<DeleteOutlined/>}
                                            type="text"
                                            size="small"
                                            danger
                                        />
                                    </Popconfirm>
                                </Tooltip>
                            </Space>
                        ),
                    },
                ]}
                pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} khuyến mãi`,
                    pageSizeOptions: ['10', '20', '50'],
                    defaultPageSize: 10,
                }}
            />
            <Modal
                open={modal.open}
                title={
                    <div className="flex items-center">
                        <TagOutlined className="mr-2" />
                        {modal.item ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi mới"}
                    </div>
                }
                onCancel={() => setModal({open: false, item: null})}
                footer={null}
                destroyOnClose
                width={600}
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
