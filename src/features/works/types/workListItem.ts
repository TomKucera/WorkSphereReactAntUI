import { WorkApplicationStatus } from "../../applications/types/workApplicationStatus"

export interface ScanListItemNested {
    startedAt: string;
    endedAt?: string | null;
}

export interface WorkApplicationListItemNested {
    id: number;
    status: WorkApplicationStatus;
    createdAt: string;
    updatedAt?: string | null;
}

export interface WorkListItem {
    id: number;
    provider: string;
    originalId: string;
    name: string;
    description: string;
    url: string;
    company: string;
    addedByScanId: number;
    removedByScanId: number | null;
    remoteRatio: number;
    salaryCurrency: string;
    salaryMin: number;
    salaryMax: number;

    addedByScan: ScanListItemNested;
    removedByScan: ScanListItemNested | null;

    application: WorkApplicationListItemNested | null;
    hasCustomDescription: boolean;
}
