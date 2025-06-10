import React from "react";
import { Table, Tag, Divider } from "antd";

const RecipeDetail = ({ recipe }) => {
    if (!recipe) return null;

    const sizes = recipe.sizes || [];

    // Tạo danh sách ingredient unique dựa trên tên và đơn vị
    const allIngredients = [];
    const seenIngredients = new Set();

    sizes.forEach(sz => {
        (sz.ingredients || []).forEach(ing => {
            if (ing.name) {
                // Tạo key unique dựa trên tên và đơn vị
                const uniqueKey = `${ing.name}_${ing.unit || 'no-unit'}`;
                if (!seenIngredients.has(uniqueKey)) {
                    seenIngredients.add(uniqueKey);
                    allIngredients.push({
                        name: ing.name,
                        unit: ing.unit || '',
                        displayName: ing.unit ? `${ing.name} (${ing.unit})` : ing.name
                    });
                }
            }
        });
    });

    const columns = [
        {
            title: "Thành phần",
            dataIndex: "displayName",
            key: "displayName",
            width: 200,
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
        },
        ...sizes.map(sz => ({
            title: sz.size,
            dataIndex: sz.size,
            key: sz.size,
            align: 'center',
            render: (value) => value || <span style={{ color: '#ccc' }}>-</span>
        }))
    ];

    const dataSource = allIngredients.map((ingredient, index) => {
        const row = {
            key: `${ingredient.name}_${ingredient.unit}_${index}`, // Key unique
            displayName: ingredient.displayName
        };

        sizes.forEach(sz => {
            // Tìm ingredient khớp cả tên và đơn vị
            const found = (sz.ingredients || []).find(ing =>
                ing.name === ingredient.name &&
                (ing.unit || '') === ingredient.unit
            );
            row[sz.size] = found ? `${found.amount || ''}`.trim() : "";
        });

        return row;
    });

    // Mapping cho màu sắc tag
    const getTagColor = (type) => {
        const colorMap = {
            "cafe": "volcano",
            "tra": "green",
            "kem": "orange",
            "matcha": "lime",
            "banhmy": "gold",
            "khac": "blue"
        };
        return colorMap[type] || "default";
    };

    const getTypeLabel = (type) => {
        const labelMap = {
            "cafe": "Cà phê",
            "tra": "Trà",
            "kem": "Kem",
            "matcha": "Matcha",
            "banhmy": "Bánh Mỳ",
            "khac": "Khác"
        };
        return labelMap[type] || type;
    };

    return (
        <div className="p-4 bg-white rounded-lg">
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    {recipe.name}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                    <Tag color={getTagColor(recipe.type)}>
                        {getTypeLabel(recipe.type)}
                    </Tag>
                    {recipe.group && (
                        <Tag color="blue">
                            {recipe.group === "cong-thuc-pha-che" ? "Công thức pha chế" : "Chuẩn bị nguyên liệu"}
                        </Tag>
                    )}
                </div>
            </div>

            {/* Bảng thành phần */}
            {dataSource.length > 0 ? (
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    bordered
                    size="small"
                    className="mb-4"
                    scroll={{ x: true }}
                />
            ) : (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded border mb-4">
                    Chưa có thành phần nào được khai báo
                </div>
            )}

            {/* Các bước thực hiện */}
            <Divider orientation="left" className="text-gray-700 font-medium">
                Các bước thực hiện
            </Divider>
            {recipe.steps && recipe.steps.length > 0 ? (
                <ol className="ml-4 space-y-2">
                    {recipe.steps.map((step, idx) => (
                        <li key={idx} className="text-gray-700 leading-relaxed">
                            {step}
                        </li>
                    ))}
                </ol>
            ) : (
                <div className="text-gray-500 italic">
                    Chưa có bước thực hiện nào được khai báo
                </div>
            )}

            {/* Ghi chú */}
            {recipe.note && (
                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <div className="font-medium text-blue-800 mb-1">📝 Ghi chú:</div>
                    <div className="text-blue-700">{recipe.note}</div>
                </div>
            )}

            {/* Cách bảo quản */}
            {recipe.preservation && (
                <div className="mt-4">
                    <Divider orientation="left" className="text-gray-700 font-medium">
                        Cách bảo quản
                    </Divider>
                    <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                        <div className="text-green-700">{recipe.preservation}</div>
                    </div>
                </div>
            )}

            {/* Yêu cầu */}
            {recipe.requirement && (
                <div className="mt-4">
                    <Divider orientation="left" className="text-gray-700 font-medium">
                        Yêu cầu
                    </Divider>
                    <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                        <div className="text-orange-700">{recipe.requirement}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeDetail;
