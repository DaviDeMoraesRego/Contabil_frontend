import axios from "axios";
import { getToken } from "./authTokenManager";

const BASE_URL = process.env.NEXT_PUBLIC_API_LICOES;

const axiosWithAuth = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

async function apiRequest(method: string, path: string) {
  try {
    const token = await getToken();

    const config = {
      method,
      url: `${BASE_URL}${path}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    };

    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export const getAllLicoesByUnidadesId = async (unidadesId: number) => {
  return await apiRequest("GET", `/unidades/${unidadesId}/`);
};

export const getById = async (id: number) => {
  return await apiRequest("GET", `/${id}/`);
};