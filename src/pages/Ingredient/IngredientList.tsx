import React, {useEffect, useState} from "react";
import {Button, message, Modal, Table, Tabs, Space, Tooltip, Popconfirm} from "antd";
import {PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, ReloadOutlined, InboxOutlined, CoffeeOutlined} from "@ant-design/icons";
import IngredientForm from "./IngredientForm";
import {
    createIngredient,
    deleteIngredient,
    getIngredientsByType,
    updateIngredient,
} from "../../services/ingredientService";

const {TabPane} = Tabs;

const IngredientList: React.FC = () => {
    const [inputs, setInputs] = useState<any[]>([]);
    const [outputs, setOutputs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<{ open: boolean; item: any; type: "input" | "output" }>({
        open: false,
        item: null,
        type: "input"
    });
    const [formLoading, setFormLoading] = useState(false);

    // Load dữ liệu cho từng loại
    const fetchInputs = async () => {
        setLoading(true);
        setInputs(await getIngredientsByType("input"));
        setLoading(false);
    };
    const fetchOutputs = async () => {
        setLoading(true);
        setOutputs(await getIngredientsByType("output"));
        setLoading(false);
    };

    useEffect(() => {
        fetchInputs();
        fetchOutputs();
    }, []);

    const handleCreate = async (values: any) => {
        setFormLoading(true);
        try {
            await createIngredient({...values, type: modal.type});
            message.success("Thêm mới thành công!");
            setModal({open: false, item: null, type: modal.type});
            if (modal.type === "input") fetchInputs();
            else fetchOutputs();
        } catch {
            message.error("Lỗi khi thêm mới!");
        }
        setFormLoading(false);
    };

    const handleEdit = async (values: any) => {
        setFormLoading(true);
        try {
            await updateIngredient(modal.item.id, values);
            message.success("Cập nhật thành công!");
            setModal({open: false, item: null, type: modal.type});
            if (modal.type === "input") fetchInputs();
            else fetchOutputs();
        } catch {
            message.error("Lỗi khi cập nhật!");
        }
        setFormLoading(false);
    };

    const handleDelete = async (id: string, type: "input" | "output") => {
        setLoading(true);
        try {
            await deleteIngredient(id);
            message.success("Đã xóa!");
            if (type === "input") fetchInputs();
            else fetchOutputs();
        } catch {
            message.error("Lỗi khi xóa!");
        }
        setLoading(false);
    };

    // Cột chung cho cả hai bảng
    const columns = [
        {title: "Tên", dataIndex: "name"},
        {title: "Đơn vị", dataIndex: "unit"},
        {title: "Giá (VNĐ)", dataIndex: "price", render: (v: number) => v?.toLocaleString()},
        {
            title: "Tồn kho",
            dataIndex: "stock",
            render: (stock: number, record: any) =>
                stock <= record.threshold ? (
                    <span className="text-red-500 font-bold">{stock} (Cảnh báo!)</span>
                ) : (
                    <span>{stock}</span>
                ),
        },
        {title: "Ngưỡng cảnh báo", dataIndex: "threshold"},
        {
            title: "Thao tác",
            key: "actions",
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => setModal({open: true, item: record, type: record.type})}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc muốn xóa mục này?"
                            onConfirm={() => handleDelete(record.id, record.type)}
                            okText="Có"
                            cancelText="Không"
                            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 bg-white min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                    <InboxOutlined className="mr-2" /> Quản lý nguyên liệu
                </h2>
                <Tooltip title="Làm mới dữ liệu">
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={() => {
                            fetchInputs();
                            fetchOutputs();
                        }}
                        loading={loading}
                    />
                </Tooltip>
            </div>
            <Tabs defaultActiveKey="input">
                <TabPane tab="Nguyên liệu thô" key="input">
                    <div className="flex justify-end mb-2">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setModal({open: true, item: null, type: "input"})}
                        >
                            Thêm nguyên liệu thô
                        </Button>
                    </div>
                    <Table
                        dataSource={inputs}
                        rowKey="id"
                        loading={loading}
                        columns={columns}
                        scroll={{x: true}}
                    />
                </TabPane>
                <TabPane tab="Thành phẩm" key="output">
                    <div className="flex justify-end mb-2">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setModal({open: true, item: null, type: "output"})}
                        >
                            Thêm thành phẩm
                        </Button>
                    </div>
                    <Table
                        dataSource={outputs}
                        rowKey="id"
                        loading={loading}
                        columns={columns}
                        scroll={{x: true}}
                    />
                </TabPane>
            </Tabs>
            <Modal
                open={modal.open}
                title={modal.item ? "Cập nhật" : modal.type === "input" ? "Thêm nguyên liệu thô" : "Thêm thành phẩm"}
                onCancel={() => setModal({open: false, item: null, type: modal.type})}
                footer={null}
                destroyOnClose
            >
                <IngredientForm
                    initialValues={modal.item}
                    onSubmit={modal.item ? handleEdit : handleCreate}
                    loading={formLoading}
                />
            </Modal>
        </div>
    );
};

export default IngredientList;
