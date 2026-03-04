import axiosInstance from "../../../services/axiosInstance";
import type {Work} from "../types/work";

import type { WorkListQuery } from "../types/workListQuery";
import type { ListPage } from "../../_base/types/listPage";
import type { WorkListItem } from "../types/workListItem";

const BASE = "works";

export const getWorks = async (): Promise<Work[]> => {
    const response = await axiosInstance.get(BASE);
    return response.data;
};

export const listWorks = async (data: WorkListQuery): Promise<ListPage<WorkListItem>> => {
    const response = await axiosInstance.post(`${BASE}/list`, data);
    return response.data;
};

export const getWorkById = async (id: number): Promise<Work> => {
    const response = await axiosInstance.get(`${BASE}/${id}`);
    return response.data;
};

export const getWorkDescription = async (workId: number): Promise<string> => {
    const response = await axiosInstance.get(`${BASE}/${workId}/description`);
    return response.data;
};

export const setWorkDescription = async (workId: number, description: string): Promise<string> => {
    const response = await axiosInstance.put(`${BASE}/${workId}/description`, { "description": description});
    return response.data;
};
