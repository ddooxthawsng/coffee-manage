import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Space, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import MenuForm from "./MenuForm";
import { getMenus, createMenu, updateMenu, deleteMenu } from "../../services/menuService";
import { getIngredientsByType } from "../../services/ingredientService";

const MenuList: React.FC = () => {
    const [menus, setMenus] = useState<any[]>([]);
    const [outputs, setOutputs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<{ open: boolean; item: any }>({ open: false, item: null });
    const [formLoading, setFormLoading] = useState(false);

    // Lấy danh sách menu và thành phẩm (outputs)
    const fetchMenus = async () => {
        setLoading(true);
        setMenus(await getMenus());
        setLoading(false);
    };
    const fetchOutputs = async () => {
        setOutputs(await getIngredientsByType("output"));
    };

    useEffect(() => {
        fetchMenus();
        fetchOutputs();
    }, []);

    const handleCreate = async (values: any) => {
        setFormLoading(true);
        try {
            await createMenu(values);
            fetchMenus();
            setModal({ open: false, item: null });
        } catch {
            // Xử lý lỗi
        }
        setFormLoading(false);
    };

    const handleEdit = async (values: any) => {
        setFormLoading(true);
        try {
            await updateMenu(modal.item.id, values);
            fetchMenus();
            setModal({ open: false, item: null });
        } catch {
            // Xử lý lỗi
        }
        setFormLoading(false);
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            await deleteMenu(id);
            fetchMenus();
        } catch {
            // Xử lý lỗi
        }
        setLoading(false);
    };

    // Hàm lấy giá cost nhỏ nhất và đơn vị của thành phẩm (output)
    const getOutputCostAndUnit = (outputId: string) => {
        const output = outputs.find((o) => o.id === outputId);
        return {
            cost: output?.costMin ?? 0,
            unit: output?.unit || "",
            name: output?.name || "",
        };
    };

    const columns = [
        { title: "Tên món", dataIndex: "name" },
        {
            title: "Size & Thành phẩm sử dụng",
            dataIndex: "sizes",
            render: (sizes: any[]) =>
                sizes && sizes.length > 0 ? (
                    <div>
                        {sizes.map((s, idx) => (
                            <div key={s.size || idx}>
                                <span style={{ fontWeight: 500 }}>{s.size}</span>
                                {": "}
                                {s.outputs && s.outputs.length > 0 ? (
                                    s.outputs.map((out: any, i: number) => {
                                        const { name, unit } = getOutputCostAndUnit(out.outputId);
                                        return (
                                            <span key={i}>
                                                {name || "?"} ({out.quantity} {unit})
                                                {i < s.outputs.length - 1 ? ", " : ""}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span style={{ color: "#aaa" }}>Chưa khai báo</span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <span style={{ color: "#aaa" }}>-</span>
                ),
        },
        {
            title: "Giá bán",
            dataIndex: "sizes",
            render: (sizes: any[]) =>
                sizes && sizes.length > 0 ? (
                    <div>
                        {sizes.map((s, idx) => (
                            <div key={s.size || idx}>
                                <span style={{ fontWeight: 500 }}>{s.size}</span>
                                {": "}
                                <span style={{ color: "#fa8c16", fontWeight: 500 }}>
                                    {s.price ? `${s.price.toLocaleString()}đ` : "-"}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <span style={{ color: "#aaa" }}>-</span>
                ),
        },
        {
            title: "Cost (ước tính)",
            dataIndex: "sizes",
            render: (sizes: any[]) =>
                sizes && sizes.length > 0 ? (
                    <div>
                        {sizes.map((s, idx) => {
                            let totalCost = 0;
                            let unit = "";
                            if (s.outputs && s.outputs.length > 0) {
                                totalCost = s.outputs.reduce((sum: number, output: any) => {
                                    const { cost, unit: u } = getOutputCostAndUnit(output.outputId);
                                    unit = u;
                                    return sum + (cost || 0) * (output.quantity || 0);
                                }, 0);
                            }
                            return (
                                <div key={s.size || idx}>
                                    <span style={{ fontWeight: 500 }}>{s.size}</span>
                                    {": "}
                                    <span style={{ color: "#52c41a" }}>
                                        {totalCost > 0 ? `${totalCost.toLocaleString()} đ${unit ? "/" + unit : ""}` : "-"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <span style={{ color: "#aaa" }}>-</span>
                ),
        },
        {
            title: "Lãi (ước tính)",
            dataIndex: "sizes",
            render: (sizes: any[]) =>
                sizes && sizes.length > 0 ? (
                    <div>
                        {sizes.map((s, idx) => {
                            let totalCost = 0;
                            if (s.outputs && s.outputs.length > 0) {
                                totalCost = s.outputs.reduce((sum: number, output: any) => {
                                    const { cost } = getOutputCostAndUnit(output.outputId);
                                    return sum + (cost || 0) * (output.quantity || 0);
                                }, 0);
                            }
                            const price = s.price || 0;
                            const profit = price - totalCost;
                            const percent = totalCost > 0 ? Math.round((profit / totalCost) * 100)-100 : null;
                            return (
                                <div key={s.size || idx}>
                                    <span style={{
                                        color: profit >= 0 ? "#1890ff" : "#f5222d",
                                        fontWeight: 500
                                    }}>
                                        {price && totalCost ? `${profit.toLocaleString()} đ` : "-"}
                                    </span>
                                    {percent !== null && price && totalCost ? (
                                        <span style={{
                                            color: profit >= 0 ? "#1890ff" : "#f5222d",
                                            marginLeft: 8
                                        }}>
                                            ({percent}%)
                                        </span>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <span style={{ color: "#aaa" }}>-</span>
                ),
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
                            onClick={() => setModal({ open: true, item: record })}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 bg-white min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                    Danh sách món ăn/đồ uống
                </h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModal({ open: true, item: null })}
                >
                    Thêm món mới
                </Button>
            </div>
            <Table
                dataSource={menus}
                rowKey="id"
                loading={loading}
                columns={columns}
                scroll={{ x: true }}
            />
            <Modal
                open={modal.open}
                title={modal.item ? "Cập nhật món" : "Thêm món mới"}
                onCancel={() => setModal({ open: false, item: null })}
                footer={null}
                destroyOnClose
                width={700}
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
