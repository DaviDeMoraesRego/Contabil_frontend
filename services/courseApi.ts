import axios from "axios";
import { getToken } from "./authTokenManager";

const BASE_URL = process.env.NEXT_PUBLIC_API_COURSES;

const axiosWithAuth = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

async function apiRequest(method: string, path: string) {
  try {

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
    throw err;
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
