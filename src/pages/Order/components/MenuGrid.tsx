import React, { useState, useEffect } from "react";
import { Button, Select, Tooltip, Input } from "antd";
import { AppstoreOutlined, BarsOutlined, SettingOutlined, SortAscendingOutlined, SortDescendingOutlined, SearchOutlined, ClearOutlined } from "@ant-design/icons";

interface Props {
    menu: any[];
    addToCart: (item: any, size: any) => void;
}

interface ViewConfig {
    viewType: 'grid' | 'list';
    gridCols: number;
    sortOrder: 'asc' | 'desc' | 'none';
}

const MenuGrid: React.FC<Props> = ({ menu, addToCart }) => {
    const [viewConfig, setViewConfig] = useState<ViewConfig>(() => {
        const saved = localStorage.getItem('menuViewConfig');
        return saved ? JSON.parse(saved) : { viewType: 'grid', gridCols: 4, sortOrder: 'asc' };
    });

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        localStorage.setItem('menuViewConfig', JSON.stringify(viewConfig));
    }, [viewConfig]);

    // Hàm chuyển đổi tiếng Việt có dấu thành không dấu
    const removeVietnameseTones = (str: string) => {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    };

    const handleViewTypeChange = (newViewType: 'grid' | 'list') => {
        setViewConfig(prev => ({ ...prev, viewType: newViewType }));
    };

    const handleGridColsChange = (newCols: number) => {
        setViewConfig(prev => ({ ...prev, gridCols: newCols }));
    };

    const handleSortOrderChange = () => {
        const nextOrder = viewConfig.sortOrder === 'asc' ? 'desc' :
            viewConfig.sortOrder === 'desc' ? 'none' : 'asc';
        setViewConfig(prev => ({ ...prev, sortOrder: nextOrder }));
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    // Tìm kiếm gần đúng và không dấu
    const getFilteredMenu = () => {
        if (!searchTerm.trim()) {
            return menu;
        }

        const searchNormalized = removeVietnameseTones(searchTerm.trim());

        return menu.filter(item => {
            const itemNameNormalized = removeVietnameseTones(item.name);
            const categoryNormalized = removeVietnameseTones(item.category || '');

            // Tìm kiếm gần đúng: chứa từ khóa hoặc từ khóa chứa trong tên
            const nameMatch = itemNameNormalized.includes(searchNormalized) ||
                searchNormalized.includes(itemNameNormalized);
            const categoryMatch = categoryNormalized.includes(searchNormalized);
            const sizeMatch = item.sizes?.some((size: any) =>
                removeVietnameseTones(size.size).includes(searchNormalized)
            );

            return nameMatch || categoryMatch || sizeMatch;
        });
    };

    const getSortedMenu = () => {
        const filteredMenu = getFilteredMenu();

        if (viewConfig.sortOrder === 'none') {
            return filteredMenu;
        }

        return [...filteredMenu].sort((a, b) => {
            const nameA = removeVietnameseTones(a.name);
            const nameB = removeVietnameseTones(b.name);

            if (viewConfig.sortOrder === 'asc') {
                return nameA.localeCompare(nameB, 'vi', { numeric: true });
            } else {
                return nameB.localeCompare(nameA, 'vi', { numeric: true });
            }
        });
    };

    const getGridClass = () => {
        const colsMap = {
            2: 'grid-cols-2',
            3: 'grid-cols-2 sm:grid-cols-3',
            4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
            5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
            6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
        };
        return colsMap[viewConfig.gridCols as keyof typeof colsMap] || colsMap[4];
    };

    const sortedMenu = getSortedMenu();

    return (
        <div className="w-full px-3 sm:px-4 md:px-6">
            {/* Header điều khiển - TẤT CẢ TRÊN 1 DÒNG */}
            <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    {/* Search bar - Flexible width */}
                    <div className="flex-1 min-w-0">
                        <Input
                            placeholder="Tìm kiếm (hỗ trợ không dấu): ca phe, cafe, cà phê..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            suffix={
                                searchTerm ? (
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<ClearOutlined />}
                                        onClick={handleClearSearch}
                                        className="!p-0 !border-0 !shadow-none"
                                    />
                                ) : null
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="middle"
                            className="rounded-lg"
                            allowClear
                        />
                    </div>

                    {/* Controls - Fixed width */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* View Type Toggle */}
                        <div className="flex rounded-md border border-gray-200 overflow-hidden">
                            <Tooltip title="Lưới">
                                <Button
                                    size="small"
                                    type={viewConfig.viewType === 'grid' ? 'primary' : 'default'}
                                    icon={<AppstoreOutlined />}
                                    onClick={() => handleViewTypeChange('grid')}
                                    className="!rounded-none !border-0"
                                />
                            </Tooltip>
                            <Tooltip title="Danh sách">
                                <Button
                                    size="small"
                                    type={viewConfig.viewType === 'list' ? 'primary' : 'default'}
                                    icon={<BarsOutlined />}
                                    onClick={() => handleViewTypeChange('list')}
                                    className="!rounded-none !border-0 !border-l"
                                />
                            </Tooltip>
                        </div>

                        {/* Sort Button */}
                        <Tooltip title={
                            viewConfig.sortOrder === 'asc' ? 'A-Z' :
                                viewConfig.sortOrder === 'desc' ? 'Z-A' : 'Gốc'
                        }>
                            <Button
                                size="small"
                                type={viewConfig.sortOrder !== 'none' ? 'primary' : 'default'}
                                icon={viewConfig.sortOrder === 'desc' ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
                                onClick={handleSortOrderChange}
                            />
                        </Tooltip>

                        {/* Grid Columns - chỉ hiện khi grid */}
                        {viewConfig.viewType === 'grid' && (
                            <>
                                <div className="w-px h-6 bg-gray-200" />
                                <SettingOutlined className="text-gray-400 text-sm" />
                                <Select
                                    size="small"
                                    value={viewConfig.gridCols}
                                    onChange={handleGridColsChange}
                                    className="w-16"
                                    options={[
                                        { label: '2', value: 2 },
                                        { label: '3', value: 3 },
                                        { label: '4', value: 4 },
                                        { label: '5', value: 5 },
                                        { label: '6', value: 6 }
                                    ]}
                                />
                            </>
                        )}

                        {/* Kết quả tìm kiếm */}
                        {searchTerm && (
                            <>
                                <div className="w-px h-6 bg-gray-200" />
                                <span className="text-sm text-gray-500 whitespace-nowrap">
                                    <span className="font-medium text-blue-600">{sortedMenu.length}</span> món
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu Content */}
            {sortedMenu.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                    <SearchOutlined className="text-6xl text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Không tìm thấy món ăn nào
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Thử từ khóa khác hoặc tìm không dấu: "ca phe" thay vì "cà phê"
                    </p>
                    <Button onClick={handleClearSearch} type="primary">
                        Xóa tìm kiếm
                    </Button>
                </div>
            ) : viewConfig.viewType === 'grid' ? (
                <div className={`grid ${getGridClass()} gap-2 sm:gap-3 md:gap-4 max-w-7xl mx-auto`}>
                    {sortedMenu.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col p-2 sm:p-3 md:p-4 min-h-[120px] sm:min-h-[140px] transition-all duration-200 hover:border-blue-200"
                        >
                            <div className="font-medium sm:font-semibold text-xs sm:text-sm md:text-base text-gray-800 mb-2 text-center leading-tight line-clamp-2 flex-shrink-0">
                                {searchTerm ? (
                                    <span dangerouslySetInnerHTML={{
                                        __html: item.name.replace(
                                            new RegExp(`(${searchTerm})`, 'gi'),
                                            '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                                        )
                                    }} />
                                ) : (
                                    item.name
                                )}
                            </div>

                            <div className="flex flex-col gap-1 sm:gap-1.5 w-full flex-1 justify-end">
                                {item.sizes.map((size: any) => (
                                    <Button
                                        key={size.size}
                                        size="small"
                                        className="!border !border-blue-400 !text-blue-600 !font-medium !rounded !bg-white hover:!bg-blue-50 active:!bg-blue-100 transition-colors !h-auto !py-1 !px-2 !text-xs sm:!text-sm !leading-tight w-full"
                                        onClick={() => addToCart(item, size)}
                                    >
                                        <span className="block truncate">
                                            <span className="font-semibold">{size.size}</span>
                                            <span className="text-orange-600 ml-1">
                                                {size.price?.toLocaleString()}đ
                                            </span>
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2 max-w-4xl mx-auto">
                    {sortedMenu.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-100 p-3 sm:p-4 transition-all duration-200 hover:border-blue-200"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 mr-4">
                                    <h3 className="font-medium sm:font-semibold text-sm sm:text-base text-gray-800 mb-1">
                                        {searchTerm ? (
                                            <span dangerouslySetInnerHTML={{
                                                __html: item.name.replace(
                                                    new RegExp(`(${searchTerm})`, 'gi'),
                                                    '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                                                )
                                            }} />
                                        ) : (
                                            item.name
                                        )}
                                    </h3>
                                </div>

                                <div className="flex flex-wrap gap-2 justify-end">
                                    {item.sizes.map((size: any) => (
                                        <Button
                                            key={size.size}
                                            size="small"
                                            className="!border !border-blue-400 !text-blue-600 !font-medium !rounded !bg-white hover:!bg-blue-50 active:!bg-blue-100 transition-colors !h-auto !py-1 !px-3 !text-xs sm:!text-sm"
                                            onClick={() => addToCart(item, size)}
                                        >
                                            <span className="whitespace-nowrap">
                                                <span className="font-semibold">{size.size}</span>
                                                <span className="text-orange-600 ml-1">
                                                    {size.price?.toLocaleString()}đ
                                                </span>
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MenuGrid;
