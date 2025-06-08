import React from "react";
import { Table, Tag, Divider } from "antd";

const RecipeDetail = ({ recipe }) => {
    if (!recipe) return null;
    const sizes = recipe.sizes || [];
    const allIngredients = Array.from(
        new Set(sizes.flatMap(sz => sz.ingredients.map(ing => ing.name)))
    );
    const columns = [
        { title: "Thành phần", dataIndex: "name", key: "name" },
        ...sizes.map(sz => ({
            title: sz.size,
            dataIndex: sz.size,
            key: sz.size,
            render: (value) => value || "-"
        }))
    ];
    const dataSource = allIngredients.map(name => {
        const row = { key: name, name };
        sizes.forEach(sz => {
            const found = sz.ingredients.find(ing => ing.name === name);
            row[sz.size] = found ? `${found.amount} ${found.unit || ""}` : "";
        });
        return row;
    });

    return (
        <div style={{ padding: 8 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{recipe.name}</h3>
            <div style={{ marginBottom: 8 }}>
                <Tag color={
                    recipe.type === "cafe" ? "brown"
                        : recipe.type === "tra" ? "green"
                            : "orange"
                }>
                    {recipe.type === "cafe" ? "Cà phê"
                        : recipe.type === "tra" ? "Trà"
                            : "Kem"}
                </Tag>
            </div>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                bordered
                size="small"
                style={{ marginBottom: 16 }}
            />
            <Divider orientation="left">Các bước thực hiện</Divider>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
                {(recipe.steps || []).map((s, idx) => <li key={idx}>{s}</li>)}
            </ul>
            {recipe.note && (
                <div style={{ marginTop: 12 }}>
                    <b>Ghi chú:</b> {recipe.note}
                </div>
            )}
            {recipe.preservation && (
                <div style={{ marginTop: 12 }}>
                    <Divider orientation="left">Cách bảo quản</Divider>
                    <div>{recipe.preservation}</div>
                </div>
            )}
            {recipe.requirement && (
                <div style={{ marginTop: 12 }}>
                    <Divider orientation="left">Yêu cầu</Divider>
                    <div>{recipe.requirement}</div>
                </div>
            )}
        </div>
    );
};

export default RecipeDetail;
