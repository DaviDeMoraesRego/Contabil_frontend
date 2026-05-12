"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { HasPlan } from "@/components/has-plan";
import { StartLessonDialog } from "@/components/modals/startLesson-modal";
import { Header } from "./header";
import { Unit } from "./unit";

import { getUserByClerkId } from "@/services/usuarioApi";
import { getCourseById } from "@/services/courseApi";
import { getAllUnidadesByCourseId } from "@/services/unidadesApi";
import { getAllLicoesByCourseId } from "@/services/licoesApi";
import { getSubscription } from "@/services/subscription";
import {
  getDesafiosProgressoByLicao,
  getStatusLicoesByCourseId,
} from "@/services/progressoDesafiosApi";

const LearnPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [licoes, setLicoes] = useState<any[]>([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [porcentagemLicaoAtiva, setPorcentagemLicaoAtiva] = useState(0);

  const licaoAtiva = licoes.find((l) => !l.completo) || licoes[0];

  const initLearnPage = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const userRes = await getUserByClerkId(user.id);
      const userProfile = userRes.data;
      if (!userProfile) throw new Error("Usuário não encontrado");

      if (!userProfile.activeCourse) {
        router.push("/courses");
        return;
      }

      setUsuario(userProfile);
      const { clerkId, activeCourse } = userProfile;

      const [courseRes, unidadesRes, subRes, licoesRes, statusRes] =
        await Promise.all([
          getCourseById(activeCourse),
          getAllUnidadesByCourseId(activeCourse),
          getSubscription(clerkId).catch(() => ({ data: null })),
          getAllLicoesByCourseId(activeCourse),
          getStatusLicoesByCourseId(clerkId, activeCourse),
        ]);

      setCourse(courseRes.data);
      setUnidades(unidadesRes.data);

      if (subRes?.data) {
        const periodEnd = new Date(subRes.data.stripeCurrentPeriodEnd);
        setHasActiveSubscription(periodEnd.getTime() > Date.now());
      }

      const statusMap = new Map<number, boolean>(
        (statusRes?.data ?? []).map((s: any) => [s.licaoId, !!s.completo]),
      );

      const licoesComStatus = (licoesRes?.data ?? []).map((l: any) => ({
        ...l,
        completo: statusMap.get(l.id) ?? false,
      }));

      setLicoes(licoesComStatus);

      const ativa = licoesComStatus.find((l: any) => !l.completo);
      if (!ativa) return;

      const progressoRes = await getDesafiosProgressoByLicao(clerkId, ativa.id);
      const desafios: any[] = progressoRes?.data ?? [];

      if (desafios.length === 0) return;

      const concluidos = desafios.filter((d: any) => d.completo).length;
      setPorcentagemLicaoAtiva(
        Math.round((concluidos / desafios.length) * 100),
      );
    } catch (error) {
      console.error("Erro na LearnPage:", error);
      toast.error("Erro ao carregar seu progresso.");
    } finally {
      setIsLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    initLearnPage();
  }, [initLearnPage]);

  useEffect(() => {
    if (licaoAtiva && !isLoading) {
      localStorage.setItem("licaoAtiva", JSON.stringify(licaoAtiva));
      localStorage.setItem(
        "porcentagem",
        JSON.stringify(porcentagemLicaoAtiva),
      );
    }
  }, [licaoAtiva, porcentagemLicaoAtiva, isLoading]);

  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader className="h-20 w-20 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <>
      <StartLessonDialog />
      <div className="flex flex-row-reverse gap-[48px] px-6">
        <StickyWrapper>
          <UserProgress
            courseId={course.id}
            activeCourse={{ imageSrc: course.imageSrc, title: course.title }}
            hearts={usuario.hearts}
            points={usuario.points}
            hasActiveSubscription={hasActiveSubscription}
          />
          {!hasActiveSubscription ? <Promo /> : <HasPlan />}
          <Quests points={usuario.points} />
        </StickyWrapper>

        <FeedWrapper>
          <Header tittle={course.title} />
          {unidades.map((unidade) => (
            <div key={unidade.id} className="mb-10">
              <Unit
                descricao={unidade.descricao}
                titulo={unidade.titulo}
                licoes={licoes.filter((l) => l.unidadesId === unidade.id)}
                licaoAtiva={licaoAtiva}
                porcentagemLicaoAtiva={porcentagemLicaoAtiva}
              />
            </div>
          ))}
        </FeedWrapper>
      </div>
    </>
  );
};

export default LearnPage;
