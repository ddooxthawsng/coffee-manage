import React, {useEffect, useState} from "react";
import {Button, Card, Divider, Input, message, Modal, Select, Space, Table, Tabs, Tag} from "antd";
import {DeleteOutlined, EditOutlined, ExclamationCircleOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import CostForm from "./CostForm";
import CostStats from "./CostStats";
import {createCost, deleteCost, getCosts, updateCost,} from "../../services/costService";
import {useAuthLogin} from "../../hooks/context/AuthContext.tsx";

const { TabPane } = Tabs;
const {Search} = Input;

const CostList: React.FC = () => {
    const [costs, setCosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<any>({open: false, item: null});
    const [formLoading, setFormLoading] = useState(false);

    // State cho search và filter
    const [searchTerm, setSearchTerm] = useState("");
    const [groupFilter, setGroupFilter] = useState<string | undefined>(undefined);

    const fetchCosts = async () => {
        setLoading(true);
        setCosts(await getCosts());
        setLoading(false);
    };

    useEffect(() => {
        fetchCosts();
    }, []);

    // Lấy danh sách nhóm chi phí từ dữ liệu
    const groupOptions = Array.from(new Set(costs.map(c => c.group || "Khác"))).map(group => ({
        value: group,
        label: group,
    }));

    // Lọc dữ liệu theo search và filter
    const filteredCosts = costs.filter(cost => {
        const matchSearch = !searchTerm ||
            cost.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cost.note || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchGroup = !groupFilter || cost.group === groupFilter;

        return matchSearch && matchGroup;
    });

    const handleCreate = async (values: any) => {
        setFormLoading(true);
        try {
            await createCost(values);
            message.success("Thêm chi phí thành công!");
            setModal({open: false, item: null});
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
            setModal({open: false, item: null});
            fetchCosts();
        } catch {
            message.error("Lỗi khi cập nhật!");
        }
        setFormLoading(false);
    };

    const handleDelete = async (record: any) => {
        setLoading(true);
        try {
            await deleteCost(record.id);
            message.success(`Đã xóa chi phí "${record.name}" thành công!`);
            fetchCosts();
        } catch {
            message.error("Lỗi khi xóa!");
        }
        setLoading(false);
    };
    const {role} = useAuthLogin();
    // Hàm hiển thị modal xác nhận xóa với thông tin chi tiết
    const showDeleteConfirm = (record: any) => {
        Modal.confirm({
            centered: true,
            title: (
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <ExclamationCircleOutlined style={{color: 'red', fontSize: 20}}/>
                    <span>Xác nhận xóa chi phí</span>
                </div>
            ),
            content: (
                <div style={{marginTop: 16}}>
                    <div style={{
                        background: '#fff2f0',
                        border: '1px solid #ffccc7',
                        borderRadius: 6,
                        padding: 12,
                        marginBottom: 12
                    }}>
                        <p style={{margin: 0, fontWeight: 500}}>
                            Tên chi phí: <span style={{color: '#cf1322'}}>"{record.name}"</span>
                        </p>
                        <p style={{margin: '4px 0 0 0', fontSize: 13, color: '#666'}}>
                            Nhóm: {record.group} | Số tiền: {record.amount?.toLocaleString('vi-VN')} ₫
                        </p>
                        <p style={{margin: '4px 0 0 0', fontSize: 13, color: '#666'}}>
                            Ngày: {record.date}
                        </p>
                    </div>
                    <p style={{color: '#ff4d4f', margin: 0, fontSize: 14}}>
                        ⚠️ <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
                    </p>
                </div>
            ),
            okText: '🗑️ Xóa vĩnh viễn',
            okType: 'danger',
            cancelText: '❌ Hủy',
            width: 450,
            onOk() {
                return handleDelete(record);
            },
            onCancel() {
                message.info('Đã hủy thao tác xóa');
            },
        });
    };

    const columns = [
        {
            title: "Tên chi phí",
            dataIndex: "name",
            sorter: (a: any, b: any) => a.name.localeCompare(b.name, 'vi'),
            render: (text: string) => <span style={{fontWeight: 500}}>{text}</span>
        },
        {
            title: "Nhóm",
            dataIndex: "group",
            filters: groupOptions.map(group => ({text: group.label, value: group.value})),
            onFilter: (value: any, record: any) => record.group === value,
            render: (group: string) => {
                const colorMap: Record<string, string> = {
                    "Nguyên liệu": "green",
                    "Nhân sự": "blue",
                    "Điện nước": "orange",
                    "Khác": "default"
                };
                return <Tag color={colorMap[group] || "default"}>{group}</Tag>;
            },
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            sorter: (a: any, b: any) => (a.amount || 0) - (b.amount || 0),
            render: (amount: number) => (
                <span style={{fontWeight: 600, color: '#d4380d'}}>
                        {amount?.toLocaleString("vi-VN")} ₫
                    </span>
            ),
        },
        {
            title: "Ngày",
            dataIndex: "date",
            sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        },
        {
            title: "Ghi chú",
            dataIndex: "note",
            render: (note: string) => note || <span style={{color: '#ccc'}}>-</span>
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    {role ? <><Button
                        type="text"
                        icon={<EditOutlined/>}
                        onClick={() => setModal({open: true, item: record})}
                        title="Sửa"
                    />
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined/>}
                            onClick={() => showDeleteConfirm(record)}
                            title="Xóa"
                        /></> : <></>}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 bg-white min-h-screen">
            <Tabs defaultActiveKey="1">
                <TabPane tab="Danh sách chi phí" key="1">
                    {/* Header với search và filter */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <Search
                                placeholder="Tìm kiếm theo tên chi phí hoặc ghi chú..."
                                allowClear
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{width: 300}}
                                prefix={<SearchOutlined/>}
                            />
                            <Select
                                placeholder="Lọc theo nhóm"
                                allowClear
                                value={groupFilter}
                                onChange={setGroupFilter}
                                style={{width: 160}}
                                options={groupOptions}
                            />
                        </div>
                        {role ? <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            onClick={() => setModal({open: true, item: null})}
                        >
                            Thêm chi phí
                        </Button> : <></>}
                    </div>

                    {/* Hiển thị kết quả tìm kiếm */}
                    {(searchTerm || groupFilter) && (
                        <div className="mb-3 text-sm text-gray-600">
                            Tìm thấy <span className="font-medium text-blue-600">{filteredCosts.length}</span> kết quả
                            {searchTerm && <span> cho "{searchTerm}"</span>}
                            {groupFilter && <span> trong nhóm "{groupFilter}"</span>}
                        </div>
                    )}

                    <Divider/>

                    <Table
                        dataSource={filteredCosts}
                        rowKey="id"
                        loading={loading}
                        scroll={{x: true}}
                        columns={columns}
                        pagination={{
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chi phí`,
                        }}
                    />

                    <Modal
                        open={modal.open}
                        title={modal.item ? "Cập nhật chi phí" : "Thêm chi phí"}
                        onCancel={() => setModal({open: false, item: null})}
                        footer={null}
                        destroyOnClose
                        width={500}
                    >
                        <CostForm
                            initialValues={modal.item}
                            onSubmit={modal.item ? handleEdit : handleCreate}
                            loading={formLoading}
                        />
                    </Modal>
                </TabPane>

                <TabPane tab="Thống kê chi phí" key="2">
                    <Card>
                        <CostStats costs={costs}/>
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default CostList;
