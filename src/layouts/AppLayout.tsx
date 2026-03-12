import { Layout, Menu, Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import BrandHeader from '@/layouts/BrandHeader';
import './Layout.css';

const { Header, Content } = Layout;

interface TokenPayload {
  sub: string;
  login: string;
  name: string;
  exp: number;
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');

  let userName = '';

  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      userName = decoded.name;
    } catch {}
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getSelectedKey = () => {
    const path = location.pathname;

    if (path === "/") return "dashboard";
    if (path.startsWith("/scans")) return "scans";
    if (path.startsWith("/works")) return "works";
    if (path.startsWith("/applications")) return "applications";
    if (path.startsWith("/cvs")) return "cvs";
    if (path.startsWith("/contacts")) return "contacts";

    return "";
  };

  const menuItems = [
    { key: 'dashboard', label: <Link to="/">Dashboard</Link> },
    { key: 'scans', label: <Link to="/scans">Scans</Link> },
    { key: 'works', label: <Link to="/works">Works</Link> },
    { key: 'applications', label: <Link to="/applications">Work applications</Link> },
    { key: 'cvs', label: <Link to="/cvs">CVs</Link> },
    { key: 'contacts', label: <Link to="/contacts">Contacts</Link> },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="layout">
      <Header
        className="header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* LEFT SIDE */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <BrandHeader />
          <Menu
            mode="horizontal"
            items={menuItems}
            selectedKeys={[getSelectedKey()]}
            style={{ marginLeft: 32, width: '75%' }}
          />
        </div>

        {/* RIGHT SIDE */}
        {userName && (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <Avatar icon={<UserOutlined />} />
              <span>{userName}</span>
            </div>
          </Dropdown>
        )}
      </Header>

      <Content className="content">
        <Outlet />
      </Content>
    </Layout>
  );
}
