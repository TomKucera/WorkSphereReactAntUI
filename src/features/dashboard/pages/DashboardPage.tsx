import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Table,
  Typography,
  Button,
  Space,
  Popconfirm,
  Spin,
  message,
  Row,
  Col,
} from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

const { Title } = Typography;

const DashboardPage = () => {
  return (
    <>
      <Title level={1}>Dashboard</Title>
    </>
  );
};

export default DashboardPage;
