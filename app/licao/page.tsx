"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import { Quiz } from "./quiz";
import { useExitModal } from "@/store/use-exit-modal";

import { getById } from "@/services/licoesApi";
import { getUserByClerkId } from "@/services/usuarioApi";
import { getAllDesafiosByLicoesId } from "@/services/dasafiosApi";
import {
  getByClerkIdAndDesafioId,
  getDesafiosProgressoByLicao,
} from "@/services/progressoDesafiosApi";
import { getSubscription } from "@/services/subscription";

const LicaoPage = () => {
  const { user } = useUser();
  const { open } = useExitModal();

  const [isLoading, setIsLoading] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [licao, setLicao] = useState<any>(null);
  const [desafios, setDesafios] = useState<any[]>([]);
  const [porcentagem, setPorcentagem] = useState(0);
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

  const initLesson = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const storedLicao = localStorage.getItem("licaoAtiva");
      const storedPct = localStorage.getItem("porcentagem");

      if (!storedLicao) {
        toast.error("Nenhuma lição ativa encontrada.");
        return;
      }

      const parsedLicao = JSON.parse(storedLicao);
      setPorcentagem(storedPct ? JSON.parse(storedPct) : 0);

      const [userRes, licaoFullRes, desafiosRes, progressoRes, subRes] =
        await Promise.all([
          getUserByClerkId(user.id),
          getById(parsedLicao.id),
          getAllDesafiosByLicoesId(parsedLicao.id),
          getDesafiosProgressoByLicao(user.id, parsedLicao.id),
          getSubscription(user.id).catch(() => ({ data: null })),
        ]);

      setUsuario(userRes.data);
      setLicao(licaoFullRes.data);

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
      toast.error("Erro ao carregar lição.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    initLesson();
  }, [initLesson]);

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
      initialPercentage={porcentagem}
      userSubscription={hasSubscription}
      isPractice={false}
    />
  );
};

export default LicaoPage;
