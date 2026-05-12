import axios from "axios";
import { getToken } from "./authTokenManager";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_SUBSCRIPTION;

const axiosWithAuth = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function apiRequest(method: string, path: string, data?: any) {
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
      return null;
    } else if (axios.isAxiosError(error) && error.response?.status === 401) {
      toast.dismiss()
      toast.loading("Revalidando sessão...", { id: "session-reload" })
      location.reload();
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

export const updateSubscription = async (
  subscription: {
    stripePriceId: string;
    stripeCurrentPeriodEnd: Date;
  },
  ClerkId: any,
) => {
  return await apiRequest("PUT", `/${ClerkId}`, subscription);
};

export const getSubscription = async (ClerkId: any) => {
  return await apiRequest("GET", `/${ClerkId}`, null);
};

export const createStripePortal = async (clerkId: string) => {
  return await apiRequest("POST", `/portal/${clerkId}`);
};