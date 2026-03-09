import axiosInstance from "../../../services/axiosInstance";
import { ProviderSettingsMap } from "../types/providerSettings";


const BASE = "providers";

export const getProviderSettings = async (): Promise<ProviderSettingsMap> => {
  const response = await axiosInstance.get(`${BASE}/settings`);
  return response.data;
};
