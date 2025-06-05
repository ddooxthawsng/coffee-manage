import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Select, InputNumber, message, Space, Tooltip, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, ExperimentOutlined, ReloadOutlined, BuildOutlined } from "@ant-design/icons";
import {
    getIngredientsByType,
    updateIngredient,
    getIngredientById,
} from "../../services/ingredientService";
import {
    getRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
} from "../../services/recipeService";

const { Option } = Select;

const RecipeList: React.FC = () => {
    const [recipes, setRecipes] = useState<any[]>([]);
    const [inputs, setInputs] = useState<any[]>([]); // Nguyên liệu thô
    const [outputs, setOutputs] = useState<any[]>([]); // Thành phẩm
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<any>({ open: false, item: null });
    const [formLoading, setFormLoading] = useState(false);
    const [processModal, setProcessModal] = useState<any>({ open: false, recipe: null });

    // Load dữ liệu
    useEffect(() => {
        setLoading(true);
        Promise.all([
            getRecipes(),
            getIngredientsByType("input"),
            getIngredientsByType("output"),
        ]).then(([recipes, inputs, outputs]) => {
            setRecipes(recipes);
            setInputs(inputs);
            setOutputs(outputs);
            setLoading(false);
        });
    }, []);

    const handleCreate = async (values: any) => {
        setFormLoading(true);
        try {
            await createRecipe(values);
            setRecipes(await getRecipes());
            setModal({ open: false, item: null });
            message.success("Thêm công thức thành công!");
        } catch {
            message.error("Lỗi khi thêm công thức!");
        }
        setFormLoading(false);
    };

    const handleEdit = async (values: any) => {
        setFormLoading(true);
        try {
            await updateRecipe(modal.item.id, values);
            setRecipes(await getRecipes());
            setModal({ open: false, item: null });
            message.success("Cập nhật công thức thành công!");
        } catch {
            message.error("Lỗi khi cập nhật công thức!");
        }
        setFormLoading(false);
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            await deleteRecipe(id);
            setRecipes(await getRecipes());
            message.success("Đã xóa công thức!");
        } catch {
            message.error("Lỗi khi xóa công thức!");
        }
        setLoading(false);
    };

    // Chế biến thành phẩm từ công thức (trừ kho nguyên liệu, cộng kho thành phẩm)
    const handleProcess = async (recipe: any, quantity: number) => {
        try {
            // Kiểm tra tồn kho nguyên liệu
            for (const item of recipe.recipe) {
                const ngl:any = await getIngredientById(item.ingredientId);
                if (!ngl) throw new Error("Nguyên liệu không tồn tại!");
                if ((ngl.stock ?? 0) < item.quantity * quantity) {
                    throw new Error(`Nguyên liệu "${ngl.name}" không đủ tồn kho!`);
                }
            }
            // Trừ kho nguyên liệu
            for (const item of recipe.recipe) {
                const ngl:any = await getIngredientById(item.ingredientId);
                await updateIngredient(item.ingredientId, { stock: ngl.stock - item.quantity * quantity });
            }
            // Cộng kho thành phẩm
            const tp:any = await getIngredientById(recipe.outputId);
            await updateIngredient(recipe.outputId, { stock: (tp.stock ?? 0) + quantity });
            message.success("Chế biến thành phẩm thành công!");
            setProcessModal({ open: false, recipe: null });
        } catch (err: any) {
            message.error(err.message);
        }
    };

    // Hiển thị tên thành phẩm theo id
    const getOutputName = (outputId: string) => {
        const found = outputs.find((o) => o.id === outputId);
        return found ? found.name : "";
    };
    // Hiển thị tên nguyên liệu theo id
    const getInputName = (ingredientId: string) => {
        const found = inputs.find((i) => i.id === ingredientId);
        return found ? `${found.name} (${found.unit})` : "";
    };

    return (
        <div className="p-4 bg-white min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Quản lý công thức chế biến</h2>
                <Button type="primary" onClick={() => setModal({ open: true, item: null })}>
                    Thêm công thức mới
                </Button>
            </div>
            <Table
                dataSource={recipes}
                rowKey="id"
                loading={loading}
                columns={[
                    {
                        title: "Thành phẩm",
                        dataIndex: "outputId",
                        key: "outputId",
                        render: (outputId: string) => (
                            <span className="font-semibold">{getOutputName(outputId)}</span>
                        ),
                    },
                    {
                        title: "Nguyên liệu thô",
                        dataIndex: "recipe",
                        key: "recipe",
                        render: (recipe: any[]) =>
                            recipe.map((item) => getInputName(item.ingredientId) + `: ${item.quantity}`).join(", "),
                    },
                    {
                        title: "Thao tác",
                        key: "actions",
                        render: (_, record) => (
                            <Space>
                                <Button type="link" onClick={() => setModal({ open: true, item: record })}>
                                    Sửa
                                </Button>
                                <Button type="link" danger onClick={() => handleDelete(record.id)}>
                                    Xóa
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => setProcessModal({ open: true, recipe: record })}
                                >
                                    Chế biến
                                </Button>
                            </Space>
                        ),
                    },
                ]}
            />
            <Modal
                open={modal.open}
                title={modal.item ? "Cập nhật công thức" : "Thêm công thức mới"}
                onCancel={() => setModal({ open: false, item: null })}
                footer={null}
                destroyOnClose
            >
                <RecipeForm
                    initialValues={modal.item}
                    onSubmit={modal.item ? handleEdit : handleCreate}
                    loading={formLoading}
                    inputs={inputs}
                    outputs={outputs}
                />
            </Modal>
            {/* Modal chế biến */}
            <Modal
                open={processModal.open}
                title={`Chế biến: ${getOutputName(processModal.recipe?.outputId || "")}`}
                onCancel={() => setProcessModal({ open: false, recipe: null })}
                footer={null}
                destroyOnClose
            >
                <ProcessForm
                    recipe={processModal.recipe}
                    onProcess={handleProcess}
                />
            </Modal>
        </div>
    );
};

