"use server";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getSubscription } from "@/services/subscription";

export const createStripeUrl = async (
  usuario: any,
  clerkId: string,
  plano: { periodo: "day" | "week" | "month" | "year"; qtd: number }
) => {
  const returnUrl = absoluteUrl("/shop");

  const description_options = {
    dia: "Corações ilimitados por um dia",
    semana: "Corações ilimitados por uma semana",
    mes: "Corações ilimitados por um mês",
    tresMeses: "Corações ilimitados por três meses",
    seisMeses: "Corações ilimitados por seis meses",
    ano: "Corações ilimitados por um ano",
  };

  const prices_options = {
    dia: 300,
    semana: 1000,
    mes: 2500,
    tresMeses: 6000,
    seisMeses: 9000,
    ano: 16000,
  };

  let description = "";
  let price = 0;
  let plan = "";

  if (plano.periodo === "day" && plano.qtd === 1) {
    description = description_options.dia;
    price = prices_options.dia;
    plan = "hearts-day";
  }

  if (plano.periodo === "week" && plano.qtd === 1) {
    description = description_options.semana;
    price = prices_options.semana;
    plan = "hearts-week";
  }

  if (plano.periodo === "month" && plano.qtd === 1) {
    description = description_options.mes;
    price = prices_options.mes;
    plan = "hearts-month";
  }

  if (plano.periodo === "month" && plano.qtd === 3) {
    description = description_options.tresMeses;
    price = prices_options.tresMeses;
    plan = "hearts-threeMonths";
  }

  if (plano.periodo === "month" && plano.qtd === 6) {
    description = description_options.seisMeses;
    price = prices_options.seisMeses;
    plan = "hearts-sixMonths";
  }

  if (plano.periodo === "year" && plano.qtd === 1) {
    description = description_options.ano;
    price = prices_options.ano;
    plan = "hearts-year";
  }

  if (!description) {
    description = "Corações ilimitados";
  }

  if (!usuario) {
    return;
  }

  const data = await getSubscription(usuario.clerkId);
  const userSubscription = data ? data.data : null;

  if (userSubscription && userSubscription.stripeCustomerId) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return { data: stripeSession.url };
  }

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card", "boleto"],
    customer_email: usuario.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "BRL",
          product_data: {
            name: "Contabil Pro",
            description: description,
          },
          unit_amount: price,
          recurring: {
            interval: plano.periodo,
            interval_count: plano.qtd,
          },
        },
      },
    ],
    metadata: {
      clerkId: clerkId,
      plano: plan,
    },
    success_url: returnUrl,
    cancel_url: returnUrl,
  });

  return { data: stripeSession.url };
};
