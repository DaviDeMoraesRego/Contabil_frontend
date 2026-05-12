"use client";

import { Button } from "@/components/ui/button";
import { createStripeUrl } from "@/lib/methods/stripeUrl";
import { createStripePortal } from "@/services/subscription";
import { getUserByClerkId, updatePointsAndHearts } from "@/services/usuarioApi";
import { ClerkLoading, useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

type Props = {
  hearts: number;
  points: number;
  clerkId: string;
  hasActiveSubscription: boolean;
  userSubscription: any;
  onRefillHearts?: () => Promise<void>;
};

export const Items = ({
  hearts,
  points,
  clerkId,
  hasActiveSubscription,
  userSubscription,
  onRefillHearts,
}: Props) => {
  const [pending, startTransition] = useTransition();
  const { user } = useUser();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      try {
        const userData = await getUserByClerkId(user.id);
        setUsuario(userData.data);
      } catch (error) {
        toast.error("Erro ao buscar o usuário.");
      }
    };
    fetchUser();
  }, [user]);

  const onManage = () => {
    startTransition(async () => {
      try {
        const url = await createStripePortal(clerkId);
        if (url) window.location.href = url;
      } catch (err) {
        toast.error("Erro ao redirecionar para o portal.");
      }
    });
  };

  const onUpgrade = (plano: {
    periodo: "day" | "week" | "month" | "year";
    qtd: number;
  }) => {
    startTransition(async () => {
      try {
        const response = await createStripeUrl(clerkId, plano);
        if (response?.data) window.location.href = response.data;
      } catch (err) {
        toast.error("Erro na criação da url de pagamento!");
      }
    });
  };

  const refillHearts = () => {
    if (hearts === 5 || points < 50) return;
    startTransition(async () => {
      await updatePointsAndHearts(clerkId, 5, points - 50);
      toast.success("Corações recarregados!");
      if (onRefillHearts) onRefillHearts();
    });
  };

  const renderButton = (
    targetPlanId: string,
    label: string,
    onClick: () => void,
    isPro = false,
  ) => {
    const isActive = userSubscription?.plano === targetPlanId;

    if (!hasActiveSubscription) {
      return (
        <Button disabled={pending} onClick={onClick}>
          {label}
        </Button>
      );
    }

    if (isActive) {
      return (
        <Button disabled={pending} onClick={onManage} variant="secondary">
          {isPro ? "Ver plano" : "Detalhes"}
        </Button>
      );
    }

    return (
      <Button disabled className="opacity-50 cursor-not-allowed">
        {isPro ? "Plano já ativo" : "Item em uso"}
      </Button>
    );
  };

  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ClerkLoading>
          <Loader className="h-32 w-32 text-muted-foreground animate-spin" />
        </ClerkLoading>
      </div>
    );
  }

  return (
    <ul className="w-full">
      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image src="/recharge.png" alt="hearts" width={65} height={65} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text:xl font-bold">
            Recarregar corações
          </p>
        </div>
        <Button
          disabled={hearts === 5 || points < 50 || !hasActiveSubscription}
          onClick={refillHearts}
        >
          {hearts === 5 ? (
            "completos"
          ) : (
            <div className="flex items-center">
              <Image src="/points.svg" alt="points" width={20} height={20} />
              <p>50</p>
            </div>
          )}
        </Button>
      </div>

      <h1 className="text-neutral-700 text-lg lg:text-2xl font-bold pt-8 pb-4">
        Periodos
      </h1>
      <div className="flex items-center w-full p-1 pt-8 gap-x-4 border-t-2">
        <Image src="/day.png" alt="day" width={80} height={90} />
        <div className="flex-1">
          <p className="font-bold">Corações ilimitados - Um dia</p>
        </div>
        {renderButton("hearts-day", "Adquirir", () =>
          onUpgrade({ periodo: "day", qtd: 1 }),
        )}
      </div>

      <div className="flex items-center w-full p-1 pt-8 gap-x-4 border-t-2">
        <Image src="/week.png" alt="week" width={80} height={80} />
        <div className="flex-1">
          <p className="font-bold">Corações ilimitados - Uma semana</p>
        </div>
        {renderButton("hearts-week", "Adquirir", () =>
          onUpgrade({ periodo: "week", qtd: 1 }),
        )}
      </div>

      <h1 className="text-neutral-700 text-lg lg:text-2xl font-bold pt-8 pb-4">
        Planos
      </h1>
      <div className="flex items-center w-full p-1 pt-8 gap-x-4 border-t-2">
        <Image src="/unlimited.png" alt="month" width={80} height={80} />
        <div className="flex-1">
          <p className="font-bold">Contabil Pro - Iniciante</p>
        </div>
        {renderButton(
          "hearts-month",
          "Obter plano",
          () => onUpgrade({ periodo: "month", qtd: 1 }),
          true,
        )}
      </div>

      <div className="flex items-center w-full p-1 pt-8 gap-x-4 border-t-2">
        <Image src="/tri.png" alt="tri" width={80} height={80} />
        <div className="flex-1">
          <p className="font-bold">Contabil Pro - Médio</p>
        </div>
        {renderButton(
          "hearts-threeMonths",
          "Obter plano",
          () => onUpgrade({ periodo: "month", qtd: 3 }),
          true,
        )}
      </div>

      <div className="flex items-center w-full p-1 pt-8 gap-x-4 border-t-2">
        <Image src="/semestral.png" alt="six" width={80} height={80} />
        <div className="flex-1">
          <p className="font-bold">Contabil Pro - Avançado</p>
        </div>
        {renderButton(
          "hearts-sixMonths",
          "Obter plano",
          () => onUpgrade({ periodo: "month", qtd: 6 }),
          true,
        )}
      </div>

      <div className="flex items-center w-full p-1 pt-8 gap-x-4 border-t-2">
        <Image src="/master.png" alt="year" width={80} height={80} />
        <div className="flex-1">
          <p className="font-bold">Contabil Pro - Mestre</p>
        </div>
        {renderButton(
          "hearts-year",
          "Obter plano",
          () => onUpgrade({ periodo: "year", qtd: 1 }),
          true,
        )}
      </div>
    </ul>
  );
};
