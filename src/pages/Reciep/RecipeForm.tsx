import React, { useState } from "react";
import { Form, Input, Button, Card, Select, Divider, Row, Col } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const sizeOptions = ["Medium (M)", "Large (L)", "Small (S)"];
const unitOptions = ["ml", "g", "kg", "quả", "lát", "cái", "muỗng", "viên", "lít", "thìa", "hộp"];

const RecipeForm = ({
                        initialValues,
                        onSubmit,
                        loading,
                        ingredientList = []
                    }) => {
    const safeInitial = typeof initialValues === "object" && initialValues !== null ? initialValues : {};

    const [sizes, setSizes] = useState(
        Array.isArray(safeInitial.sizes) && safeInitial.sizes.length > 0
            ? safeInitial.sizes
            : [{ size: "Medium (M)", ingredients: [{ name: "", amount: "", unit: "" }] }]
    );
    const [steps, setSteps] = useState(
        Array.isArray(safeInitial.steps) && safeInitial.steps.length > 0
            ? safeInitial.steps
            : [""]
    );
    const [note, setNote] = useState(typeof safeInitial.note === "string" ? safeInitial.note : "");
    const [preservation, setPreservation] = useState(
        typeof safeInitial.preservation === "string" ? safeInitial.preservation : ""
    );
    const [requirement, setRequirement] = useState(
        typeof safeInitial.requirement === "string" ? safeInitial.requirement : ""
    );

    // Thêm/xóa size
    const addSize = () =>
        setSizes([...sizes, { size: "", ingredients: [{ name: "", amount: "", unit: "" }] }]);
    const removeSize = (idx) => setSizes(sizes.filter((_, i) => i !== idx));

    // Thêm/xóa thành phần trong size
    const addIngredient = (sizeIdx) => {
        const newSizes = [...sizes];
        newSizes[sizeIdx].ingredients.push({ name: "", amount: "", unit: "" });
        setSizes(newSizes);
    };
    const removeIngredient = (sizeIdx, ingIdx) => {
        const newSizes = [...sizes];
        newSizes[sizeIdx].ingredients.splice(ingIdx, 1);
        setSizes(newSizes);
    };
    const updateIngredient = (sizeIdx, ingIdx, key, value) => {
        const newSizes = [...sizes];
        newSizes[sizeIdx].ingredients[ingIdx][key] = value;
        setSizes(newSizes);
    };

    // Thêm/xóa/cập nhật bước
    const addStep = () => setSteps([...steps, ""]);
    const removeStep = (idx) => setSteps(steps.filter((_, i) => i !== idx));
    const updateStep = (idx, value) => {
        const newArr = [...steps];
        newArr[idx] = value;
        setSteps(newArr);
    };

    const handleFinish = (values) => {
        onSubmit({
            ...values,
            sizes,
            steps,
            note: note || "",
            preservation: preservation || "",
            requirement: requirement || "",
        });
    };

    return (
        <Form layout="vertical" onFinish={handleFinish} initialValues={safeInitial} style={{ maxWidth: 700, margin: "0 auto" }}>
            {/* Nhóm + Loại đồ uống trên 1 dòng */}
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label="Nhóm"
                        name="group"
                        rules={[{ required: true, message: "Chọn nhóm công thức" }]}
                        initialValue={typeof safeInitial.group === "string" ? safeInitial.group : ""}
                        style={{ marginBottom: 12 }}
                    >
                        <Select placeholder="Chọn nhóm công thức" size="large">
                            <Select.Option value="cong-thuc-pha-che">Công thức pha chế</Select.Option>
                            <Select.Option value="chuan-bi-nguyen-lieu">Chuẩn bị nguyên liệu</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Loại đồ uống"
                        name="type"
                        rules={[{ required: true, message: "Chọn loại đồ uống" }]}
                        initialValue={typeof safeInitial.type === "string" ? safeInitial.type : ""}
                        style={{ marginBottom: 12 }}
                    >
                        <Select placeholder="Chọn loại đồ uống" size="large">
                            <Select.Option value="cafe">Cà phê</Select.Option>
                            <Select.Option value="tra">Trà</Select.Option>
                            <Select.Option value="kem">Kem</Select.Option>
                            <Select.Option value="matcha">Matcha</Select.Option>
                            <Select.Option value="banhmy">Bánh Mỳ</Select.Option>
                            <Select.Option value="khac">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item
                label="Tên công thức"
                name="name"
                rules={[{ required: true, message: "Nhập tên công thức" }]}
                style={{ marginBottom: 14 }}
            >
                <Input size="large" />
            </Form.Item>
            <Divider orientation="left">Thành phần theo size</Divider>
            {sizes.map((sz, sizeIdx) => (
                <Card
                    key={sizeIdx}
                    size="small"
                    style={{ marginBottom: 18, borderRadius: 12, padding: 16, background: "#fafdff" }}
                    title={
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Select
                                value={sz.size}
                                style={{ width: 160, fontSize: 16 }}
                                size="large"
                                placeholder="Chọn size"
                                onChange={v => {
                                    const arr = [...sizes];
                                    arr[sizeIdx].size = v;
                                    setSizes(arr);
                                }}
                            >
                                {sizeOptions.map(s => <Select.Option key={s}>{s}</Select.Option>)}
                            </Select>
                            {sizes.length > 1 && (
                                <Button
                                    icon={<DeleteOutlined />}
                                    type="text"
                                    danger
                                    style={{ fontSize: 20, minWidth: 36, height: 44 }}
                                    onClick={() => removeSize(sizeIdx)}
                                />
                            )}
                        </div>
                    }
                >
                    {sz.ingredients.map((ing, ingIdx) => (
                        <div
                            key={ingIdx}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 14,
                                gap: 14,
                                width: "100%"
                            }}
                        >
                            <Select
                                mode="tags"
                                showSearch
                                placeholder="Chọn hoặc nhập thành phần"
                                style={{ width: 240, fontSize: 16 }}
                                size="large"
                                value={ing.name}
                                onChange={value => updateIngredient(sizeIdx, ingIdx, "name", value)}
                                filterOption={(input, option) =>
                                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                allowClear
                            >
                                {ingredientList.map(ingOpt => (
                                    <Select.Option key={ingOpt.id || ingOpt.name} value={ingOpt.name}>
                                        {ingOpt.name}
                                    </Select.Option>
                                ))}
                            </Select>

                            <Input
                                placeholder="Số lượng"
                                style={{ width: 100, fontSize: 16 }}
                                size="large"
                                value={ing.amount}
                                onChange={e => updateIngredient(sizeIdx, ingIdx, "amount", e.target.value)}
                            />

                            <Select
                                placeholder="Đơn vị"
                                style={{ width: 120, fontSize: 16 }}
                                size="large"
                                value={ing.unit}
                                onChange={value => updateIngredient(sizeIdx, ingIdx, "unit", value)}
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {unitOptions.map(unit => (
                                    <Select.Option key={unit} value={unit}>{unit}</Select.Option>
                                ))}
                            </Select>

                            {sz.ingredients.length > 1 && (
                                <Button
                                    icon={<DeleteOutlined />}
                                    type="text"
                                    danger
                                    style={{ marginLeft: 6, fontSize: 20, minWidth: 36, height: 44 }}
                                    onClick={() => removeIngredient(sizeIdx, ingIdx)}
                                />
                            )}
                        </div>
                    ))}
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => addIngredient(sizeIdx)}
                        style={{ width: 180, height: 44, fontSize: 16, marginTop: 4 }}
                    >
                        Thêm thành phần
                    </Button>
                </Card>
            ))}
            <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addSize}
                style={{ marginBottom: 16, width: 180, height: 44, fontSize: 16 }}
            >
                Thêm size
            </Button>
            <Divider orientation="left">Các bước thực hiện</Divider>
            {steps.map((s, idx) => (
                <div
                    key={idx}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 10,
                        gap: 10,
                        width: "100%"
                    }}
                >
                    <Input.TextArea
                        placeholder={`Bước ${idx + 1}`}
                        value={s}
                        autoSize={{ minRows: 1, maxRows: 3 }}
                        style={{ flex: 1, fontSize: 16, minHeight: 44, resize: "none" }}
                        onChange={e => updateStep(idx, e.target.value)}
                    />
                    {steps.length > 1 && (
                        <Button
                            icon={<DeleteOutlined />}
                            type="text"
                            danger
                            style={{ fontSize: 20, minWidth: 36, height: 44 }}
                            onClick={() => removeStep(idx)}
                        />
                    )}
                </div>
            ))}
            <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addStep}
                style={{ width: 180, height: 44, fontSize: 16 }}
            >
                Thêm bước
            </Button>
            <Form.Item label="Ghi chú">
                <Input.TextArea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    style={{ width: "100%", fontSize: 16 }}
                />
            </Form.Item>
            <Form.Item label="Cách bảo quản">
                <Input.TextArea
                    value={preservation}
                    onChange={(e) => setPreservation(e.target.value)}
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    style={{ width: "100%", fontSize: 16 }}
                />
            </Form.Item>
            <Form.Item label="Yêu cầu">
                <Input.TextArea
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    style={{ width: "100%", fontSize: 16 }}
                />
            </Form.Item>
            <Form.Item style={{ marginTop: 16 }}>
                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                    {safeInitial && safeInitial.name ? "Cập nhật" : "Tạo công thức"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default RecipeForm;
