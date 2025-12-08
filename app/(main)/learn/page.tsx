"use client";

import { StickyWrapper } from "@/components/sticky-wrapper";
import { Header } from "./header";
import { useEffect, useState } from "react";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ClerkLoading, useUser } from "@clerk/nextjs";
import { getUserByClerkId } from "@/services/usuarioApi";
import { getCourseById } from "@/services/courseApi";
import { Loader } from "lucide-react";
import { getAllUnidadesByCourseId } from "@/services/unidadesApi";
import { getAllLicoesByUnidadesId } from "@/services/licoesApi";
import {
  createProgress,
  getByClerkIdAndDesafioId,
  isLicaoCompleta,
} from "@/services/progressoDesafiosApi";
import { Unit } from "./unit";
import axios from "axios";
import { getAllDesafiosByLicoesId } from "@/services/dasafiosApi";
import { StartLessonDialog } from "@/components/modals/startLesson-modal";
import { getSubscription } from "@/services/subscription";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { HasPlan } from "@/components/has-plan";

const LearnPage = () => {
  const { user } = useUser();
  const [usuario, setUsuario] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [unidades, setUnidades] = useState<any>([]);
  const [licoes, setLicoes] = useState<any>([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<any>([]);
  const router = useRouter();
  const [porcentagemLicaoAtiva, setPorcentagemLicaoAtiva] = useState<number>(0);

  // --- fetch user (igual)
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;

      try {
        const userData = await getUserByClerkId(user.id);
        console.log("userData = ", userData);
        setUsuario(userData.data);
      } catch (error: any) {
        if (
          (axios.isAxiosError(error) && error.response?.status === 404) ||
          usuario === null
        ) {
          location.reload();
        } else {
          toast.error("Erro ao buscar o usuário.");
          console.error(error);
          return;
        }
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // --- fetch course (igual)
  useEffect(() => {
    if (!usuario) return;

    const fetchCourse = async () => {
      if (usuario.activeCourse === 0) {
        router.push("/courses");
        return;
      }

      try {
        const courseData = await getCourseById(usuario.activeCourse);
        setCourse(courseData.data);
      } catch (err) {
        toast.error("Erro ao buscar curso!");
        console.error(err);
      }
    };

    fetchCourse();
  }, [usuario, router]);

  // --- fetch unidades (igual)
  useEffect(() => {
    if (!course) return;

    const fetchUnidades = async () => {
      try {
        const unidadesData = await getAllUnidadesByCourseId(course.id);
        setUnidades(unidadesData.data);
      } catch (error) {
        toast.error("Erro ao encontrar unidades - " + error);
        throw error;
      }
    };

    fetchUnidades();
  }, [course]);

  // --- fetch all licoes + status otimizado
  useEffect(() => {
    // só roda quando houver unidades carregadas e usuario disponível
    if (!usuario || !unidades || unidades.length === 0) return;

    const fetchLicoes = async () => {
      try {
        // 1) Pegar todas as lições de todas as unidades em paralelo
        const respostas = await Promise.allSettled(
          unidades.map((unidade: any) => getAllLicoesByUnidadesId(unidade.id))
        );

        // extrair dados válidos
        const todasLicoes: any[] = [];
        for (const res of respostas) {
          if (res.status === "fulfilled" && res.value && res.value.data) {
            todasLicoes.push(...res.value.data);
          } else {
            // se uma unidade falhar, logamos e continuamos
            console.warn("Falha ao buscar lições de uma unidade:", res);
          }
        }

        if (todasLicoes.length === 0) {
          setLicoes([]);
          return;
        }

        // 2) Fazer todas as checagens de completude em paralelo (uma única batch de requests paralelos)
        const statusPromises = todasLicoes.map((licao: any) =>
          isLicaoCompleta(usuario.clerkId, licao.id)
        );

        const statusResults = await Promise.allSettled(statusPromises);

        const licoesComStatus = todasLicoes.map((licao: any, idx: number) => {
          const res = statusResults[idx];
          let completo = false;

          if (res.status === "fulfilled") {
            const value = res.value;
            // seu serviço pode devolver `{ data: ... }` ou `...`; tentamos compatibilidade
            if (value == null) {
              completo = false;
            } else if (typeof value === "object" && "data" in value) {
              completo = !!value.data;
            } else {
              completo = !!value;
            }
          } else {
            // se houve erro, consideramos incompleto, mas não quebramos tudo
            console.warn(`Erro ao checar completude da lição ${licao.id}:`, res.reason);
            completo = false;
          }

          return {
            ...licao,
            completo,
          };
        });

        // 3) setState uma vez só
        setLicoes(licoesComStatus);
      } catch (error) {
        toast.error("Erro ao encontrar licoes - " + error);
        console.error(error);
        throw error;
      }
    };

    fetchLicoes();
  }, [unidades, usuario]);

  const licaoAtiva =
    licoes && licoes.length > 0
      ? licoes.find((licao: any) => licao.completo === false)
      : null;

  useEffect(() => {
    if (licaoAtiva) {
      localStorage.setItem("licaoAtiva", JSON.stringify(licaoAtiva));
      localStorage.setItem(
        "porcentagem",
        JSON.stringify(porcentagemLicaoAtiva)
      );
    }
  }, [licaoAtiva, porcentagemLicaoAtiva]);

  // --- carregar progresso da lição ativa (otimizado)
  useEffect(() => {
    if (!licaoAtiva || !usuario) {
      setPorcentagemLicaoAtiva(0);
      return;
    }

    const carregarProgresso = async () => {
      try {
        const response = await getAllDesafiosByLicoesId(licaoAtiva.id);
        const desafios = response?.data ?? [];

        if (!desafios || desafios.length === 0) {
          setPorcentagemLicaoAtiva(0);
          return;
        }

        // 1) buscar todos os progressos em paralelo (sem aguardar create)
        const progressoPromises = desafios.map((desafio: any) =>
          getByClerkIdAndDesafioId(usuario.clerkId, desafio.id)
        );

        const progressoResults = await Promise.allSettled(progressoPromises);

        // 2) identificar quais precisam ser criados (404 / null / failed)
        const toCreate: { clerkId: any; desafiosId: any }[] = [];
        const completedFlags: boolean[] = [];

        for (let i = 0; i < progressoResults.length; i++) {
          const res = progressoResults[i];
          const desafio = desafios[i];

          if (res.status === "fulfilled") {
            const value = res.value;

            // compatibilidade com os possíveis formatos (valor nulo, objeto com data, ou objeto direto)
            if (value == null) {
              toCreate.push({
                clerkId: usuario.clerkId,
                desafiosId: desafio.id,
              });
              completedFlags.push(false);
            } else {
              // tenta extrair 'completo' de diferentes formatos
              let completo = false;
              if (typeof value === "object" && "data" in value) {
                completo = !!value.data?.completo;
              } else if (typeof value === "object" && "completo" in value) {
                completo = !!value.completo;
              } else {
                completo = false;
              }
              completedFlags.push(completo);
            }
          } else {
            // se falhou (ex: network error), tentamos criar e consideramos false por enquanto
            console.warn("Erro ao buscar progresso (vai criar):", res.reason);
            toCreate.push({
              clerkId: usuario.clerkId,
              desafiosId: desafio.id,
            });
            completedFlags.push(false);
          }
        }

        // 3) criar progressos faltantes em paralelo (se houver)
        if (toCreate.length > 0) {
          await Promise.allSettled(
            toCreate.map((p) =>
              createProgress({ clerkId: p.clerkId, desafiosId: p.desafiosId, completo: false })
            )
          );
        }

        // 4) já temos flags de completude (os criados são false). Calcular porcentagem.
        const concluidos = completedFlags.filter((f) => f).length;
        const porcentagem = Math.round((concluidos / desafios.length) * 100);
        setPorcentagemLicaoAtiva(porcentagem);
      } catch (err) {
        console.error("Erro ao calcular porcentagem da lição ativa:", err);
        setPorcentagemLicaoAtiva(0);
      }
    };

    carregarProgresso();
  }, [licaoAtiva, usuario]);

  // --- subscription (igual)
  useEffect(() => {
    if (!usuario) return;

    const fetchSubscription = async () => {
      try {
        const response = await getSubscription(usuario.clerkId);

        if (!response || !response.data) {
          setHasActiveSubscription(false);
          return;
        }

        const subscription = response.data;

        const periodEnd = new Date(subscription.stripeCurrentPeriodEnd);

        const isActive = periodEnd.getTime() > Date.now();

        setHasActiveSubscription(isActive);
      } catch (error) {
        console.error("erro ", error);
        setHasActiveSubscription(false);
      }
    };

    fetchSubscription();
  }, [usuario]);

  if (!usuario || !course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ClerkLoading>
          <Loader className="h-32 w-32 text-muted-foreground animate-spin" />
        </ClerkLoading>
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
            hasActiveSubscription={!!hasActiveSubscription}
          />
          {!hasActiveSubscription ? <Promo /> : <HasPlan />}
          <Quests points={usuario.points} />
        </StickyWrapper>
        <FeedWrapper>
          <Header tittle={course.title} />
          {unidades.map((unidade: any) => (
            <div key={unidade.id} className="mb-10">
              <Unit
                descricao={unidade.descricao}
                titulo={unidade.titulo}
                licoes={licoes.filter(
                  (licao: any) => licao.unidadesId === unidade.id
                )}
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
