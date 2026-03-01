import axiosInstance from "../../../services/axiosInstance";
import { Contact } from "../types/contact";

const BASE = "contacts";

export const getContacts = async (): Promise<Contact[]> => {
  const response = await axiosInstance.get(BASE);
  return response.data;
};

export const getContactById = async (id: number): Promise<Contact> => {
  const response = await axiosInstance.get(`${BASE}/${id}`);
  return response.data;
};

export const createContact = async (
  data: Omit<Contact, "id">
): Promise<Contact> => {
  const response = await axiosInstance.post(BASE, data);
  return response.data;
};

export const updateContact = async (
  id: number,
  data: Omit<Contact, "id">
): Promise<Contact> => {
  const response = await axiosInstance.put(`${BASE}/${id}`, data);
  return response.data;
};

export const deleteContact = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${BASE}/${id}`);
};