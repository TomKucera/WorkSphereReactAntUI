export interface CvFilter {
  name?: string;
  note?: string;
  originalFileName?: string;
  active?: boolean;

  createdFrom?: string;   // ISO 8601
  createdTo?: string;

  updatedFrom?: string;
  updatedTo?: string;
}
