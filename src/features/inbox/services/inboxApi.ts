import axiosInstance from "@/services/axiosInstance";
import type {
  AssignInboxMessageRequest,
  InboxMessage,
  InboxMessageSuggestion,
  InboxMessagesQuery,
  InboxStatus,
  InboxSyncResponse,
} from "../types/inbox";

const BASE = "integrations/inbox";

export const getInboxStatus = async (contactId: number): Promise<InboxStatus> => {
  const response = await axiosInstance.get<InboxStatus>(`${BASE}/status`, {
    params: { contact_id: contactId },
  });

  return response.data;
};

export const syncInbox = async (
  contactId: number,
  limit: number = 100
): Promise<InboxSyncResponse> => {
  const response = await axiosInstance.post<InboxSyncResponse>(
    `${BASE}/sync`,
    null,
    { params: { contact_id: contactId, limit } }
  );

  return response.data;
};

export const getInboxMessages = async (
  contactId: number,
  query?: InboxMessagesQuery
): Promise<InboxMessage[]> => {
  const response = await axiosInstance.get<InboxMessage[]>(`${BASE}/messages`, {
    params: {
      contact_id: contactId,
      import_run_id: query?.importRunId ?? undefined,
      only_unassigned: query?.onlyUnassigned ? true : undefined,
    },
  });

  return response.data;
};

export const assignInboxMessage = async (
  messageId: number,
  data: AssignInboxMessageRequest
): Promise<void> => {
  await axiosInstance.put(`${BASE}/messages/${messageId}/assign`, data);
};

export const deleteInboxMessage = async (messageId: number): Promise<void> => {
  await axiosInstance.delete(`${BASE}/messages/${messageId}`);
};

export const getInboxMessageSuggestions = async (
  messageId: number,
  limit: number = 10
): Promise<InboxMessageSuggestion[]> => {
  const response = await axiosInstance.get<InboxMessageSuggestion[]>(
    `${BASE}/messages/${messageId}/suggestions`,
    { params: { limit } }
  );

  return response.data;
};

export const getGmailConnectUrl = async (contactId: number): Promise<string> => {
  const response = await axiosInstance.get<string | { url?: string; connectUrl?: string; authUrl?: string }>(
    "integrations/gmail/connect-url",
    { params: { contact_id: contactId } }
  );

  if (typeof response.data === "string") {
    return response.data;
  }

  if (response.data?.url) {
    return response.data.url;
  }

  if (response.data?.connectUrl) {
    return response.data.connectUrl;
  }

  if (response.data?.authUrl) {
    return response.data.authUrl;
  }

  throw new Error("Connect URL was not returned by backend.");
};
