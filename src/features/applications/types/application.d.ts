import type { WorkApplicationStatus } from "./workApplicationStatus";

export interface WorkApplication {
  id: number;
  userId: number;
  workId: number;
  cvId: number;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  message: string;
  status: WorkApplicationStatus;

  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateWorkApplicationRequest {
  workId: number;
  cvId: number;
  contactEmailId: number;
  contactPhoneId: number;
  message: string;
  autoApply: boolean;
}

export interface UpdateWorkApplicationRequest {
  status: WorkApplicationStatus;
}
