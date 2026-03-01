import type { WorkApplicationStatus } from "./workApplicationStatus";

export interface WorkApplicationFilter {
    workProvider?: string;
    workCompany?: string;
    workName?: string;
    phone?: string;
    email?: string;
    message?: string;
    status?: WorkApplicationStatus[];
  
    createdFrom?: string;   // ISO 8601
    createdTo?: string;
  
    updatedFrom?: string;
    updatedTo?: string;
  }
  