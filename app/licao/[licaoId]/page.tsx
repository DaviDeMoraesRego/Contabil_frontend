"use client";

import { use } from "react";
import { getAllDesafiosByLicoesId } from "@/services/dasafiosApi";
import { getById } from "@/services/licoesApi";
import { getUserByClerkId } from "@/services/usuarioApi";
import { ClerkLoading, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Quiz } from "../quiz";
import { Loader } from "lucide-react";
import { useExitModal } from "@/store/use-exit-modal";
import { getByClerkIdAndDesafioId } from "@/services/progressoDesafiosApi";
import { getSubscription } from "@/services/subscription";

type Props = {
  params: Promise<{
    licaoId: number;
  }>;
};

const LicaoIdPage = ({ params }: Props) => {
  const { licaoId } = use(params);

  const { user } = useUser();
  const [usuario, setUsuario] = useState<any>(null);
  const [licaoAtiva, setLicaoAtiva] = useState<any>(null);
  const [licao, setLicao] = useState<any>(null);
  const [porcentagem, setPorcentagemLicaoAtiva] = useState(0);
  const [desafios, setDesafios] = useState<any>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<any>(null);

  const { open } = useExitModal();

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      open();
      console.log("Usuário clicou no botão de voltar!");
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const licao = await getById(licaoId);
        console.log(licao);
        setLicaoAtiva(licao.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLesson();
  }, [licaoId]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;

      try {
        const userData = await getUserByClerkId(user.id);
        setUsuario(userData.data);
      } catch (error: any) {
        toast.error("Erro ao buscar o usuário.");
        console.error(error);
      }
    };

    fetchUser();
  }, [user]);

  useEffect(() => {
    const fecthLicao = async () => {
      if (!licaoAtiva) return;

      try {
        const licaoData = await getById(licaoAtiva.id);
        setLicao(licaoData.data);
      } catch (error) {
        toast.error("Erro ao buscar a lição.");
        console.error(error);
      }
    };

    fecthLicao();
  }, [licaoAtiva]);

  useEffect(() => {
    if (!licao || !usuario) return;

    const fetchDesafios = async () => {
      try {
        const response = await getAllDesafiosByLicoesId(licao.id);

        const desafios = await Promise.all(
          response.data.map(async (desafio: any) => {
            let completo = false;
            try {
              const progresso = await getByClerkIdAndDesafioId(
                usuario.clerkId,
                desafio.id
              );
              completo = progresso.data.completo;
            } catch (err) {
              console.error(
                `Erro ao buscar progresso do desafio ${desafio.id}:`,
                err
              );
              completo = false;
            }

            return {
              ...desafio,
              completo,
            };
          })
        );

        console.log(desafios);
        setDesafios(desafios);
      } catch (error) {
        toast.error("Erro ao buscar desafios - " + error);
        console.error(error);
      }
    };

    fetchDesafios();
  }, [licao, usuario]);

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

  if (!licao || !desafios || !usuario) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ClerkLoading>
          <Loader className="h-32 w-32 text-muted-foreground animate-spin" />
        </ClerkLoading>
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
      userSubscription={hasActiveSubscription}
      isPractice={true}
    />
  );
};

export default LicaoIdPage;
