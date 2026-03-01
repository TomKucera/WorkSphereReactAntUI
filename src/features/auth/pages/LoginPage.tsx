import { Card, Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '@/services/loginApi';

const { Title } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      const data = await loginUser(values);
      localStorage.setItem('token', data.access_token);
      message.success('Login successful');
      navigate('/');
    } catch (error) {
      message.error('Invalid credentials');
    }
  };

  return (
    <Card
      style={{
        width: 400,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        Sign in
      </Title>

      <Form layout="vertical" onFinish={handleLogin}>
        <Form.Item
          label="Login"
          name="username"
          rules={[{ required: true, message: 'Please enter login' }]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter password' }]}
        >
          <Input.Password size="large" />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block>
          Login
        </Button>
      </Form>
    </Card>
  );
}
