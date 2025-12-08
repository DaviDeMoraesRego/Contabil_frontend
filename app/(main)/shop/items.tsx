"use client";

import { Button } from "@/components/ui/button";
import { createStripeUrl } from "@/lib/methods/stripeUrl";
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

  const renderButton = (
    hasActiveSubscription: boolean,
    activePlan: string | null,
    targetPlanId: string,
    pending: boolean,
    onClick: () => void
  ) => {
    if (!hasActiveSubscription) {
      return (
        <Button disabled={pending} onClick={onClick}>
          Adquirir
        </Button>
      );
    }

    if (activePlan === targetPlanId) {
      return (
        <Button disabled={pending} onClick={onClick} variant="secondary">
          Detalhes
        </Button>
      );
    }

    return (
      <Button disabled className="opacity-50 cursor-not-allowed">
        Item em uso
      </Button>
    );
  };

  const renderProButton = (
    hasActiveSubscription: boolean,
    activePlan: string | null,
    targetPlanId: string,
    pending: boolean,
    onClick: () => void
  ) => {
    if (!hasActiveSubscription) {
      return (
        <Button disabled={pending} onClick={onClick}>
          Obter plano
        </Button>
      );
    }

    if (activePlan === targetPlanId) {
      return (
        <Button disabled={pending} onClick={onClick} variant="secondary">
          Ver plano
        </Button>
      );
    }

    return (
      <Button disabled className="opacity-50 cursor-not-allowed">
       Plano já ativo
      </Button>
    );
  };

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

  const refillHearts = () => {
    if (hearts === 5 || points < 50) return;

    startTransition(async () => {
      await updatePointsAndHearts(clerkId, 5, points - 50);
      toast.success("Corações recarregados!");

      if (onRefillHearts) onRefillHearts();
    });
  };

  const onUpgrade = (plano: {
    periodo: "day" | "week" | "month" | "year";
    qtd: number;
  }) => {
    if (!usuario) return;

    startTransition(async () => {
      try {
        const response = await createStripeUrl(usuario, clerkId, plano);
        if (response?.data) window.location.href = response.data;
      } catch (err) {
        toast.error("erro na criação da url de pagamento!");
      }
    });
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

  const active = userSubscription?.plano ?? null;

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

      <h1 className="text-neutral-700 text-lg lg:text-2xl font-bold pt-8 w-full gap-x-4 pb-4">
        Periodos
      </h1>

      {/* DIARIO */}
      <div className="flex items-center w-full p-1 pt-8 gap-x-4 border-t-2">
        <Image src="/day.png" alt="unlimited" width={80} height={90} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text:xl font-bold">
            Corações ilimitados - Um dia
          </p>
        </div>

        {renderButton(
          hasActiveSubscription,
          active,
          "hearts-day",
          pending,
          () => onUpgrade({ periodo: "day", qtd: 1 })
        )}
      </div>

      {/* SEMANAL */}
      <div className="flex items-center w-full p-1 pt-8 gap-x-4 border-t-2">
        <Image src="/week.png" alt="unlimited" width={80} height={80} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text:xl font-bold">
            Corações ilimitados - Uma semana
          </p>
        </div>

        {renderButton(
          hasActiveSubscription,
          active,
          "hearts-week",
          pending,
          () => onUpgrade({ periodo: "week", qtd: 1 })
        )}
      </div>

      <h1 className="text-neutral-700 text-lg lg:text-2xl font-bold pt-8 w-full gap-x-4 pb-4">
        Planos
      </h1>

      {/* MENSAL */}
      <div className="flex items-center w-full p-1 pt-8 gap-x-4 border-t-2">
        <Image src="/unlimited.png" alt="unlimited" width={80} height={80} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text:xl font-bold">
            Contabil Pro - Iniciante
          </p>
        </div>

        {renderProButton(
          hasActiveSubscription,
          active,
          "hearts-month",
          pending,
          () => onUpgrade({ periodo: "month", qtd: 1 })
        )}
      </div>

      {/* TRIMESTRAL */}
      <div className="flex items-center w-full p-1 pt-8 gap-x-4 border-t-2">
        <Image src="/tri.png" alt="unlimited" width={80} height={80} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text:xl font-bold">
            Contabil Pro - Intermediário
          </p>
        </div>

        {renderProButton(
          hasActiveSubscription,
          active,
          "hearts-threeMonths",
          pending,
          () => onUpgrade({ periodo: "month", qtd: 3 })
        )}
      </div>

      {/* SEMESTRAL */}
      <div className="flex items-center w-full p-1 pt-8 gap-x-4 border-t-2">
        <Image src="/semestral.png" alt="unlimited" width={80} height={80} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text:xl font-bold">
            Contabil Pro - Avançado
          </p>
        </div>

        {renderProButton(
          hasActiveSubscription,
          active,
          "hearts-sixMonths",
          pending,
          () => onUpgrade({ periodo: "month", qtd: 6 })
        )}
      </div>

      {/* ANUAL */}
      <div className="flex items-center w-full p-1 pt-8 gap-x-4 border-t-2">
        <Image src="/master.png" alt="unlimited" width={80} height={80} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text:xl font-bold">
            Contabil Pro - Mestre
          </p>
        </div>

        {renderProButton(
          hasActiveSubscription,
          active,
          "hearts-year",
          pending,
          () => onUpgrade({ periodo: "year", qtd: 1 })
        )}
      </div>
    </ul>
  );
};
