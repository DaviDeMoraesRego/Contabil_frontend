import axios from "axios";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_OPCOES_DESAFIOS;

const axiosWithAuth = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

async function apiRequest(method: string, path: string) {
  try {
    const { getToken } = await import("./authTokenManager");
    const token = await getToken();

    const config = {
      method,
      url: `${BASE_URL}${path}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      toast.dismiss()
      toast.loading("Revalidando sessão...", { id: "session-reload" })
      location.reload();
    } else {
      console.error(error);
      return;
    }
  }
}

export const getAllOpcoesDesafiosByDesafiosId = async (desafiosId: number) => {
  return await apiRequest("GET", `/opcoes-desafios/${desafiosId}/`);
};

export const getAllOpcoesByLicaoId = async (licaoId: number) => {
  return await apiRequest("GET", `/todas-opcoes-desafios/${licaoId}/`);
};

export const getById = async (id: number) => {
  return await apiRequest("GET", `/${id}/`);
};
