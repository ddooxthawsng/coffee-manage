import React, { useEffect, useState } from "react";
import { Button, message, Modal, Table, Tabs, Space, Tooltip, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, ReloadOutlined, InboxOutlined } from "@ant-design/icons";
import IngredientForm from "./IngredientForm";
import ProductForm from "./ProductForm";
import {
    createIngredient,
    deleteIngredient,
    getIngredientsByType, updateAllOutputCostMinByInputId,
    updateIngredient,
} from "../../services/ingredientService";

const { TabPane } = Tabs;

// Định nghĩa đơn vị và hệ số quy đổi
const UNIT_GROUPS = [
    { group: "mass", units: [{ value: "g", factor: 1 }, { value: "kg", factor: 1000 }] },
    { group: "volume", units: [{ value: "ml", factor: 1 }, { value: "l", factor: 1000 }] },
    { group: "piece", units: [{ value: "cái", factor: 1 }] },
    { group: "box", units: [{ value: "hộp", factor: 1 }] },
    { group: "pack", units: [{ value: "gói", factor: 1 }] },
    { group: "bottle", units: [{ value: "chai", factor: 1 }] },
    { group: "can", units: [{ value: "bình", factor: 1 }] },
    { group: "cup", units: [{ value: "ly", factor: 1 }, { value: "tách", factor: 1 }] },
];

function findUnitGroup(unit: string) {
    return UNIT_GROUPS.find(g => g.units.some(u => u.value === unit));
}
function convertToBase(value: number, fromUnit: string, baseUnit: string) {
    const group = findUnitGroup(fromUnit);
    if (!group) return value;
    const from = group.units.find(u => u.value === fromUnit);
    const base = group.units.find(u => u.value === baseUnit);
    if (!from || !base) return value;
    return value * (from.factor / base.factor);
}

