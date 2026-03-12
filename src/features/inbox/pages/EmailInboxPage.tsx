import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Flex,
  Form,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, LinkOutlined, ReloadOutlined, SyncOutlined } from "@ant-design/icons";
import axios from "axios";
import type { ColumnsType } from "antd/es/table";

import { formatDateTime } from "@/shared/extensions";
import type { Contact } from "@/features/contacts/types/contact";
import { getContacts } from "@/features/contacts/services/contactApi";
import { getApplications } from "@/features/applications/services/applicationApi";
import type { WorkApplication } from "@/features/applications/types/application";

import {
  assignInboxMessage,
  deleteInboxMessage,
  getGmailConnectUrl,
  getInboxMessageSuggestions,
  getInboxMessages,
  getInboxStatus,
  syncInbox,
} from "../services/inboxApi";
import type { InboxMessage, InboxMessageSuggestion, InboxStatus } from "../types/inbox";

const { Title, Text } = Typography;
const CONNECT_POLL_ATTEMPTS = 20;
const CONNECT_POLL_INTERVAL_MS = 3000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return fallback;

  const status = err.response?.status;

  if (status === 400) return "Gmail není připojen pro tento kontakt.";
  if (status === 404) return "Požadovaný záznam nebyl nalezen.";

  return fallback;
}

