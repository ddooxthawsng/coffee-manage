import React, {useEffect, useState} from 'react';
import {Col, DatePicker, notification, Radio, Row, Space, Tooltip, Typography} from 'antd';
import {
    CalendarOutlined,
    DashboardOutlined,
    FieldTimeOutlined,
    GlobalOutlined,
    RocketOutlined,
    ScheduleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './css/SmartDashboard.css';
import DashboardStats from './DashboardStats';
// @ts-ignore
import {fetchDashboardData} from './dashboardUtils.jsx';

const {Title} = Typography;
const {RangePicker} = DatePicker;

const SmartDashboard: React.FC = () => {
    const [dateRange, setDateRange] = useState<any>([dayjs().subtract(7, 'days'), dayjs()]);
    const [timePeriod, setTimePeriod] = useState('week');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePeriodChange = (period: string) => {
        setTimePeriod(period);
        switch (period) {
            case 'day':
                setDateRange([dayjs(), dayjs()]);
                break;
            case 'week':
                setDateRange([dayjs().subtract(7, 'day'), dayjs()]);
                break;
            case 'month':
                setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
                break;
            case 'quarter':
                setDateRange([dayjs().subtract(90, 'day'), dayjs()]);
                break;
            case 'year':
                setDateRange([dayjs().subtract(365, 'day'), dayjs()]);
                break;
            default:
                setDateRange([dayjs().subtract(7, 'day'), dayjs()]);
        }
    };

    useEffect(() => {
        fetchDashboardData(dateRange, setDashboardData, setLoading, notification);
    }, [dateRange]);

    return (
        <div className="p-4">
            <Row justify="space-between" align="middle" style={{marginBottom: 24}}>
                <Col>
                    <Title level={2} className="flex items-center">
                        <DashboardOutlined style={{color: '#1890ff', marginRight: 8, fontSize: 28}}/>
                        <span>Dashboard</span>
                        <RocketOutlined style={{color: '#fa8c16', marginLeft: 12, fontSize: 22}}/>
                    </Title>
                </Col>
                <Col>
                    <Space size="large">
                        <Radio.Group
                            value={timePeriod}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            optionType="button"
                            buttonStyle="solid"
                            className="period-selector"
                        >
                            <Tooltip title="Ngày hôm nay">
                                <Radio.Button value="day"><CalendarOutlined/> Ngày</Radio.Button>
                            </Tooltip>
                            <Tooltip title="7 ngày qua">
                                <Radio.Button value="week"><FieldTimeOutlined/> Tuần</Radio.Button>
                            </Tooltip>
                            <Tooltip title="30 ngày qua">
                                <Radio.Button value="month"><CalendarOutlined/> Tháng</Radio.Button>
                            </Tooltip>
                            <Tooltip title="90 ngày qua">
                                <Radio.Button value="quarter"><ScheduleOutlined/> Quý</Radio.Button>
                            </Tooltip>
                            <Tooltip title="365 ngày qua">
                                <Radio.Button value="year"><GlobalOutlined/> Năm</Radio.Button>
                            </Tooltip>
                        </Radio.Group>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates: any) => dates && setDateRange(dates)}
                        />
                    </Space>
                </Col>
            </Row>
            <DashboardStats loading={loading} dashboardData={dashboardData}/>
        </div>
    );
};

export default SmartDashboard;
