import axiosInstance from "../../../services/axiosInstance";
import type {
  WorkApplication,
  CreateWorkApplicationRequest,
  UpdateWorkApplicationRequest,
} from "../types/application";

import type { WorkApplicationListQuery } from "../types/workApplicationListQuery";
import type { ListPage } from "../../_base/types/listPage";
import type { WorkApplicationListItem } from "../types/workApplicationListItem";

const BASE = "applications";

export const getApplications = async (): Promise<WorkApplication[]> => {
  const response = await axiosInstance.get(BASE);
  return response.data;
};

export const listApplications = async (data: WorkApplicationListQuery): Promise<ListPage<WorkApplicationListItem>> => {
  const response = await axiosInstance.post(`${BASE}/list`, data);
  return response.data;
};

export const getApplicationById = async (id: number): Promise<WorkApplication> => {
  const response = await axiosInstance.get(`${BASE}/${id}`);
  return response.data;
};

export const getApplicationByWorkId = async (work_id: number): Promise<WorkApplication> => {
  const response = await axiosInstance.get(`${BASE}/by-work/${work_id}`);
  return response.data;
};

export const createApplication = async (
  data: CreateWorkApplicationRequest
): Promise<WorkApplication> => {
  const response = await axiosInstance.post(BASE, data);
  return response.data;
};

export const updateApplication = async (
  id: number,
  data: UpdateWorkApplicationRequest
): Promise<WorkApplication> => {
  const response = await axiosInstance.put(`${BASE}/${id}`, data);
  return response.data;
};