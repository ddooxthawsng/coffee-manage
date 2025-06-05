import React from "react";
import { Button } from "antd";

interface Props {
    menu: any[];
    addToCart: (item: any, size: any) => void;
}
const MenuGrid: React.FC<Props> = ({ menu, addToCart }) => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 w-full max-w-4xl mx-auto">
        {menu.map((item) => (
            <div
                key={item.id}
                className="bg-white rounded-xl shadow-md border border-blue-100 flex flex-col items-center px-2 py-3 sm:px-5 sm:py-6 min-h-[110px] transition hover:shadow-lg"
            >
                <div className="font-semibold text-base sm:text-lg text-gray-900 mb-2 text-center min-h-[28px]">{item.name}</div>
                <div className="flex flex-col gap-2 w-full">
                    {item.sizes.map((size: any) => (
                        <Button
                            key={size.size}
                            className="!border-2 !border-blue-500 !text-blue-600 !font-semibold !rounded-md !bg-white hover:!bg-blue-500 hover:!text-white transition w-full py-1 text-sm sm:text-base"
                            onClick={() => addToCart(item, size)}
                        >
                            {size.size}: {size.price?.toLocaleString()}đ
                        </Button>
                    ))}
                </div>
            </div>
        ))}
    </div>
);
export default MenuGrid;
