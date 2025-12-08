"use client";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { getCourseById } from "@/services/courseApi";
import { getAllUsers, getUserByClerkId } from "@/services/usuarioApi";
import { ClerkLoading, useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSubscription } from "@/services/subscription";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { HasPlan } from "@/components/has-plan";

const LeaderboardPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [course, setCourse] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<
    boolean | null
  >(null);
  const [ranking, setRanking] = useState<any>(null);
  const [currentUserRank, setCurrentUserRank] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const fetchUser = async () => {
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
    if (!usuario) return;

    const fetchSubscription = async () => {
      try {
        const response = await getSubscription(usuario.clerkId);

        if (!response || !response.data) {
          setHasActiveSubscription(false);
          return;
        }

        const subscription = response.data;
        setHasActiveSubscription(subscription);

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
  }, [usuario]);

  useEffect(() => {
    if (!usuario || !course) return;

    const fetchAllUsers = async () => {
      try {
        const response = await getAllUsers();
        const data = response.data;

        const sorted = data.sort((a: any, b: any) => b.points - a.points);

        const realIndex = sorted.findIndex(
          (u: any) => u.clerkId === usuario.clerkId
        );

        const realUserRank = realIndex !== -1 ? realIndex + 1 : null;

        setCurrentUserRank({
          ...usuario,
          rank: realUserRank,
          isCurrentUser: true,
        });

        const top200 = sorted.slice(0, 200);

        const enhanced = top200.map((u: any, index: number) => ({
          ...u,
          rank: index + 1,
          isCurrentUser: u.clerkId === usuario.clerkId,
        }));

        setRanking(enhanced);
      } catch (error) {
        console.log("Erro ao buscar ranking:", error);
      }
    };

    fetchAllUsers();
  }, [usuario, course]);

  if (!usuario || !course || !ranking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ClerkLoading>
          <Loader className="h-32 w-32 text-muted-foreground animate-spin" />
        </ClerkLoading>
      </div>
    );
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6 pb-32">
      <StickyWrapper>
        <UserProgress
          activeCourse={{ imageSrc: course.imageSrc, title: course.title }}
          hearts={usuario.hearts}
          points={usuario.points}
          hasActiveSubscription={!!hasActiveSubscription}
        />
        {!hasActiveSubscription ? <Promo /> : <HasPlan />}
        <Quests points={usuario.points} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image
            src="/leaderboard-star.svg"
            alt="leader"
            width={125}
            height={105}
          />

          <h1 className="text-center font-bold text-neutral-800 text-3xl my-6">
            Ranking
          </h1>

          <p className="text-muted-foreground text-center text-lg mb-6">
            Veja sua posição entre os outros estudantes da comunidade!
          </p>

          <Separator className="mb-4 h-0.5 rounded-full" />

          {/* Lista de top 200 */}
          {ranking.map((u: any) => (
            <div
              key={u.clerkId}
              className={`flex items-center w-full p-3 px-4 rounded-xl transition 
                ${
                  u.isCurrentUser
                    ? "bg-lime-100 border border-lime-400 shadow-sm"
                    : "hover:bg-gray-200/50"
                }
              `}
            >
              <p className="font-bold text-lime-700 mr-4">{u.rank}</p>

              <Avatar className="border bg-gray-100 h-12 w-12 ml-3 mr-6">
                <AvatarFallback className="font-bold text-neutral-400 text-xl flex items-center justify-center">
                  {u.nome.trim().charAt(0).toUpperCase()}
                </AvatarFallback>
                <AvatarImage className="object-cover" src={u.userImgSrc} />
              </Avatar>

              <p className="font-bold text-neutral-800 flex-1">{u.nome}</p>
              <p className="text-muted-foreground">{u.points} XP</p>
            </div>
          ))}

          {/* CARD FIXO DO USUÁRIO */}
          {currentUserRank && (
            <>
              <Separator className="my-6 h-0.5 rounded-full" />

              <div className="flex items-center w-full p-3 px-4 rounded-xl bg-blue-50 border border-blue-300 shadow-sm sticky bottom-4">
                <p className="font-bold text-blue-700 mr-4">
                  {currentUserRank.rank}
                </p>

                <Avatar className="border bg-blue-400 h-12 w-12 ml-3 mr-6">
                  <AvatarImage
                    className="object-cover"
                    src={currentUserRank.userImgSrc}
                  />
                </Avatar>

                <p className="font-bold text-neutral-800 flex-1">
                  {currentUserRank.nome}
                </p>

                <p className="text-muted-foreground">
                  {currentUserRank.points} XP
                </p>
              </div>
            </>
          )}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default LeaderboardPage;
