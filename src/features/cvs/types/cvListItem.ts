export interface CvListItem {
    id: number;
    userId: number;
    name: string;
    note: string | null;
    originalFileName: string;
    active: boolean;

    createdAt: string;
    updatedAt?: string | null;   
  }
