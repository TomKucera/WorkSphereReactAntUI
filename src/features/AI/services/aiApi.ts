import axiosInstance from "../../../services/axiosInstance";

import type { CoverLetterRequest } from "../types/coverLetterRequest";
import type { CoverLetterResponse } from "../types/coverLetterResponse";
  

const BASE = "ai";

export const generateCoverLetter = async (params: CoverLetterRequest): Promise<CoverLetterResponse> =>
{
  const response = await axiosInstance.get(`${BASE}/cover-letter`, { params });
  
  return response.data;
};