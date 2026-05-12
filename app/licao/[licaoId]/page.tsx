"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import { Quiz } from "../quiz";
import { useExitModal } from "@/store/use-exit-modal";

import { getById } from "@/services/licoesApi";
import { getUserByClerkId } from "@/services/usuarioApi";
import { getAllDesafiosByLicoesId } from "@/services/dasafiosApi";
import {
  getByClerkIdAndDesafioId,
  getDesafiosProgressoByLicao,
} from "@/services/progressoDesafiosApi";
import { getSubscription } from "@/services/subscription";

type Props = { params: Promise<{ licaoId: number }> };

const LicaoIdPage = ({ params }: Props) => {
  const { licaoId } = use(params);
  const { user } = useUser();
  const { open } = useExitModal();

  const [isLoading, setIsLoading] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [licao, setLicao] = useState<any>(null);
  const [desafios, setDesafios] = useState<any[]>([]);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      open();
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [open]);

  const initPractice = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const [userRes, licaoRes, desafiosRes, progressoRes, subRes] =
        await Promise.all([
          getUserByClerkId(user.id),
          getById(licaoId),
          getAllDesafiosByLicoesId(licaoId),
          getDesafiosProgressoByLicao(user.id, licaoId),
          getSubscription(user.id).catch(() => ({ data: null })),
        ]);

      setUsuario(userRes.data);
      setLicao(licaoRes.data);

      const progressoMap = new Map<number, boolean>(
        (progressoRes?.data ?? []).map((p: any) => [p.desafioId, !!p.completo]),
      );

      setDesafios(
        (desafiosRes?.data ?? []).map((d: any) => ({
          ...d,
          completo: progressoMap.get(d.id) ?? false,
        })),
      );

      if (subRes?.data) {
        setHasSubscription(
          new Date(subRes.data.stripeCurrentPeriodEnd).getTime() > Date.now(),
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar prática.");
    } finally {
      setIsLoading(false);
    }
  }, [user, licaoId]);

  useEffect(() => {
    initPractice();
  }, [initPractice]);

  if (isLoading || !usuario || !licao) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader className="h-20 w-20 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <Quiz
      activeCourse={usuario.activeCourse}
      initialLessonId={licao.id}
      initalLessonChallanges={desafios}
      initialHearts={usuario.hearts}
      initialPoints={usuario.points}
      initialPercentage={0}
      userSubscription={hasSubscription}
      isPractice={true}
    />
  );
};

export default LicaoIdPage;