const IngredientList: React.FC = () => {
    const [inputs, setInputs] = useState<any[]>([]);
    const [outputs, setOutputs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<{ open: boolean; item: any; type: "input" | "output" }>({
        open: false,
        item: null,
        type: "input",
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
            if (modal.type === "output") {
                await createIngredient({ ...values, type: "output" });
                fetchOutputs();
            } else {
                await createIngredient({ ...values, type: "input" });
                fetchInputs();
            }
            message.success("Thêm mới thành công!");
            setModal({ open: false, item: null, type: modal.type });
        } catch {
            message.error("Lỗi khi thêm mới!");
        }
        setFormLoading(false);
    };

    const handleEdit = async (values: any) => {
        setFormLoading(true);
        try {
            await updateIngredient(modal.item.id, values);
            await updateAllOutputCostMinByInputId(modal.item.id);
            message.success("Cập nhật thành công!");
            setModal({ open: false, item: null, type: modal.type });
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

    // Cột cho nguyên liệu thô (KHÔNG còn tồn kho, ngưỡng cảnh báo)
    const inputColumns = [
        { title: "Tên", dataIndex: "name" },
        { title: "Đơn vị", dataIndex: "unit" },
        { title: "Giá cost (VNĐ)", dataIndex: "price", render: (v: number) => v?.toLocaleString() },
        {
            title: "Thao tác",
            key: "actions",
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => setModal({ open: true, item: record, type: "input" })}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc muốn xóa mục này?"
                            onConfirm={() => handleDelete(record.id, "input")}
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

    // Cột cho thành phẩm (KHÔNG có tồn kho)
    const outputColumns = [
        { title: "Tên", dataIndex: "name" },
        { title: "Đơn vị", dataIndex: "unit" },
        {
            title: "Công thức",
            dataIndex: "recipe",
            render: (recipe: any[]) =>
                recipe && recipe.length
                    ? recipe.map((item) => {
                        const ing = inputs.find((i) => i.id === item.ingredientId);
                        return ing
                            ? `${ing.name} (${item.quantity} ${item.unit || ing.unit})`
                            : "";
                    }).join(", ")
                    : <span className="text-gray-400">Chưa khai báo</span>,
        },
        {
            title: "Giá cost nhỏ nhất",
            render: (_: any, record: any) => {
                if (!record.recipe || !record.recipe.length) return <span className="text-gray-400">-</span>;
                let total = 0;
                record.recipe.forEach((item: any) => {
                    const ing = inputs.find((i) => i.id === item.ingredientId);
                    if (ing) {
                        // Tính giá trên 1 đơn vị gốc của nguyên liệu thô
                        const pricePerUnit = ing.price / convertToBase(ing.quantity || 1, ing.quantityUnit || ing.unit, ing.unit);
                        // Quy đổi số lượng phối trộn về đúng đơn vị gốc của nguyên liệu thô
                        const qtyBase = convertToBase(item.quantity || 0, item.unit || ing.unit, ing.unit);
                        total += qtyBase * pricePerUnit;
                    }
                });

                const outputMin = record.outputMinQuantity;
                const outputMax = record.outputMaxQuantity;
                const outputUnit = record.outputUnit;

                let perUnitCostMin = 0;
                let perUnitCostMax = 0;

                if (outputMin && outputUnit) {
                    const outputMinBase = convertToBase(outputMin, outputUnit, outputUnit);
                    if (outputMinBase > 0) {
                        perUnitCostMin = Math.ceil(total / outputMinBase);
                    }
                }
                if (outputMax && outputUnit) {
                    const outputMaxBase = convertToBase(outputMax, outputUnit, outputUnit);
                    if (outputMaxBase > 0) {
                        perUnitCostMax = Math.ceil(total / outputMaxBase);
                    }
                }

                if (perUnitCostMin && perUnitCostMax && perUnitCostMin !== perUnitCostMax) {
                    return (
                        <span className="font-semibold text-blue-600">
                    {perUnitCostMin.toLocaleString()} - {perUnitCostMax.toLocaleString()} đ/{outputUnit}
                </span>
                    );
                }
                if (perUnitCostMin) {
                    return (
                        <span className="font-semibold text-blue-600">
                    {perUnitCostMin.toLocaleString()} đ/{outputUnit}
                </span>
                    );
                }
                return <span className="text-gray-400">-</span>;
            }
        },

        {
            title: "Thao tác",
            key: "actions",
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => setModal({ open: true, item: record, type: "output" })}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc muốn xóa mục này?"
                            onConfirm={() => handleDelete(record.id, "output")}
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
                            onClick={() => setModal({ open: true, item: null, type: "input" })}
                        >
                            Thêm nguyên liệu thô
                        </Button>
                    </div>
                    <Table
                        dataSource={inputs}
                        rowKey="id"
                        loading={loading}
                        columns={inputColumns}
                        scroll={{ x: true }}
                    />
                </TabPane>
                <TabPane tab="Thành phẩm" key="output">
                    <div className="flex justify-end mb-2">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setModal({ open: true, item: null, type: "output" })}
                        >
                            Thêm thành phẩm
                        </Button>
                    </div>
                    <Table
                        dataSource={outputs}
                        rowKey="id"
                        loading={loading}
                        columns={outputColumns}
                        scroll={{ x: true }}
                    />
                </TabPane>
            </Tabs>
            <Modal
                open={modal.open}
                title={
                    modal.item
                        ? (modal.type === "input" ? "Cập nhật nguyên liệu thô" : "Cập nhật thành phẩm")
                        : (modal.type === "input" ? "Thêm nguyên liệu thô" : "Thêm thành phẩm")
                }
                onCancel={() => setModal({ open: false, item: null, type: modal.type })}
                footer={null}
                destroyOnClose
            >
                {modal.type === "input" ? (
                    <IngredientForm
                        initialValues={modal.item}
                        onSubmit={modal.item ? handleEdit : handleCreate}
                        loading={formLoading}
                    />
                ) : (
                    <ProductForm
                        rawIngredients={inputs}
                        initialValues={modal.item}
                        onSubmit={modal.item ? handleEdit : handleCreate}
                        loading={formLoading}
                    />
                )}
            </Modal>
        </div>
    );
};

export default IngredientList;
