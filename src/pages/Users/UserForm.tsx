import React from "react";
import { Form, Input, Button, Select } from "antd";

interface UserFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
                                               initialValues,
                                               onSubmit,
                                               loading,
                                           }) => {
    return (
        <Form
            layout="vertical"
            initialValues={initialValues}
            onFinish={onSubmit}
            className="p-4"
        >
            <Form.Item
                label="Họ tên"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                ]}
            >
                <Input disabled={!!initialValues} />
            </Form.Item>
            {!initialValues && (
                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                >
                    <Input.Password />
                </Form.Item>
            )}
            <Form.Item
                label="Vai trò"
                name="role"
                rules={[{ required: true, message: "Chọn vai trò" }]}
            >
                <Select>
                    <Select.Option value="admin">Quản trị viên</Select.Option>
                    <Select.Option value="staff">Nhân viên</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                    {initialValues ? "Cập nhật" : "Tạo mới"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default UserForm;
