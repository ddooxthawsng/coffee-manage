import React, {useEffect, useState} from "react";
import {Button, message, Modal, Table, Space, Tooltip, Popconfirm, Tag, Input, Select, Row, Col, Card} from "antd";
import {CheckCircleTwoTone, DeleteOutlined, EditOutlined, PlusOutlined, ExclamationCircleOutlined, TagOutlined, ReloadOutlined, GiftOutlined, PercentageOutlined, CopyOutlined, SearchOutlined} from "@ant-design/icons";
import {createPromotion, deletePromotion, getPromotions, updatePromotion,} from "../../services/promotionService";
import PromotionForm from "./PromotionForm";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;

const PromotionList: React.FC = () => {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [filteredPromotions, setFilteredPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<any>({open: false, item: null});
    const [formLoading, setFormLoading] = useState(false);

    // Filter states
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const fetchPromotions = async () => {
        setLoading(true);
        const data = await getPromotions();
        setPromotions(data);
        setFilteredPromotions(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    // Filter logic
    useEffect(() => {
        let filtered = [...promotions];

        // Search filter
        if (searchText) {
            filtered = filtered.filter(promo =>
                promo.code.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(promo => {
                const now = dayjs();
                const startDate = promo.startDate ? dayjs(promo.startDate) : null;
                const endDate = promo.endDate ? dayjs(promo.endDate) : null;

                if (statusFilter === "active") {
                    return (!startDate || now.isAfter(startDate.startOf('day'))) &&
                        (!endDate || now.isBefore(endDate.endOf('day')));
                } else if (statusFilter === "upcoming") {
                    return startDate && now.isBefore(startDate.startOf('day'));
                } else if (statusFilter === "expired") {
                    return endDate && now.isAfter(endDate.endOf('day'));
                }
                return true;
            });
        }

        // Type filter
        if (typeFilter !== "all") {
            filtered = filtered.filter(promo => promo.promotionType === typeFilter);
        }

        setFilteredPromotions(filtered);
    }, [promotions, searchText, statusFilter, typeFilter]);

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

    // Clone promotion
    const handleClone = (record: any) => {
        const clonedData = {
            ...record,
            code: `${record.code}_COPY_${Date.now()}`,
            isDefault: false,
            id: undefined, // Remove id to create new record
        };
        setModal({open: true, item: clonedData});
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

    const getStatusTag = (record: any) => {
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
    };

    const clearFilters = () => {
        setSearchText("");
        setStatusFilter("all");
        setTypeFilter("all");
    };

    return (
        <div className="p-4 bg-white min-h-screen">
            <Card>
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

                {/* Filter Section */}
                <Row gutter={[16, 16]} className="mb-4">
                    <Col xs={24} sm={12} md={8}>
                        <Search
                            placeholder="Tìm kiếm theo mã khuyến mãi"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onSearch={setSearchText}
                            allowClear
                            prefix={<SearchOutlined />}
                        />
                    </Col>
                    <Col xs={24} sm={6} md={4}>
                        <Select
                            placeholder="Trạng thái"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Tất cả trạng thái</Option>
                            <Option value="active">Đang hoạt động</Option>
                            <Option value="upcoming">Sắp diễn ra</Option>
                            <Option value="expired">Đã hết hạn</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={6} md={4}>
                        <Select
                            placeholder="Loại khuyến mãi"
                            value={typeFilter}
                            onChange={setTypeFilter}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Tất cả loại</Option>
                            <Option value="discount">Giảm giá</Option>
                            <Option value="buyXGetY">Mua X tặng Y</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <Space>
                            <Button onClick={clearFilters}>
                                Xóa bộ lọc
                            </Button>
                            <span className="text-gray-500">
                                Hiển thị {filteredPromotions.length}/{promotions.length} khuyến mãi
                            </span>
                        </Space>
                    </Col>
                </Row>

                <Table
                    dataSource={filteredPromotions}
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
                                                {record.maxDiscount && record.maxDiscount > 0 && (
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
                                            {record.minOrder && record.minOrder > 0 && (
                                                <div>Đơn từ {record.minOrder?.toLocaleString()}đ</div>
                                            )}
                                            {record.maxDiscount && record.maxDiscount > 0 && (
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
                                            <div>Từ: {dayjs(startDate).format("DD/MM/YYYY")}</div>
                                        )}
                                        {endDate && (
                                            <div>Đến: {dayjs(endDate).format("DD/MM/YYYY")}</div>
                                        )}
                                    </div>
                                );
                            },
                        },
                        {
                            title: "Trạng thái",
                            key: "status",
                            width: 100,
                            render: (_, record) => getStatusTag(record),
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
                            width: 120,
                            fixed: "right",
                            render: (_: any, record: any) => (
                                <Space size="small">
                                    <Tooltip title="Nhân bản">
                                        <Button
                                            icon={<CopyOutlined/>}
                                            type="text"
                                            size="small"
                                            onClick={() => handleClone(record)}
                                        />
                                    </Tooltip>
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
            </Card>

            <Modal
                open={modal.open}
                title={
                    <div className="flex items-center">
                        <TagOutlined className="mr-2" />
                        {modal.item?.id ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi mới"}
                    </div>
                }
                onCancel={() => setModal({open: false, item: null})}
                footer={null}
                destroyOnClose
                width={600}
            >
                <PromotionForm
                    initialValues={modal.item}
                    onSubmit={modal.item?.id ? handleEdit : handleCreate}
                    loading={formLoading}
                />
            </Modal>
        </div>
    );
};

export default PromotionList;
