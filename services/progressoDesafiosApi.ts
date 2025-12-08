import axios from "axios";
import { getToken } from "./authTokenManager";

const BASE_URL = process.env.NEXT_PUBLIC_API_PROGRESO_DESAFIOS;

const axiosWithAuth = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

async function apiRequest(method: string, path: string, data?: any) {
  try {
    const token = await getToken();

    const config = {
      method,
      url: `${BASE_URL}${path}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data,
    };

    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404 || axios.isAxiosError(error) && error.response?.status === 500) {
      return null;
    }

    console.error(error);
    throw error;
  }
}

export const createProgress = async (progress: {
  clerkId: any;
  desafiosId: any;
  completo: boolean;
}) => {
  return await apiRequest("POST", "", progress);
};

export const isLicaoCompleta = async (clerkId: string, licaoId: number) => {
  return await apiRequest("GET", `/usuario/${clerkId}/licao/${licaoId}/`, null);
};

export const updateCompletoStatus = async (clerkId: any, desafioId: number) => {
  return await apiRequest(
    "PUT",
    `/usuario/${clerkId}/desafio/${desafioId}/`,
    null
  );
};

export const getByClerkIdAndDesafioId = async (
  clerkId: string,
  desafioId: number
) => {
  return await apiRequest(
    "GET",
    `/usuario/${clerkId}/desafio/${desafioId}`,
    null
  );
};

export const resetLicao = async (clerkId: any, desafioId: number) => {
  return await apiRequest("DELETE", `/${clerkId}/${desafioId}/`, null);
};
