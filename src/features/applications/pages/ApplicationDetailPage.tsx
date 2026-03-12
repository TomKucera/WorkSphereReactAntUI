import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, Descriptions, Flex, Spin, Table, Tabs, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import { getApplicationById } from "../services/applicationApi";
import type { WorkApplication } from "../types/application";

import { getContacts } from "@/features/contacts/services/contactApi";
import { getInboxMessages } from "@/features/inbox/services/inboxApi";
import type { InboxMessage } from "@/features/inbox/types/inbox";
import { getWorkById } from "@/features/works/services/workApi";
import type { Work } from "@/features/works/types/work";
import { formatDateTime, formatPhoneNumber, getProviderWorkUrl } from "@/shared/extensions";

const { Title, Paragraph, Text } = Typography;

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<WorkApplication | null>(null);
  const [work, setWork] = useState<Work | null>(null);
  const [assignedMessages, setAssignedMessages] = useState<InboxMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const applicationId = Number(id);

      if (!Number.isFinite(applicationId)) {
        message.error("Neplatné ID přihlášky.");
        setLoading(false);
        return;
      }

      try {
        const loadedApplication = await getApplicationById(applicationId);
        setApplication(loadedApplication);

        try {
          const loadedWork = await getWorkById(loadedApplication.workId);
          setWork(loadedWork);
        } catch {
          setWork(null);
        }

        try {
          setMessagesLoading(true);
          setMessagesError(null);

          const contacts = await getContacts();
          const emailContact = contacts.find(
            (contact) =>
              contact.type === "Email" &&
              contact.value.trim().toLowerCase() === loadedApplication.email.trim().toLowerCase()
          );

          if (!emailContact) {
            setAssignedMessages([]);
            setMessagesError("Nepodařilo se najít email kontakt navázaný na tuto přihlášku.");
          } else {
            const inboxMessages = await getInboxMessages(emailContact.id);
            setAssignedMessages(
              inboxMessages.filter((row) => row.workApplicationId === loadedApplication.id)
            );
          }
        } catch {
          setAssignedMessages([]);
          setMessagesError("Nepodařilo se načíst přiřazené inbox zprávy.");
        } finally {
          setMessagesLoading(false);
        }
      } catch {
        message.error("Nepodařilo se načíst detail přihlášky.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return <Spin size="large" />;
  }

  if (!application) {
    return (
      <Alert
        type="error"
        showIcon
        message="Detail přihlášky nebyl nalezen."
        action={<Button onClick={() => navigate("/applications")}>Zpět</Button>}
      />
    );
  }

  const assignedMessagesColumns: ColumnsType<InboxMessage> = [
    {
      title: "Received",
      dataIndex: "receivedAt",
      width: 180,
      render: (value: string) => formatDateTime(value) ?? "-",
    },
    {
      title: "From",
      dataIndex: "fromEmail",
      width: 260,
      ellipsis: true,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      ellipsis: true,
      render: (value: string) => value || "(bez předmětu)",
    },
    {
      title: "Snippet",
      dataIndex: "snippet",
      ellipsis: true,
      render: (value: string) => value || "-",
    },
  ];

  const basicInfoView = (
    <Card style={{ marginTop: 16 }}>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="ID">{application.id}</Descriptions.Item>
        <Descriptions.Item label="Status">{application.status}</Descriptions.Item>
        <Descriptions.Item label="First name">{application.firstName}</Descriptions.Item>
        <Descriptions.Item label="Last name">{application.lastName}</Descriptions.Item>
        <Descriptions.Item label="Email">{application.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{formatPhoneNumber(application.phone)}</Descriptions.Item>
        <Descriptions.Item label="Created">{formatDateTime(application.createdAt) ?? application.createdAt}</Descriptions.Item>
        <Descriptions.Item label="Updated">{formatDateTime(application.updatedAt) ?? "-"}</Descriptions.Item>
      </Descriptions>

      <Card size="small" title="Message" style={{ marginTop: 16 }}>
        <Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
          {application.message || "-"}
        </Paragraph>
      </Card>

      <Card size="small" title="Work" style={{ marginTop: 16 }}>
        {work ? (
          <Flex vertical gap={4}>
            <Text strong>{work.name}</Text>
            <Text>{work.company || "?"}</Text>
            <Text type="secondary">{work.provider}</Text>
            <Flex gap={8}>
              <a
                href={getProviderWorkUrl(work.provider, work.url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Otevřít originální inzerát
              </a>
              <Link to={`/works/${work.id}`}>Detail work</Link>
            </Flex>
          </Flex>
        ) : (
          <Text type="secondary">Work detail se nepodařilo načíst.</Text>
        )}
      </Card>
    </Card>
  );

  const assignedMessagesView = (
    <Card style={{ marginTop: 16 }}>
      {messagesError && (
        <Alert
          type="warning"
          showIcon
          message={messagesError}
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        rowKey="id"
        loading={messagesLoading}
        columns={assignedMessagesColumns}
        dataSource={assignedMessages}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "K této přihlášce nejsou přiřazené žádné zprávy." }}
      />
    </Card>
  );

  return (
    <>
      <Flex justify="space-between" align="center">
        <Title level={3} style={{ margin: 0 }}>
          Application Detail
        </Title>
        <Button onClick={() => navigate("/applications")}>Zpět na seznam</Button>
      </Flex>

      <Tabs
        style={{ marginTop: 16 }}
        items={[
          { key: "basic", label: "Základní informace", children: basicInfoView },
          { key: "messages", label: "Přiřazené zprávy", children: assignedMessagesView },
        ]}
      />
    </>
  );
}
