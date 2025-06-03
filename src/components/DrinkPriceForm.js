import React from 'react';
import {
    Row,
    Col,
    Form,
    InputNumber,
    Divider
} from 'antd';

const DrinkPriceForm = ({ availableSizes, form }) => {
    const sizeLabels = {
        S: 'Size S',
        M: 'Size M',
        L: 'Size L'
    };

    return (
        <>
            <Divider>Giá bán theo size</Divider>
            <Row gutter={16}>
                {availableSizes.map(size => (
                    <Col span={Math.floor(24 / availableSizes.length)} key={size}>
                        <Form.Item
                            label={sizeLabels[size]}
                            name={`price${size}`}
                            rules={[{ required: true, message: `Nhập giá ${sizeLabels[size]}!` }]}
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                placeholder={size === 'S' ? '25000' : size === 'M' ? '30000' : '35000'}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                ))}
            </Row>
        </>
    );
};

export default DrinkPriceForm;
