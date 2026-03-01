export interface WorkFilter {
    provider?: string;
    originalId?: string;
    company?: string;
    name?: string;
    description?: string;
    salary?: number;
    remote?: number;
    active?: boolean;
    application?: boolean;
  
    createdFrom?: string;   // ISO 8601
    createdTo?: string;
  
    deletedFrom?: string;
    deletedTo?: string;
  }
  