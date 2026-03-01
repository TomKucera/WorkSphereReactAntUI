import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import BrandHeader from '@/layouts/BrandHeader';
import './Layout.css';

const { Header, Content } = Layout;

export default function AuthLayout() {
  return (
    <Layout className='layout'>
      <Header className='header' >
        <BrandHeader />
      </Header>

      <Content className='content'>
        <Outlet />
      </Content>
    </Layout>
  );
}
