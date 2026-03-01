export interface Scan {
  id: string;
  input: string; // JSON string that includes Providers
  outputAdded: number;
  outputRemoved: number;
  startedAt: string;
  endedAt: string;
}
