import type { WorkApplicationStatus } from "./workApplicationStatus";

export interface WorkListItemNested {
    id: number;
    
    provider: string;
    originalId: string;
    name: string;
    url: string;

    company: string;
    addedByScanId: number;
    removedByScanId: number | null;
}

export interface WorkApplicationListItem {
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

    work: WorkListItemNested 
  }
