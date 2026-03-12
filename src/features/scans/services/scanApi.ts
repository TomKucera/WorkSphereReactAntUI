import axios from '@/services/axiosInstanceAzure';
import type { Scan } from '../types/scan';
// https://workspherescannerapi.azurewebsites.net/api/swagger/ui

const API_KEY = '';

export interface PaginatedScanResponse {
  items: Scan[];
  page: number;
  pageSize: number;
  totalCount?: number;
}

export const getScans = async (
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedScanResponse> => {
  const response = await axios.post<PaginatedScanResponse>(
    `https://workspherescannerapi.azurewebsites.net/api/scans?code=${API_KEY}`,
    { page, pageSize },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  );

  return response.data;
};
