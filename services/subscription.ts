import axios from "axios";
import { getToken } from "./authTokenManager";

const BASE_URL = process.env.NEXT_PUBLIC_API_SUBSCRIPTION;

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
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    } else {
      console.error(error);
      return;
    }
  }
}

export const createSubscription = async (subscription: {
  clerkId: any;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeCurrentPeriodEnd: Date;
  plano: string;
}) => {
  return await apiRequest("POST", "", subscription);
};

export const updateSubscription = async (subscription: {
  stripePriceId: string;
  stripeCurrentPeriodEnd: Date;
}, ClerkId: any) => {
  return await apiRequest("PUT", `/${ClerkId}/`, subscription);
};

export const getSubscription = async (ClerkId: any) => {
  return await apiRequest("GET", `/${ClerkId}/`, null);
};