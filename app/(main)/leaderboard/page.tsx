"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { HasPlan } from "@/components/has-plan";

import { getCourseById } from "@/services/courseApi";
import {
  getTopRanking,
  getUserRank,
  getUserByClerkId,
} from "@/services/usuarioApi";
import { getSubscription } from "@/services/subscription";

const LeaderboardPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [userPosition, setUserPosition] = useState<number | string>("--");
  const [hasActiveSubscription, setHasActiveSubscription] =
    useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    const initLeaderboard = async () => {
      try {
        setIsLoading(true);

        const { data: userProfile } = await getUserByClerkId(user.id);
        if (!userProfile) throw new Error("Usuário não encontrado");
        setUsuario(userProfile);

        if (userProfile.activeCourse === 0) {
          router.push("/courses");
          return;
        }

        const [courseData, subResponse, rankingResponse, rankResp] =
          await Promise.all([
            getCourseById(userProfile.activeCourse),
            getSubscription(userProfile.clerkId).catch(() => ({ data: null })),
            getTopRanking(),
            getUserRank(userProfile.clerkId).catch(() => ({ data: 0 })),
          ]);

        setCourse(courseData.data);
        setUserPosition(rankResp.data);

        if (subResponse?.data) {
          const periodEnd = new Date(subResponse.data.stripeCurrentPeriodEnd);
          setHasActiveSubscription(periodEnd.getTime() > Date.now());
        }

        const top200 = rankingResponse.data.map((u: any, index: number) => ({
          ...u,
          rank: index + 1,
          isCurrentUser: u.clerkId === userProfile.clerkId,
        }));

        setRanking(top200);
      } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        toast.error("Não foi possível carregar o ranking.");
      } finally {
        setIsLoading(false);
      }
    };

    initLeaderboard();
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader className="h-20 w-20 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!usuario || !course) return null;

  return (
    <div className="flex flex-row-reverse lg:flex-row-reverse gap-6 lg:gap-[48px] px-4 lg:px-6 pb-6 lg:pb-32">
      <StickyWrapper>
        <UserProgress
          activeCourse={{ imageSrc: course.imageSrc, title: course.title }}
          hearts={usuario.hearts}
          points={usuario.points}
          hasActiveSubscription={hasActiveSubscription}
        />
        {!hasActiveSubscription ? <Promo /> : <HasPlan />}
        <Quests points={usuario.points} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image
            src="/leaderboard-star.svg"
            alt="Ranking"
            width={125}
            height={105}
          />
          <h1 className="text-center font-bold text-neutral-800 text-2xl lg:text-3xl my-4 lg:my-6">
            Ranking
          </h1>
          <p className="text-muted-foreground text-center text-lg mb-6">
            Veja sua posição entre os outros estudantes da comunidade!
          </p>

          <Separator className="mb-4 h-0.5 rounded-full" />

          <div className="w-full flex flex-col gap-y-1">
            {ranking.map((u) => (
              <div
                key={u.clerkId}
                className={`flex items-center w-full p-2 lg:p-3 px-2 lg:px-4 rounded-xl transition 
                  ${u.isCurrentUser ? "bg-lime-100 border border-lime-400 shadow-sm" : "hover:bg-gray-100"}
                `}
              >
                <p className="font-bold text-lime-700 w-8">{u.rank}</p>
                <Avatar className="border bg-gray-100 h-12 w-12 ml-3 mr-6 shadow-sm">
                  <AvatarImage className="object-cover" src={u.userImgSrc} />
                  <AvatarFallback className="font-bold text-neutral-400">
                    {u.nome?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-bold text-neutral-800 flex-1 truncate min-w-0 mr-2">
                  {u.nome}
                </p>
                <p className="text-muted-foreground font-medium">
                  {u.points} <span className="text-xs">XP</span>
                </p>
              </div>
            ))}
          </div>

          <div className="w-full mt-6">
            <Separator className="my-6 h-0.5 rounded-full" />
            <div className="flex items-center w-full p-3 lg:p-4 rounded-xl bg-blue-50 border border-blue-300 shadow-lg sticky bottom-6 z-10 transition-all">
              <p className="font-bold text-blue-700 w-8">{userPosition}</p>
              <Avatar className="border-2 border-blue-400 bg-white h-12 w-12 ml-3 mr-6">
                <AvatarImage
                  className="object-cover"
                  src={usuario.userImgSrc}
                />
                <AvatarFallback className="font-bold text-blue-400">
                  {usuario.nome?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="font-bold text-neutral-800 flex-1 truncate">
                {usuario.nome} (Você)
              </p>
              <p className="text-blue-700 font-bold">{usuario.points} XP</p>
            </div>
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default LeaderboardPage;