export default function EmailInboxPage() {
  const { contactId: rawContactId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const contactId = Number(rawContactId);

  const [contact, setContact] = useState<Contact | null>(null);
  const [status, setStatus] = useState<InboxStatus | null>(null);
  const [messagesList, setMessagesList] = useState<InboxMessage[]>([]);
  const [applications, setApplications] = useState<WorkApplication[]>([]);

  const [loadingStatus, setLoadingStatus] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const [importRunId, setImportRunId] = useState<string | null>(null);
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [suggestions, setSuggestions] = useState<InboxMessageSuggestion[]>([]);

  const loadContact = useCallback(async () => {
    if (!Number.isFinite(contactId)) return;

    try {
      const data = await getContacts();
      const matched = data.find((row) => row.id === contactId) ?? null;
      setContact(matched);

      if (!matched) {
        message.error("Email kontakt nebyl nalezen.");
      }
    } catch (err) {
      message.error(getApiErrorMessage(err, "Nepodařilo se načíst kontakt."));
    }
  }, [contactId]);

  const loadStatus = useCallback(async () => {
    if (!Number.isFinite(contactId)) return;

    try {
      setLoadingStatus(true);
      const data = await getInboxStatus(contactId);
      setStatus(data);

      if (data.lastImportRunId) {
        setImportRunId(data.lastImportRunId);
      }
    } catch (err) {
      message.error(getApiErrorMessage(err, "Nepodařilo se načíst stav inboxu."));
    } finally {
      setLoadingStatus(false);
    }
  }, [contactId]);

  const loadMessages = useCallback(
    async (runId?: string | null) => {
      if (!Number.isFinite(contactId)) return;

      try {
        setLoadingMessages(true);
        const data = await getInboxMessages(contactId, {
          importRunId: runId ?? importRunId,
          onlyUnassigned,
        });
        setMessagesList(data);
      } catch (err) {
        message.error(getApiErrorMessage(err, "Nepodařilo se načíst inbox zprávy."));
      } finally {
        setLoadingMessages(false);
      }
    },
    [contactId, importRunId, onlyUnassigned]
  );

  const loadApplications = useCallback(async () => {
    try {
      setLoadingApplications(true);
      const data = await getApplications();
      setApplications(data);
    } catch {
      message.error("Nepodařilo se načíst přihlášky.");
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  useEffect(() => {
    loadContact();
    loadStatus();
  }, [loadContact, loadStatus]);

  useEffect(() => {
    if (!status?.connected) return;

    loadMessages();
  }, [status?.connected, importRunId, onlyUnassigned, loadMessages]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await syncInbox(contactId, 100);

      setImportRunId(result.importRunId);
      message.success(`Načteno ${result.importedCount} zpráv.`);

      setStatus((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          lastImportedReceivedAt: result.lastImportedReceivedAt,
          lastImportRunId: result.importRunId,
          storedMessagesCount: prev.storedMessagesCount + result.importedCount,
        };
      });

      await loadMessages(result.importRunId);
    } catch (err) {
      message.error(getApiErrorMessage(err, "Import inbox zpráv selhal."));
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      setConnecting(true);
      const url = await getGmailConnectUrl(contactId);
      const authWindow = window.open(url, "_blank", "width=520,height=760");

      if (!authWindow) {
        message.warning("Prohlížeč zablokoval popup. Povol popup okna a zkus to znovu.");
        return;
      }

      message.info("Dokonči přihlášení ke Gmailu v novém okně.");

      for (let i = 0; i < CONNECT_POLL_ATTEMPTS; i += 1) {
        await sleep(CONNECT_POLL_INTERVAL_MS);
        const nextStatus = await getInboxStatus(contactId);
        setStatus(nextStatus);

        if (nextStatus.connected) {
          authWindow.close();
          message.success("Gmail byl úspěšně připojen.");
          await loadMessages(nextStatus.lastImportRunId ?? null);
          return;
        }
      }

      message.warning("Připojení Gmailu zatím není potvrzené. Klikni na Obnovit.");
    } catch (err) {
      message.error(getApiErrorMessage(err, "Nepodařilo se zahájit Gmail connect flow."));
    } finally {
      setConnecting(false);
    }
  };

  const openAssignModal = async (inboxMessage: InboxMessage) => {
    setSelectedMessage(inboxMessage);
    setSuggestions([]);

    await Promise.all([
      applications.length === 0 ? loadApplications() : Promise.resolve(),
      (async () => {
        try {
          setLoadingSuggestions(true);
          const data = await getInboxMessageSuggestions(inboxMessage.id, 10);
          setSuggestions(data);
        } catch {
          message.warning("Nepodařilo se načíst návrhy přiřazení.");
        } finally {
          setLoadingSuggestions(false);
        }
      })(),
    ]);

    form.setFieldsValue({ workApplicationId: inboxMessage.workApplicationId ?? undefined });
    setAssignModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedMessage) return;

    try {
      const values = await form.validateFields();
      await assignInboxMessage(selectedMessage.id, {
        workApplicationId: values.workApplicationId,
      });

      setMessagesList((prev) =>
        prev.map((row) =>
          row.id === selectedMessage.id
            ? { ...row, workApplicationId: values.workApplicationId }
            : row
        )
      );

      setAssignModalOpen(false);
      setSelectedMessage(null);
      form.resetFields();
      message.success("Zpráva byla přiřazena k přihlášce.");
    } catch (err) {
      message.error(getApiErrorMessage(err, "Přiřazení zprávy se nezdařilo."));
    }
  };

  const handleDelete = async (inboxMessage: InboxMessage) => {
    try {
      await deleteInboxMessage(inboxMessage.id);
      setMessagesList((prev) => prev.filter((row) => row.id !== inboxMessage.id));
      message.success("Zpráva byla smazána.");
    } catch (err) {
      message.error(getApiErrorMessage(err, "Smazání zprávy se nezdařilo."));
    }
  };

  const applicationOptions = useMemo(
    () => {
      const scoreByApplicationId = new Map(
        suggestions.map((item) => [item.workApplicationId, item.score])
      );

      return [...applications]
        .sort((a, b) => {
          const aScore = scoreByApplicationId.get(a.id) ?? -1;
          const bScore = scoreByApplicationId.get(b.id) ?? -1;
          return bScore - aScore;
        })
        .map((app) => ({
        label: `#${app.id} | ${app.email} | ${formatDateTime(app.createdAt) ?? app.createdAt}`,
        value: app.id,
      }));
    },
    [applications, suggestions]
  );

  const columns: ColumnsType<InboxMessage> = [
    {
      title: "Received",
      dataIndex: "receivedAt",
      width: 170,
      render: (value: string) => formatDateTime(value) ?? "-",
    },
    {
      title: "From",
      dataIndex: "fromEmail",
      width: 220,
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
    {
      title: "Stav",
      dataIndex: "workApplicationId",
      width: 140,
      render: (value: number | null) =>
        value == null ? <Tag color="orange">Nepřiřazeno</Tag> : <Tag color="green">Přiřazeno</Tag>,
    },
    {
      title: "Akce",
      key: "actions",
      width: 180,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openAssignModal(row)}>
            Přiřadit
          </Button>
          <Popconfirm
            title="Smazat zprávu?"
            description="Zpráva bude skrytá v inbox workflow (soft delete)."
            onConfirm={() => handleDelete(row)}
            okText="Smazat"
            cancelText="Zrušit"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Smazat
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const isInvalidContact = !Number.isFinite(contactId);
  const isEmailContact = contact?.type === "Email";

  return (
    <>
      <Flex justify="space-between" align="center">
        <Title level={3} style={{ margin: 0 }}>
          Email Inbox
        </Title>
        <Button onClick={() => navigate("/contacts")}>Zpět na kontakty</Button>
      </Flex>

      {isInvalidContact && (
        <Alert
          style={{ marginTop: 16 }}
          type="error"
          message="Neplatné contactId v URL."
          showIcon
        />
      )}

      {!isInvalidContact && contact && !isEmailContact && (
        <Alert
          style={{ marginTop: 16 }}
          type="warning"
          message="Inbox je dostupný pouze pro kontakty typu Email."
          showIcon
        />
      )}

      {!isInvalidContact && isEmailContact && (
        <>
          <Card style={{ marginTop: 16 }} loading={loadingStatus}>
            <Flex justify="space-between" align="center" wrap>
              <Space direction="vertical" size={4}>
                <Text strong>Kontakt</Text>
                <Text>{contact?.value}</Text>
                <Text strong>Google účet</Text>
                <Text>{status?.googleEmail ?? "-"}</Text>
                <Text strong>Poslední import</Text>
                <Text>{formatDateTime(status?.lastImportedReceivedAt) ?? "-"}</Text>
                <Text strong>Uložené zprávy</Text>
                <Text>{status?.storedMessagesCount ?? 0}</Text>
              </Space>

              <Space>
                {!status?.connected ? (
                  <Tooltip title="Spustí Gmail connect flow">
                    <Button
                      type="primary"
                      icon={<LinkOutlined />}
                      loading={connecting}
                      onClick={handleConnectGmail}
                    >
                      Připojit Gmail
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    type="primary"
                    icon={<SyncOutlined />}
                    loading={syncing}
                    onClick={handleSync}
                  >
                    Načíst nové zprávy
                  </Button>
                )}

                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    loadStatus();
                    if (status?.connected) {
                      loadMessages();
                    }
                  }}
                >
                  Obnovit
                </Button>
              </Space>
            </Flex>
          </Card>

          {status?.connected && (
            <Card style={{ marginTop: 16 }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                <Space>
                  <Text strong>Inbox messages</Text>
                  {importRunId && <Tag color="blue">Import run: {importRunId}</Tag>}
                </Space>

                <Space>
                  <Text>Jen nepřiřazené</Text>
                  <Switch checked={onlyUnassigned} onChange={setOnlyUnassigned} />
                </Space>
              </Flex>

              <Table
                rowKey="id"
                loading={loadingMessages}
                columns={columns}
                dataSource={messagesList}
                pagination={{ pageSize: 20 }}
              />
            </Card>
          )}
        </>
      )}

      <Modal
        title="Přiřadit zprávu k přihlášce"
        open={assignModalOpen}
        onCancel={() => {
          setAssignModalOpen(false);
          setSelectedMessage(null);
          setSuggestions([]);
          form.resetFields();
        }}
        onOk={handleAssign}
        okText="Přiřadit"
        confirmLoading={loadingApplications || loadingSuggestions}
      >
        {(loadingSuggestions || suggestions.length > 0) && (
          <Card
            size="small"
            title="Doporučené přihlášky"
            style={{ marginBottom: 12 }}
            loading={loadingSuggestions}
          >
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              {suggestions.map((item) => (
                <Flex key={item.workApplicationId} justify="space-between" align="center">
                  <div>
                    <Text strong>{`#${item.workApplicationId} | ${item.provider} | ${item.company ?? "?"}`}</Text>
                    <br />
                    <Text>{item.workName}</Text>
                    {item.reasons?.length > 0 && (
                      <>
                        <br />
                        <Text type="secondary">{item.reasons.join(" • ")}</Text>
                      </>
                    )}
                  </div>
                  <Space>
                    <Tag color="blue">{`Score ${item.score}`}</Tag>
                    <Button
                      size="small"
                      onClick={() => form.setFieldValue("workApplicationId", item.workApplicationId)}
                    >
                      Vybrat
                    </Button>
                  </Space>
                </Flex>
              ))}
            </Space>
          </Card>
        )}

        <Form layout="vertical" form={form}>
          <Form.Item
            label="Work application"
            name="workApplicationId"
            rules={[{ required: true, message: "Vyber přihlášku" }]}
          >
            <Select
              showSearch
              options={applicationOptions}
              loading={loadingApplications}
              placeholder="Vyber přihlášku"
              filterOption={(input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
