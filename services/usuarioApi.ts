import axios from "axios";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_USUARIO;

const axiosWithAuth = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

async function apiRequest(method: string, path: string, data?: any) {
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
      data,
    };

    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
    } else if (axios.isAxiosError(error) && error.response?.status === 401) {
      toast.dismiss()
      toast.loading("Revalidando sessão...", { id: "session-reload" })
      location.reload();
    } else {
      console.error(error);
      throw error;
    }
  }
}

export const createUser = async (user: {
  clerkId: any;
  nome: any;
  email: any;
  userImgSrc: string | null;
  activeCourse: any;
  hearts: number;
  points: number;
}) => {
  return await apiRequest("POST", "", user);
};

export const getAllUsers = async () => {
  return await apiRequest("GET", "", null);
};

export const getUserByClerkId = async (ClerkId: string) => {
  return await apiRequest("GET", `/${ClerkId}/`, null);
};

export const updatePointsAndHearts = async (
  ClerkId: string,
  hearts: number,
  points: number,
) => {
  return await apiRequest("PUT", `/${ClerkId}/${hearts}/${points}`, null);
};


export const getTopRanking = async () => {
  return await apiRequest("GET", `/ranking/`, null);
};

export const getUserRank = async (ClerkId: string) => {
  return await apiRequest("GET", `/rank/${ClerkId}/`, null);
};