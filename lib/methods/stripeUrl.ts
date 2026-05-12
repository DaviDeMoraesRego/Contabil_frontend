import { apiRequest } from "@/services/subscription";

export const createStripeUrl = async (
  clerkId: string,
  plano: { periodo: "day" | "week" | "month" | "year"; qtd: number }
) => {
  return await apiRequest("POST", "/checkout", {
    clerkId,
    periodo: plano.periodo,
    qtd: plano.qtd,
  });
};