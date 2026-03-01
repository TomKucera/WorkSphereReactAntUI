import axiosInstance from "../../../services/axiosInstance";
import { Cv } from "../types/cv";

import type { CvListQuery } from "../types/cvListQuery";
import type { ListPage } from "../../_base/types/listPage";
import type { CvListItem } from "../types/cvListItem";

const BASE = "cvs";

export const getCvs = async (): Promise<Cv[]> => {
  const response = await axiosInstance.get(BASE);
  return response.data;
};

export const listCvs = async (data: CvListQuery): Promise<ListPage<CvListItem>> => {
  const response = await axiosInstance.post(`${BASE}/list`, data);
  return response.data;
};

export const getCvById = async (id: number): Promise<Cv> => {
  const response = await axiosInstance.get(`${BASE}/${id}`);
  return response.data;
};

export const getCvFileById = async (id: number): Promise<any> => {
  const response = await axiosInstance.get(`${BASE}/${id}/file`, {
    responseType: "blob",
  });
  return response.data;
};

export const createCv = async (formData: FormData): Promise<void> => {
  await axiosInstance.post(BASE, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const setCvActive = async (cvId: number, active: boolean): Promise<void> => {
  await axiosInstance.patch(`${BASE}/${cvId}/active`, { active });
};

// export const updateCv = async (
//   id: number,
//   data: { originalFileName?: string; active?: boolean }
// ): Promise<void> => {
//   await axiosInstance.put(`${BASE}/${id}`, data);
// };

// export const deleteCv = async (id: number): Promise<void> => {
//   await axiosInstance.delete(`${BASE}/${id}`);
// };

export const buildCvRag = async (id: number): Promise<void> => {
  await axiosInstance.post(`${BASE}/${id}/rag`);
};
