export interface InboxStatus {
  connected: boolean;
  googleEmail: string | null;
  lastImportedReceivedAt: string | null;
  lastImportRunId: string | null;
  storedMessagesCount: number;
}

export interface InboxSyncResponse {
  importRunId: string;
  importedCount: number;
  lastImportedReceivedAt: string | null;
}

export interface InboxMessage {
  id: number;
  receivedAt: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  workApplicationId: number | null;
}

export interface InboxMessagesQuery {
  importRunId?: string | null;
  onlyUnassigned?: boolean;
}

export interface AssignInboxMessageRequest {
  workApplicationId: number;
}

export interface InboxMessageSuggestion {
  workApplicationId: number;
  workId: number;
  workName: string;
  company: string | null;
  provider: string;
  score: number;
  reasons: string[];
}
