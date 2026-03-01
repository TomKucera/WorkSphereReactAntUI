export type ContactType = "Email" | "Phone";

export interface Contact {
  id: number;
  type: ContactType;
  value: string;
  isPrimary: boolean;
}