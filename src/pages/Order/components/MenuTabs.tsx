import React from "react";
import { Button } from "antd";

interface Props {
    categories: string[];
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
}
const MenuTabs: React.FC<Props> = ({ categories, activeCategory, setActiveCategory }) => (
    <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 18,
        marginTop: 12,
        marginBottom: 8,
        flexWrap: "wrap"
    }}>
        {categories.map((cat) => (
            <Button
                key={cat}
                type={activeCategory === cat ? "primary" : "default"}
                style={{
                    minWidth: 100,
                    borderRadius: 20,
                    fontWeight: 600,
                    fontSize: 16,
                    background: activeCategory === cat ? "#1890ff" : "#fff",
                    color: activeCategory === cat ? "#fff" : "#1890ff",
                    border: "2px solid #1890ff",
                    boxShadow: activeCategory === cat ? "0 2px 8px #1890ff22" : "none",
                }}
                onClick={() => setActiveCategory(cat)}
            >
                {cat}
            </Button>
        ))}
    </div>
);
export default MenuTabs;