interface RecipeFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
    inputs: any[];
    outputs: any[];
}

const RecipeForm: React.FC<RecipeFormProps> = ({ initialValues, onSubmit, loading, inputs, outputs }) => {
    return (
        <Form
            layout="vertical"
            initialValues={initialValues || { outputId: "", recipe: [{ ingredientId: "", quantity: 0 }] }}
            onFinish={onSubmit}
        >
            <Form.Item
                label="Thành phẩm"
                name="outputId"
                rules={[{ required: true, message: "Chọn thành phẩm" }]}
            >
                <Select placeholder="Chọn thành phẩm">
                    {outputs.map((o) => (
                        <Option key={o.id} value={o.id}>
                            {o.name} ({o.unit})
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.List name="recipe">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} align="baseline" className="mb-2 flex">
                                <Form.Item
                                    {...restField}
                                    name={[name, "ingredientId"]}
                                    rules={[{ required: true, message: "Chọn nguyên liệu" }]}
                                >
                                    <Select placeholder="Chọn nguyên liệu" style={{ width: 180 }}>
                                        {inputs.map((i) => (
                                            <Option key={i.id} value={i.id}>
                                                {i.name} ({i.unit})
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, "quantity"]}
                                    rules={[{ required: true, message: "Nhập số lượng" }]}
                                >
                                    <InputNumber min={1} placeholder="Số lượng" style={{ width: 100 }} />
                                </Form.Item>
                                {fields.length > 1 && (
                                    <Tooltip title="Xóa nguyên liệu">
                                        <Button 
                                            type="text" 
                                            danger 
                                            icon={<DeleteOutlined />} 
                                            onClick={() => remove(name)}
                                        />
                                    </Tooltip>
                                )}
                            </Space>
                        ))}
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Thêm nguyên liệu
                        </Button>
                    </>
                )}
            </Form.List>
            <Form.Item>
                <Button 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    loading={loading}
                    icon={initialValues ? <EditOutlined /> : <PlusOutlined />}
                >
                    {initialValues ? "Cập nhật" : "Tạo mới"}
                </Button>
            </Form.Item>
        </Form>
    );
};

const ProcessForm: React.FC<{ recipe: any; onProcess: (recipe: any, quantity: number) => void }> = ({
                                                                                                        recipe,
                                                                                                        onProcess,
                                                                                                    }) => {
    const [quantity, setQuantity] = useState<number>(1);

    return (
        <Form
            layout="vertical"
            onFinish={() => onProcess(recipe, quantity)}
            initialValues={{ quantity: 1 }}
        >
            <Form.Item
                label="Số lượng thành phẩm cần chế biến"
                name="quantity"
                rules={[{ required: true, message: "Nhập số lượng" }]}
            >
                {/*// @ts-ignore*/}
                <InputNumber min={1} value={quantity} onChange={setQuantity} className="w-full" />
            </Form.Item>
            <Form.Item>
                <Button 
                    type="primary" 
                    htmlType="submit" 
                    block
                    icon={<BuildOutlined />}
                >
                    Chế biến
                </Button>
            </Form.Item>
        </Form>
    );
};

export default RecipeList;
