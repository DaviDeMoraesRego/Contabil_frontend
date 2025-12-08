"use client";

import Image from "next/image";
import Confetti from "react-confetti";
import { useEffect, useState, useTransition } from "react";
import { useWindowSize } from "react-use";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { getAllOpcoesDesafiosByDesafiosId } from "@/services/opcoesDesafiosApi";
import { toast } from "sonner";
import { Challange } from "./challange";
import { ClerkLoading, useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { Footer } from "./footer";
import {
  createProgress,
  updateCompletoStatus,
} from "@/services/progressoDesafiosApi";
import { getUserByClerkId, updatePointsAndHearts } from "@/services/usuarioApi";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ResultCard } from "./result-card";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { usePracticeModal } from "@/store/use-practice-modal";

type Props = {
  activeCourse: number;
  initialLessonId: number;
  initalLessonChallanges: any;
  initialHearts: number;
  initialPoints: number;
  initialPercentage: number;
  userSubscription: Boolean;
  isPractice: boolean;
};

export const Quiz = ({
  activeCourse,
  initialLessonId,
  initalLessonChallanges,
  initialHearts,
  initialPoints,
  initialPercentage,
  userSubscription,
  isPractice,
}: Props) => {
  const [pending, startTransition] = useTransition();
  const { width, height } = useWindowSize();
  const router = useRouter();
  const { open: openHeartsModal } = useHeartsModal();
  const { open: openPracticeModal } = usePracticeModal();

  const [selectedOption, setSelectedOption] = useState<number>();
  const { user } = useUser();
  const [usuario, setUsuario] = useState<any>(null);
  const [status, setStatus] = useState<"correta" | "incorreta" | "nenhum">(
    "nenhum"
  );
  const [opcoes, setOpcoes] = useState<any>(null);
  const [hearts, setHearts] = useState(initialHearts);
  const [points, setPoints] = useState(initialPoints);
  const [percentage, setPercentage] = useState(initialPercentage);
  const [challanges] = useState(initalLessonChallanges);

  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const uncompletedIndex = challanges.findIndex(
      (challange: any) => !challange.completo
    );
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const [isFinished, setIsFinished] = useState(() => {
    if (isPractice) return false;
    return challanges.every((c: any) => c.completo);
  });

  useEffect(() => {
    if (isPractice) {
      openPracticeModal();
    }

    const fetchUser = async () => {
      if (!user) return;

      try {
        const userData = await getUserByClerkId(user.id);
        setUsuario(userData.data);
        setHearts(userData.data.hearts);
        setPoints(userData.data.points);
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
  }, [user, isPractice]);

  const challange = challanges[activeIndex];

  const onNext = () => {
    if (activeIndex + 1 >= challanges.length) {
      setIsFinished(true);
      return;
    }
    setActiveIndex(activeIndex + 1);
  };

  const onSelect = (id: number) => {
    if (status !== "nenhum") return;
    setSelectedOption(id);
  };

  const onContinue = async () => {
    if (!selectedOption || !user) return;

    if (hearts < 1 && !userSubscription) {
      openHeartsModal();
      return;
    }

    const id = usuario.clerkId;

    if (status === "incorreta") {
      setStatus("nenhum");
      setSelectedOption(undefined);
      return;
    }

    if (status === "correta") {
      onNext();
      setStatus("nenhum");
      setSelectedOption(undefined);
      return;
    }

    const opcaoCorreta = opcoes.find((opcao: any) => opcao.correta == true);
    if (!opcaoCorreta) return;

    if (opcaoCorreta.id === selectedOption) {
      startTransition(async () => {
        await updateCompletoStatus(id, challange.id);
        setStatus("correta");
        setPercentage(((activeIndex + 1) / challanges.length) * 100);
        const actualPoints = points + 10;
        setPoints(actualPoints);
        updatePointsAndHearts(usuario.clerkId, hearts, actualPoints);
        if (isPractice && hearts < 5) {
          setHearts(hearts + 1);
          updatePointsAndHearts(usuario.clerkId, hearts, actualPoints);
        }
      });
    } else {
      if (hearts < 1 && !isPractice && !userSubscription) {
        openHeartsModal();
        setHearts(0);
      }
      if (isPractice || userSubscription) {
        const actualHearts = hearts;
        const actualPoints = points > 5 ? points - 5 : 0;
        setPoints(actualPoints);
        setStatus("incorreta");
        await updatePointsAndHearts(
          usuario.clerkId,
          actualHearts,
          actualPoints
        );
        return;
      } else {
        startTransition(async () => {
          const actualHearts = hearts - 1;
          const actualPoints = points > 5 ? points - 5 : 0;
          setHearts(actualHearts);
          setPoints(actualPoints);
          setStatus("incorreta");
          await updatePointsAndHearts(
            usuario.clerkId,
            actualHearts,
            actualPoints
          );
        });
      }
    }
  };

  const title = challange?.questao;

  useEffect(() => {
    if (!challange) return;

    const fetchOpçõesDesafios = async () => {
      try {
        const response = await getAllOpcoesDesafiosByDesafiosId(challange.id);
        setOpcoes(response.data);
      } catch (error) {
        toast.error("Erro ao buscar opções - " + error);
        console.error(error);
      }
    };

    fetchOpçõesDesafios();
  }, [challange]);

  if (isFinished) {
    return (
      <>
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
        />
        <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
          <Image
            src="/finish.svg"
            alt="finish"
            className="hidden lg:block"
            height={100}
            width={100}
          />
          <Image
            src="/finish.svg"
            alt="finish"
            className="block lg:hidden"
            height={50}
            width={50}
          />
          <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
            Bom trabalho! <br /> Você completou a lição.
          </h1>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard
              variant="pontos"
              value={points}
              hasActiveSubscription={false}
            />
            <ResultCard
              variant="corações"
              value={hearts}
              hasActiveSubscription={!!userSubscription}
            />
          </div>
        </div>
        <Footer
          lessonId={initialLessonId}
          status="completo"
          onCheck={() => router.push("/learn")}
        />
      </>
    );
  }

  if (!opcoes || !usuario) {
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
      <Header
        activeCourse={activeCourse}
        hearts={hearts}
        points={points}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription}
        clerkId={usuario.clerkId}
        desafios={challanges}
      />
      <div className="flex-1 flex items-center justify-center">
        <div
          className="
      w-full max-w-[600px]
      h-[70vh]
      flex flex-col
      justify-between
      px-6 lg:px-0
    "
        >
          <h1 className="text-lg lg:text-3xl text-center font-bold text-neutral-700 line-clamp-none break-words">
            {title}
          </h1>

          <div className="flex-1 overflow-hidden flex flex-col justify-center">
            {challange.tipo === "ASSIST" && (
              <QuestionBubble question={challange.questao} />
            )}

            <div className="flex-1 overflow-auto pt-3">
              <Challange
                options={opcoes}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type={challange.tipo}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
      />
    </>
  );
};
