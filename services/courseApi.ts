import axios from "axios";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_COURSES;

const axiosWithAuth = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

async function apiRequest(method: string, path: string) {
  try {
    const { getToken } = await import("./authTokenManager");

    const token = await getToken()
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

  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      toast.dismiss()
      toast.loading("Revalidando sessão...", { id: "session-reload" })
      location.reload();
    } else {
      console.error(err);
      return;
    }
  }
}

export const getAllCourses = async () => {
  return await apiRequest("GET", "");
};

export const getCourseById = async (id: number) => {
  return await apiRequest("GET", `/${id}/`);
};

export const getCourseByTitle = async (title: string) => {
  return await apiRequest("GET", `/title/${title}/`);
};
