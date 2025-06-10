import React, { useEffect, useState } from "react";
import { Button, message, Modal, Table, Tabs, Space, Tooltip, Popconfirm, Input } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, ReloadOutlined, InboxOutlined, CopyOutlined, SearchOutlined } from "@ant-design/icons";
import IngredientForm from "./IngredientForm";
import ProductForm from "./ProductForm";
import {
    createIngredient,
    deleteIngredient,
    getIngredientsByType,
    updateAllOutputCostMinByInputId,
    updateIngredient,
} from "../../services/ingredientService";

const { TabPane } = Tabs;
const { Search } = Input;

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

    // State cho search
    const [searchInputs, setSearchInputs] = useState("");
    const [searchOutputs, setSearchOutputs] = useState("");

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

    // Hàm lọc dữ liệu theo search
    const getFilteredInputs = () => {
        if (!searchInputs.trim()) return inputs;
        return inputs.filter(item =>
            item.name.toLowerCase().includes(searchInputs.toLowerCase()) ||
            item.unit.toLowerCase().includes(searchInputs.toLowerCase())
        );
    };

    const getFilteredOutputs = () => {
        if (!searchOutputs.trim()) return outputs;
        return outputs.filter(item =>
            item.name.toLowerCase().includes(searchOutputs.toLowerCase()) ||
            item.unit.toLowerCase().includes(searchOutputs.toLowerCase())
        );
    };

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

    // Hàm nhân bản
    const handleClone = (record: any, type: "input" | "output") => {
        const clonedData = {
            ...record,
            name: `${record.name} (Bản sao)`,
            id: undefined // Xóa ID để tạo mới
        };
        setModal({ open: true, item: clonedData, type });
    };

    // Cột cho nguyên liệu thô với search và clone
    const inputColumns = [
        {
            title: "Tên",
            dataIndex: "name",
            sorter: (a: any, b: any) => a.name.localeCompare(b.name, 'vi'),
        },
        {
            title: "Đơn vị",
            dataIndex: "unit",
            filters: [...new Set(inputs.map(item => item.unit))].map(unit => ({ text: unit, value: unit })),
            onFilter: (value: any, record: any) => record.unit === value,
        },
        {
            title: "Giá cost (VNĐ)",
            dataIndex: "price",
            render: (v: number) => v?.toLocaleString(),
            sorter: (a: any, b: any) => (a.price || 0) - (b.price || 0),
        },
        {
            title: "Định lượng",
            render: (_: any, record: any) => (
                <span className="text-sm text-gray-600">
                    {record.quantity} {record.quantityUnit || record.unit}
                </span>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 150,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => setModal({ open: true, item: record, type: "input" })}
                        />
                    </Tooltip>
                    <Tooltip title="Nhân bản">
                        <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => handleClone(record, "input")}
                            className="text-blue-600 hover:text-blue-800"
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
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Cột cho thành phẩm với search và clone
    const outputColumns = [
        {
            title: "Tên",
            dataIndex: "name",
            sorter: (a: any, b: any) => a.name.localeCompare(b.name, 'vi'),
        },
        {
            title: "Đơn vị",
            dataIndex: "unit",
            filters: [...new Set(outputs.map(item => item.unit))].map(unit => ({ text: unit, value: unit })),
            onFilter: (value: any, record: any) => record.unit === value,
        },
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
                        const pricePerUnit = ing.price / convertToBase(ing.quantity || 1, ing.quantityUnit || ing.unit, ing.unit);
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
            width: 150,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => setModal({ open: true, item: record, type: "output" })}
                        />
                    </Tooltip>
                    <Tooltip title="Nhân bản">
                        <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => handleClone(record, "output")}
                            className="text-blue-600 hover:text-blue-800"
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
                                size="small"
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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                        <Search
                            placeholder="Tìm kiếm theo tên nguyên liệu, đơn vị..."
                            allowClear
                            value={searchInputs}
                            onChange={(e) => setSearchInputs(e.target.value)}
                            style={{ maxWidth: 400 }}
                            prefix={<SearchOutlined />}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setModal({ open: true, item: null, type: "input" })}
                        >
                            Thêm nguyên liệu thô
                        </Button>
                    </div>

                    {searchInputs && (
                        <div className="mb-3 text-sm text-gray-600">
                            Tìm thấy <span className="font-medium text-blue-600">{getFilteredInputs().length}</span> kết quả
                        </div>
                    )}

                    <Table
                        dataSource={getFilteredInputs()}
                        rowKey="id"
                        loading={loading}
                        columns={inputColumns}
                        scroll={{ x: true }}
                        pagination={{
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
                        }}
                    />
                </TabPane>

                <TabPane tab="Thành phẩm" key="output">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                        <Search
                            placeholder="Tìm kiếm theo tên thành phẩm, đơn vị..."
                            allowClear
                            value={searchOutputs}
                            onChange={(e) => setSearchOutputs(e.target.value)}
                            style={{ maxWidth: 400 }}
                            prefix={<SearchOutlined />}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setModal({ open: true, item: null, type: "output" })}
                        >
                            Thêm thành phẩm
                        </Button>
                    </div>

                    {searchOutputs && (
                        <div className="mb-3 text-sm text-gray-600">
                            Tìm thấy <span className="font-medium text-blue-600">{getFilteredOutputs().length}</span> kết quả
                        </div>
                    )}

                    <Table
                        dataSource={getFilteredOutputs()}
                        rowKey="id"
                        loading={loading}
                        columns={outputColumns}
                        scroll={{ x: true }}
                        pagination={{
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
                        }}
                    />
                </TabPane>
            </Tabs>

            <Modal
                open={modal.open}
                title={
                    modal.item?.id
                        ? (modal.type === "input" ? "Cập nhật nguyên liệu thô" : "Cập nhật thành phẩm")
                        : (modal.type === "input" ? "Thêm nguyên liệu thô" : "Thêm thành phẩm")
                }
                onCancel={() => setModal({ open: false, item: null, type: modal.type })}
                footer={null}
                destroyOnClose
                width={600}
            >
                {modal.type === "input" ? (
                    <IngredientForm
                        initialValues={modal.item}
                        onSubmit={modal.item?.id ? handleEdit : handleCreate}
                        loading={formLoading}
                    />
                ) : (
                    <ProductForm
                        rawIngredients={inputs}
                        initialValues={modal.item}
                        onSubmit={modal.item?.id ? handleEdit : handleCreate}
                        loading={formLoading}
                    />
                )}
            </Modal>
        </div>
    );
};

export default IngredientList;
