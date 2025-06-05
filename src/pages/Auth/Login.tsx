import React, { useState } from "react";
import { Form, Input, Button, Alert, Card } from "antd";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const { login, loading } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const onFinish = async (values: { email: string; password: string }) => {
        setError(null);
        setSuccess(null);
        try {
            await login(values.email, values.password);
            setSuccess("Đăng nhập thành công! Đang chuyển hướng...");
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (err: any) {
            setError(err.message || "Đăng nhập thất bại!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
            <Card className="w-full max-w-md shadow-2xl rounded-2xl p-8">
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo.svg" alt="Pickup Logo" className="h-12 mb-2" />
                    <h2 className="text-2xl font-bold text-black">Đăng nhập hệ thống</h2>
                </div>
                {error && (
                    <Alert
                        message="Lỗi"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        className="mb-4"
                    />
                )}
                {success && (
                    <Alert
                        message="Thành công"
                        description={success}
                        type="success"
                        showIcon
                        closable
                        className="mb-4"
                    />
                )}
                <Form name="login" layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Email"
                        name="email"
                        className="mb-4"
                        rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                    >
                        <Input size="large" autoComplete="email" />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        className="mb-4"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                    >
                        <Input.Password size="large" autoComplete="current-password" />
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        loading={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Đăng nhập
                    </Button>
                </Form>
                <div className="flex justify-between mt-4">
                    <a href="/register" className="text-blue-500 hover:underline">
                        Đăng ký
                    </a>
                    <a href="/forgot" className="text-gray-500 hover:underline">
                        Quên mật khẩu?
                    </a>
                </div>
            </Card>
        </div>
    );
};

export default Login;
