"use client";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { getCourseById } from "@/services/courseApi";
import { getUserByClerkId } from "@/services/usuarioApi";
import { ClerkLoading, useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSubscription } from "@/services/subscription";
import { Progress } from "@/components/ui/progress";
import { Promo } from "@/components/promo";
import { completeCourse, courseDetail, quests } from "@/components/constants";
import { HasPlan } from "@/components/has-plan";

const QuestsPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [course, setCourse] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [completeCoursePercentage, setCompleteCoursePercentage] =
    useState<any>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<
    boolean | null
  >(null);

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
        const complete = await completeCourse(
          usuario.activeCourse,
          usuario.clerkId
        );
        setCompleteCoursePercentage(complete);
      } catch (err) {
        toast.error("Erro ao buscar curso!");
        console.error(err);
      }
    };

    fetchCourse();
  }, [usuario]);

  if (!usuario || !course || !completeCourse) {
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
      </StickyWrapper>

      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image src="/quests.svg" alt="quests" width={125} height={105} />

          <h1 className="text-center font-bold text-neutral-800 text-3xl my-6">
            Missões
          </h1>

          <p className="text-muted-foreground text-center text-lg mb-6">
            Complete missões ganhando pontos.
          </p>
          <ul className="w-full">
            {quests.map((quest: any) => {
              const progress = (usuario.points / quest.value) * 100;

              return (
                <div
                  key={quest.tittle}
                  className="flex items-center w-full p-4 gap-x-4 border-t-2"
                >
                  <Image
                    src="/points.svg"
                    alt="Points"
                    width={60}
                    height={60}
                  />
                  <div className="flex flex-col gap-y-2 w-full">
                    <p className="text-neutral-700 text-xl font-bold">
                      {quest.tittle}
                    </p>
                    <Progress value={progress} className="h-3" />
                  </div>
                </div>
              );
            })}
          </ul>
          <h1 className="text-neutral-700 text-lg lg:text-2xl font-bold pt-8 w-full gap-x-4 pb-4">
            Maestria: {courseDetail(usuario.activeCourse, "tittle")}
          </h1>
          <div
            key={usuario.activeCourse}
            className="flex items-center w-full p-4 gap-x-4 border-t-2"
          >
            <Image
              src={courseDetail(usuario.activeCourse, "img")}
              alt="Points"
              width={60}
              height={60}
            />
            <div className="flex flex-col gap-y-2 w-full">
              <p className="text-neutral-700 text-xl font-bold">
                Complete o curso "{courseDetail(usuario.activeCourse, "tittle")}
                "
              </p>
              <Progress value={completeCoursePercentage} className="h-3" />
            </div>
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default QuestsPage;
