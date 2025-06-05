/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1890ff",      // Xanh dương Ant Design
                success: "#52c41a",      // Xanh lá
                danger: "#cf1322",       // Đỏ cảnh báo
                warning: "#faad14",      // Vàng
                info: "#13c2c2",         // Xanh ngọc
                menu: "#fa8c16",         // Cam cho menu
                promotion: "#722ed1",    // Tím cho khuyến mãi
                invoice: "#2f54eb",      // Xanh đậm cho hóa đơn
                user: "#eb2f96",         // Hồng cho user
                // ...bạn có thể thêm màu khác nếu muốn
            },
        },
    },
    plugins: [],
};
