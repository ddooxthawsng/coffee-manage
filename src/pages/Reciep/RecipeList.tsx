import React, {useEffect, useState} from "react";
import {Button, message, Modal, Popconfirm, Space, Table, Tag} from "antd";
import RecipeForm from "./RecipeForm";
import {createRecipe, deleteRecipe, getRecipes, updateRecipe,} from "../../services/receiptService";
import {DeleteOutlined, EditOutlined, EyeOutlined,CopyOutlined} from "@ant-design/icons";
import {getIngredientsByType} from "../../services/ingredientService.ts";
import html2pdf from "html2pdf.js";

const RecipeDetail = ({recipe,onClone}) => {
    if (!recipe) return null;
    const sizes = recipe.sizes || [];
    const allIngredients = Array.from(
        new Set(sizes.flatMap(sz => sz.ingredients.map(ing => ing.name)))
    );
    const columns = [
        {title: "Thành phần", dataIndex: "name", key: "name"},
        ...sizes.map(sz => ({
            title: sz.size,
            dataIndex: sz.size,
            key: sz.size,
            render: (value) => value || "-"
        })),
    ];
    const dataSource = allIngredients.map(name => {
        const row = {key: name, name};
        sizes.forEach(sz => {
            const found = sz.ingredients.find(ing => ing.name === name);
            row[sz.size] = found ? `${found.amount} ${found.unit || ""}` : "-";
        });
        return row;
    });

    return (
        <div style={{padding: 8}}>
            <h3 style={{fontWeight: 600, marginBottom: 8}}>{recipe.name}</h3>
            <div style={{marginBottom: 8}}>
                <Tag color={
                    recipe.type === "cafe" ? "brown"
                        : recipe.type === "tra" ? "green"
                            : recipe.type === "kem" ? "orange"
                                : "default"
                }>
                    {recipe.type === "cafe" ? "Cà phê"
                        : recipe.type === "tra" ? "Trà"
                            : recipe.type === "kem" ? "Kem"
                                : ""}
                </Tag>
                <Tag color={
                    recipe.group === "cong-thuc-pha-che" ? "blue"
                        : recipe.group === "chuan-bi-nguyen-lieu" ? "purple"
                            : "default"
                }>
                    {recipe.group === "cong-thuc-pha-che" ? "Công thức pha chế"
                        : recipe.group === "chuan-bi-nguyen-lieu" ? "Chuẩn bị nguyên liệu"
                            : ""}
                </Tag>
            </div>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                bordered
                size="small"
                style={{marginBottom: 16}}
            />
            <div>
                <b>Các bước thực hiện:</b>
                <ul style={{margin: 0, paddingLeft: 18}}>
                    {(recipe.steps || []).map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
            </div>
            {recipe.note && (
                <div style={{marginTop: 12}}>
                    <b>Ghi chú:</b> {recipe.note}
                </div>
            )}
            {recipe.preservation && (
                <div style={{marginTop: 12}}>
                    <b>Cách bảo quản:</b> {recipe.preservation}
                </div>
            )}
            {recipe.requirement && (
                <div style={{marginTop: 12}}>
                    <b>Yêu cầu:</b> {recipe.requirement}
                </div>
            )}
        </div>
    );
};

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({open: false, recipe: null});
    const [formLoading, setFormLoading] = useState(false);
    const [detail, setDetail] = useState(null);
    const [filterGroup, setFilterGroup] = useState("all");

    const fetchRecipes = async () => {
        setLoading(true);
        setRecipes(await getRecipes());
        setLoading(false);
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    const handleCreate = async (values) => {
        setFormLoading(true);
        try {
            await createRecipe(values);
            message.success("Tạo công thức thành công!");
            setModal({open: false, recipe: null});
            fetchRecipes();
        } catch (err) {
            message.error(err.message || "Lỗi khi tạo công thức!");
        }
        setFormLoading(false);
    };

    const handleEdit = async (values) => {
        setFormLoading(true);
        try {
            await updateRecipe(modal.recipe.id, values);
            message.success("Cập nhật thành công!");
            setModal({open: false, recipe: null});
            fetchRecipes();
        } catch (err) {
            message.error(err.message || "Lỗi khi cập nhật!");
        }
        setFormLoading(false);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await deleteRecipe(id);
            message.success("Đã xóa công thức!");
            fetchRecipes();
        } catch (err) {
            message.error(err.message || "Lỗi khi xóa!");
        }
        setLoading(false);
    };

    const filteredRecipes = filterGroup === "all"
        ? recipes
        : recipes.filter(r => r.group === filterGroup);

    const exportRecipesToHTML = () => {
        const groupNames = {
            "cong-thuc-pha-che": "Công thức pha chế",
            "chuan-bi-nguyen-lieu": "Chuẩn bị nguyên liệu"
        };
        const typeNames = {
            cafe: "Cà phê",
            tra: "Trà",
            kem: "Kem"
        };
        const typeBg = {
            cafe: "#fff1f0",
            tra: "#f6ffed",
            kem: "#f9f0ff"
        };
        const typeColor = {
            cafe: "#cf1322",
            tra: "#389e0d",
            kem: "#722ed1"
        };
        const groupBg = {
            "cong-thuc-pha-che": "#e6f7ff",
            "chuan-bi-nguyen-lieu": "#f6ffed"
        };
        const groupColor = {
            "cong-thuc-pha-che": "#1765ad",
            "chuan-bi-nguyen-lieu": "#7cb305"
        };

        // Gom nhóm
        const grouped = {};
        filteredRecipes.forEach(recipe => {
            const group = recipe.group || "khac";
            const type = recipe.type || "khac";
            if (!grouped[group]) grouped[group] = {};
            if (!grouped[group][type]) grouped[group][type] = [];
            grouped[group][type].push(recipe);
        });

        let html = `
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>Danh sách công thức</title>
        <style>
            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                background: #f5f7fa;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 1100px;
                margin: 0 auto;
                padding: 36px 12px 36px 12px;
            }
            .group-block {
                margin-bottom: 48px;
                border-radius: 18px;
                padding: 28px 0 18px 0;
            }
            .group-title {
                font-size: 26px;
                font-weight: 700;
                margin: 0 0 8px 0;
                padding-left: 32px;
                text-align: left;
                letter-spacing: 0.5px;
            }
            .type-block {
                margin-bottom: 36px;
                border-radius: 14px;
                padding: 18px 0 10px 0;
            }
            .type-title {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 22px 0;
                padding-left: 56px;
                text-align: left;
                letter-spacing: 0.2px;
            }
            .recipe-card-wrapper {
                display: flex;
                justify-content: center;
                margin-bottom: 32px;
            }
            .recipe-card {
                background: #fff;
                border-radius: 14px;
                box-shadow: 0 4px 24px 0 #e6f7ff;
                padding: 32px 32px 22px 32px;
                max-width: 540px;
                min-width: 320px;
                width: 100%;
                border: 1.5px solid #e6f7ff;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            .recipe-title {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 14px;
                color: #222;
            }
            .tags {
                margin-bottom: 18px;
                display: flex;
                gap: 10px;
            }
            .tag {
                display: inline-block;
                border-radius: 4px;
                padding: 2px 16px;
                font-size: 13px;
                font-weight: 500;
                background: #fafafa;
                color: #888;
                border: 1px solid #eee;
            }
            .tag.type-cafe { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e;}
            .tag.type-tra { background: #f6ffed; color: #389e0d; border: 1px solid #b7eb8f;}
            .tag.type-kem { background: #f9f0ff; color: #722ed1; border: 1px solid #d3adf7;}
            .tag.group-cong-thuc-pha-che { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff;}
            .tag.group-chuan-bi-nguyen-lieu { background: #f6ffed; color: #7cb305; border: 1px solid #d3f261;}
            table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 18px;
                background: #fff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 4px #f0f5ff;
            }
            th, td {
                padding: 10px 14px;
                font-size: 15px;
                text-align: center;
            }
            th {
                background: #fafafa;
                color: #222;
                font-weight: 600;
                border-bottom: 1.5px solid #e6f7ff;
            }
            td {
                border-bottom: 1px solid #f0f5ff;
            }
            tr:last-child td {
                border-bottom: none;
            }
            .section-title {
                font-weight: bold;
                color: #222;
                margin-top: 12px;
                margin-bottom: 6px;
            }
            ul {
                margin: 0 0 0 20px;
                padding: 0;
            }
            .info {
                margin-top: 8px;
                margin-bottom: 2px;
                color: #444;
                font-size: 15px;
            }
            .info .label {
                font-weight: bold;
                color: #1765ad;
                margin-right: 4px;
            }
        </style>
    </head>
    <body>
        <div class="container">
    `;

        Object.keys(grouped).forEach(groupKey => {
            html += `<div class="group-block" style="background:${groupBg[groupKey] || '#e6f7ff'};">
            <div class="group-title" style="color:${groupColor[groupKey] || '#1765ad'}">${groupNames[groupKey] || groupKey}</div>
        `;

            Object.keys(grouped[groupKey]).forEach(typeKey => {
                html += `<div class="type-block" style="background:${typeBg[typeKey] || '#fff'};">
                <div class="type-title" style="color:${typeColor[typeKey] || '#cf1322'}">${typeNames[typeKey] || typeKey}</div>`;

                grouped[groupKey][typeKey].forEach(recipe => {
                    const sizes = recipe.sizes || [];
                    const allIngredients = Array.from(
                        new Set(sizes.flatMap(sz => sz.ingredients.map(ing => ing.name)))
                    );
                    html += `
                <div class="recipe-card-wrapper">
                <div class="recipe-card">
                    <div class="recipe-title">${recipe.name || "Không tên"}</div>
                    <div class="tags">
                        <span class="tag type-${typeKey}">${typeNames[typeKey] || typeKey}</span>
                        <span class="tag group-${groupKey}">${groupNames[groupKey] || groupKey}</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Thành phần</th>
                                ${sizes.map(sz => `<th>${sz.size}</th>`).join("")}
                            </tr>
                        </thead>
                        <tbody>
                            ${allIngredients.map(name => `
                                <tr>
                                    <td>${name}</td>
                                    ${sizes.map(sz => {
                        const found = sz.ingredients.find(ing => ing.name === name);
                        return `<td>${found ? `${found.amount} ${found.unit || ""}` : "-"}</td>`;
                    }).join("")}
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                    <div class="section-title">Các bước thực hiện:</div>
                    <ul>
                        ${(recipe.steps || []).map(s => `<li>${s}</li>`).join("")}
                    </ul>
                    ${recipe.note ? `<div class="info"><span class="label">Ghi chú:</span>${recipe.note}</div>` : ""}
                    ${recipe.preservation ? `<div class="info"><span class="label">Cách bảo quản:</span>${recipe.preservation}</div>` : ""}
                    ${recipe.requirement ? `<div class="info"><span class="label">Yêu cầu:</span>${recipe.requirement}</div>` : ""}
                </div>
                </div>
                `;
                });

                html += `</div>`;
            });

            html += `</div>`;
        });

        html += `
        </div>
    </body>
    </html>
    `;

        // Xuất file HTML
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "danh-sach-cong-thuc.html";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    };

    const exportRecipesToPDF = () => {
        // Chuẩn bị dữ liệu như trong exportRecipesToHTML
        const typeNames = {
            cafe: "Cà phê",
            tra: "Trà",
            kem: "Kem",
            matcha: "Matcha",
            banhmy: "Bánh Mỳ",
            khac: "Khác"
        };
        const groupNames = {
            "cong-thuc-pha-che": "Công thức pha chế",
            "chuan-bi-nguyen-lieu": "Chuẩn bị nguyên liệu",
            khac: "Khác"
        };

        // Mỗi công thức là 1 trang
        let html = `
    <style>
       .pdf-page {
        page-break-after: always;
        padding: 32px 24px 24px 24px;
        font-family: 'Segoe UI', Arial, sans-serif;
        background: #fff;
        min-height: 1000px;
        box-sizing: border-box;
    }

    .pdf-recipe-block {
        margin-bottom: 40px;
        border-bottom: 1px dashed #ddd;
        padding-bottom: 24px;
    }

    .pdf-recipe-title {
        font-size: 26px;
        font-weight: bold;
        margin-bottom: 10px;
    }
        .pdf-recipe-title {
            font-size: 26px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .pdf-tags {
            margin-bottom: 14px;
        }
        .pdf-tag {
            display: inline-block;
            border-radius: 4px;
            padding: 2px 14px;
            font-size: 13px;
            font-weight: 500;
            background: #fafafa;
            color: #888;
            border: 1px solid #eee;
            margin-right: 8px;
        }
        .pdf-table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 14px;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 4px #f0f5ff;
        }
        .pdf-table th, .pdf-table td {
            padding: 8px 12px;
            font-size: 15px;
            text-align: center;
            border: 1px solid #e6f7ff;
        }
        .pdf-section-title {
            font-weight: bold;
            color: #222;
            margin-top: 12px;
            margin-bottom: 6px;
        }
        ul {
            margin: 0 0 0 20px;
            padding: 0;
        }
        .pdf-info {
            margin-top: 8px;
            margin-bottom: 2px;
            color: #444;
            font-size: 15px;
        }
        .pdf-label {
            font-weight: bold;
            color: #1765ad;
            margin-right: 4px;
        }
    </style>
    `;

        for (let i = 0; i < filteredRecipes.length; i += 2) {
            html += `<div class="pdf-page">`;

            for (let j = i; j < i + 2 && j < filteredRecipes.length; j++) {
                const recipe = filteredRecipes[j];
                const sizes = recipe.sizes || [];
                const allIngredients = Array.from(
                    new Set(sizes.flatMap(sz => sz.ingredients.map(ing => ing.name)))
                );

                html += `
                <div class="pdf-recipe-block">
                    <div class="pdf-recipe-title">${recipe.name || "Không tên"}</div>
                    <table class="pdf-table">
                        <thead>
                            <tr>
                                <th>Thành phần</th>
                                ${sizes.map(sz => `<th>${sz.size}</th>`).join("")}
                            </tr>
                        </thead>
                        <tbody>
                            ${allIngredients.map(name => `
                                <tr>
                                    <td>${name}</td>
                                    ${sizes.map(sz => {
                    const found = sz.ingredients.find(ing => ing.name === name);
                    return `<td>${found ? `${found.amount} ${found.unit || ""}` : "-"}</td>`;
                }).join("")}
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                    <div class="pdf-section-title">Các bước thực hiện:</div>
                    <ul>
                        ${(recipe.steps || []).map(s => `<li>${s}</li>`).join("")}
                    </ul>
                    ${recipe.note ? `<div class="pdf-info"><span class="pdf-label">Ghi chú:</span>${recipe.note}</div>` : ""}
                    ${recipe.preservation ? `<div class="pdf-info"><span class="pdf-label">Cách bảo quản:</span>${recipe.preservation}</div>` : ""}
                    ${recipe.requirement ? `<div class="pdf-info"><span class="pdf-label">Yêu cầu:</span>${recipe.requirement}</div>` : ""}
                </div>
                `;
            }

            html += `</div>`;
        }

        // Tạo element ẩn để render
        const container = document.createElement("div");
        container.innerHTML = html;
        document.body.appendChild(container);

        // Export PDF
        html2pdf()
            .set({
                margin:       0,
                filename:     'danh-sach-cong-thuc.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' },
                pagebreak:    { mode: ['css', 'legacy'] }
            })
            .from(container)
            .save()
            .then(() => {
                document.body.removeChild(container);
            });
    };

    const handleCloneRecipe = (recipe) => {
        // Tạo bản sao, đổi tên, xóa id nếu có
        const newRecipe = {
            ...recipe,
            name: recipe.name + " - bản sao",
            id: undefined
        };
        // Mở form thêm mới với dữ liệu này
        setModal({ open: true, recipe: newRecipe });
    };


    const [ingredientList, setIngredientList] = useState([]);
    useEffect(() => {
        // fetchIngredients là hàm lấy nguyên liệu từ API
        getIngredientsByType("output").then((res)=>{
            setIngredientList(res)
        })
    }, []);
    return (
        <div className="p-4 bg-white min-h-screen">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h2 className="text-xl font-bold mb-2 sm:mb-0">Quản lý công thức</h2>
                <div>
                    <Button
                        type="primary"
                        onClick={() => setModal({open: true, recipe: null})}
                    >
                        Thêm công thức
                    </Button>
                    <Button
                        type="default"
                        onClick={exportRecipesToHTML}
                        style={{marginLeft: 8}}
                    >
                        Export HTML
                    </Button>
                    <Button
                        type="default"
                        onClick={exportRecipesToPDF}
                        style={{marginLeft: 8}}
                    >
                        Export PDF
                    </Button>
                </div>
            </div>

            <div style={{marginBottom: 16}}>
                <Button
                    type={filterGroup === "all" ? "primary" : "default"}
                    onClick={() => setFilterGroup("all")}
                    style={{marginRight: 8}}
                >
                    Tất cả
                </Button>
                <Button
                    type={filterGroup === "cong-thuc-pha-che" ? "primary" : "default"}
                    onClick={() => setFilterGroup("cong-thuc-pha-che")}
                    style={{marginRight: 8}}
                >
                    Công thức pha chế
                </Button>
                <Button
                    type={filterGroup === "chuan-bi-nguyen-lieu" ? "primary" : "default"}
                    onClick={() => setFilterGroup("chuan-bi-nguyen-lieu")}
                >
                    Chuẩn bị nguyên liệu
                </Button>
            </div>

            <Table
                dataSource={filteredRecipes}
                rowKey="id"
                loading={loading}
                scroll={{x: true}}
                columns={[
                    {
                        title: "",
                        key: "detail",
                        width: 40,
                        render: (_, record) => (
                            <Button
                                type="link"
                                icon={<EyeOutlined/>}
                                onClick={() => setDetail(record)}
                                style={{padding: 0}}
                            />
                        ),
                    },
                    {title: "Tên", dataIndex: "name"},
                    {
                        title: "Nhóm",
                        dataIndex: "group",
                        render: (group) =>
                            group === "cong-thuc-pha-che"
                                ? <Tag color="blue">Công thức pha chế</Tag>
                                : group === "chuan-bi-nguyen-lieu"
                                    ? <Tag color="purple">Chuẩn bị nguyên liệu</Tag>
                                    : <Tag>Khác</Tag>
                    },
                    {
                        title: "Loại đồ uống",
                        dataIndex: "type",
                        render: (type) =>
                            type === "cafe" ? <Tag color="brown">Cà phê</Tag>
                                : type === "tra" ? <Tag color="green">Trà</Tag>
                                    : type === "kem" ? <Tag color="orange">Kem</Tag>
                                        : <Tag>Khác</Tag>
                    },
                    {
                        title: "Số size",
                        dataIndex: "sizes",
                        render: (sizes) => sizes?.length || 0
                    },
                    {
                        title: "Thành phần (size đầu tiên)",
                        dataIndex: "sizes",
                        render: (sizes) =>
                            <ul style={{margin: 0, paddingLeft: 16}}>
                                {(sizes?.[0]?.ingredients || []).map((i, idx) =>
                                    <li key={idx}>{i.name} {i.amount} {i.unit}</li>
                                )}
                            </ul>
                    },
                    {
                        title: "Thao tác",
                        key: "actions",
                        render: (_, record) => (
                            <Space>
                                <Button
                                    type="link"
                                    icon={<EyeOutlined/>}
                                    onClick={() => setDetail(record)}
                                >
                                    Xem
                                </Button>
                                <Button
                                    type="link"
                                    icon={<EditOutlined/>}
                                    onClick={() => setModal({open: true, recipe: record})}
                                >
                                    Sửa
                                </Button>
                                <Button
                                    type="link"
                                    icon={<CopyOutlined />}
                                    onClick={() => {

                                        // Tạo một bản sao, đổi tên, xóa id nếu có
                                        const clone = {
                                            ...record,
                                            name: record.name + " - bản sao",
                                            id: undefined
                                        };
                                        console.log("recordrecord",clone)
                                        setModal({ open: true, recipe: clone });
                                    }}
                                >
                                    Nhân bản
                                </Button>
                                <Popconfirm
                                    title="Bạn chắc chắn muốn xóa?"
                                    onConfirm={() => handleDelete(record.id)}
                                >
                                    <Button type="link" icon={<DeleteOutlined/>} danger>
                                        Xóa
                                    </Button>
                                </Popconfirm>
                            </Space>
                        ),
                    },
                ]}
            />

            <Modal
                open={modal.open}
                title={modal.recipe?.id ? "Cập nhật công thức" : "Tạo công thức"}
                onCancel={() => setModal({open: false, recipe: null})}
                footer={null}
                destroyOnClose
                width={700}
            >
                <RecipeForm
                    initialValues={modal.recipe}
                    onSubmit={modal.recipe?.id ? handleEdit : handleCreate}
                    loading={formLoading}
                    ingredientList={ingredientList}
                />
            </Modal>
            <Modal
                open={!!detail}
                title="Chi tiết công thức"
                onCancel={() => setDetail(null)}
                footer={null}
            >
                <RecipeDetail recipe={detail} onClone={handleCloneRecipe}/>
            </Modal>
        </div>
    );
};

export default RecipeList;
