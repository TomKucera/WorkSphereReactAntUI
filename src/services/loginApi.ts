// src/services/loginApi.ts
import axios from 'axios';

const API_URL = 'http://0.0.0.0:8000/api/v1/auth/login';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  // přidej další pole podle odpovědi API
}

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(API_URL, payload, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  return response.data;
};
