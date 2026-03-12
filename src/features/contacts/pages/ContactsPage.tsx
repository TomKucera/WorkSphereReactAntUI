import { useEffect, useState } from "react";

import { Flex, Table, Button, Modal, Form, Input, Switch,Space, Popconfirm, Tooltip, Typography, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, MailOutlined, PhoneOutlined, InboxOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Contact, ContactType } from "../types/contact";
import Splitter from "antd/es/splitter";
import { Link } from "react-router-dom";
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from "../services/contactApi";
import { formatPhoneNumber } from '../../../shared/extensions';

const { Title } = Typography;

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form] = Form.useForm();

  const loadContacts = async () => {
    const data = await getContacts();
    setContacts(data);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleSave = async () => {
    const values = await form.validateFields();

    if (editing) {
      await updateContact(editing.id, values);
      message.success("Updated");
    } else {
      await createContact(values);
      message.success("Created");
    }

    setModalOpen(false);
    setEditing(null);
    form.resetFields();
    loadContacts();
  };

  const handleDelete = async (id: number) => {
    await deleteContact(id);
    message.success("Deleted");
    loadContacts();
  };

  const openCreate = (type: ContactType) => {
    setEditing(null);
    form.setFieldsValue({
      type,
      isPrimary: false,
    });
    setModalOpen(true);
  };

  const openEdit = (record: Contact) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const columns: ColumnsType<Contact> = [
    {
      title: "Value",
      dataIndex: "value",
      // render: (value: string, record: Contact) => {
      //   if (record.isPrimary) {
      //     return (
      //       <span
      //         style={{
      //           fontWeight: 600,
      //           color: "darkred",
      //         }}
      //       >
      //         {value}
      //       </span>
      //     );
      //   }
  
      //   return value;
      // },
      render: (value: string, record: Contact) => {
        let displayValue = value;
    
        if (record.type === "Phone") {
          displayValue = formatPhoneNumber(value);
        }
    
        return (
          <span
            style={{
              fontSize: 16,        // větší text
              fontWeight: record.isPrimary ? 750 : 500,
              color: record.isPrimary ? "darkred" : "inherit",
            }}
          >
            {displayValue}
          </span>
        );
      },
    },
    {
      title: "Actions",
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          {record.type === "Email" && (
            <Tooltip title="Open Inbox">
              <Link to={`/contacts/${record.id}/inbox`}>
                <InboxOutlined style={{ color: "#722ed1", cursor: "pointer" }} />
              </Link>
            </Tooltip>
          )}

          <Tooltip title="Edit">
            <EditOutlined
              style={{ color: "#1677ff", cursor: "pointer" }}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
    
          <Popconfirm
            title="Delete contact?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <DeleteOutlined
                style={{ color: "#ff4d4f", cursor: "pointer" }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    }
  ];

  const emails = contacts.filter((c) => c.type === "Email");
  const phones = contacts.filter((c) => c.type === "Phone");

  return (
    <>
    <Title level={3}>Contacts</Title>
    <Flex vertical>
      <Splitter  style={{ height: 1000, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        {/* EMAIL TABLE */}
        <Splitter.Panel>
          <div style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MailOutlined style={{ color: "#8c8c8c" }} />
                Emails
              </h2>
              <Tooltip title="Add Email">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<PlusOutlined />}
                  onClick={() => openCreate("Email")}
                />
              </Tooltip>
            </div>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={emails}
              pagination={false}
            />
          </div>
        </Splitter.Panel>

        {/* PHONE TABLE */}
        <Splitter.Panel>
          <div style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <PhoneOutlined style={{ color: "#8c8c8c" }} />
                Phones
              </h2>

              <Tooltip title="Add Phone">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<PlusOutlined />}
                  onClick={() => openCreate("Phone")}
                />
              </Tooltip>
            </div>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={phones}
              pagination={false}
            />
          </div>
        </Splitter.Panel>
      </Splitter>
      </Flex>

      <Modal
        title={editing ? "Edit Contact" : "Create Contact"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>

          {/* <Form.Item
            label="Value"
            name="value"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item> */}

          <Form.Item
            label="Value"
            name="value"
            rules={[
              { required: true, message: "Value is required" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const type = getFieldValue("type");

                  if (!value) return Promise.resolve();

                  if (type === "Email") {
                    const emailRegex =
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                    if (!emailRegex.test(value)) {
                      return Promise.reject(
                        new Error("Invalid email format")
                      );
                    }
                  }

                  if (type === "Phone") {
                    const phoneRegex =
                      /^\+?[1-9]\d{7,14}$/;

                    if (!phoneRegex.test(value)) {
                      return Promise.reject(
                        new Error(
                          "Phone must be in international format, e.g. +420123456789"
                        )
                      );
                    }
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Primary"
            name="isPrimary"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
