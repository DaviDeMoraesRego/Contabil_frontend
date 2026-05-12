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
import { Progress } from "@/components/ui/progress";
import { Promo } from "@/components/promo";
import { HasPlan } from "@/components/has-plan";

import { getCourseById } from "@/services/courseApi";
import { getUserByClerkId } from "@/services/usuarioApi";
import { getSubscription } from "@/services/subscription";
import { getPercentageOfCourseConclusion } from "@/services/progressoDesafiosApi";
import { courseDetail, quests } from "@/components/constants";

const QuestsPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [completeCoursePercentage, setCompleteCoursePercentage] =
    useState<number>(0);
  const [hasActiveSubscription, setHasActiveSubscription] =
    useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    const initQuests = async () => {
      try {
        setIsLoading(true);

        const userData = await getUserByClerkId(user.id);
        const userProfile = userData.data;

        if (!userProfile) throw new Error("Usuário não encontrado");
        setUsuario(userProfile);

        if (userProfile.activeCourse === 0) {
          router.push("/courses");
          return;
        }

        const [courseData, percentageResponse, subResponse] = await Promise.all(
          [
            getCourseById(userProfile.activeCourse),
            getPercentageOfCourseConclusion(
              userProfile.clerkId,
              userProfile.activeCourse,
            ),
            getSubscription(userProfile.clerkId).catch(() => ({ data: null })),
          ],
        );

        setCourse(courseData.data);

        console.log(percentageResponse);
        setCompleteCoursePercentage(Number(percentageResponse.data) || 0);

        if (subResponse?.data) {
          const periodEnd = new Date(subResponse.data.stripeCurrentPeriodEnd);
          setHasActiveSubscription(periodEnd.getTime() > Date.now());
        } else {
          setHasActiveSubscription(false);
        }
      } catch (error) {
        console.error("Erro ao carregar Quests:", error);
        toast.error("Não foi possível carregar suas missões.");
      } finally {
        setIsLoading(false);
      }
    };

    initQuests();
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white">
        <Loader className="h-20 w-20 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!usuario || !course) return null;

  const currentCourseTitle =
    courseDetail(usuario.activeCourse, "tittle") || "Curso";
  const currentCourseImg =
    courseDetail(usuario.activeCourse, "img") || "/fallback.svg";

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6 pb-32">
      <StickyWrapper>
        <UserProgress
          activeCourse={{ imageSrc: course.imageSrc, title: course.title }}
          hearts={usuario.hearts}
          points={usuario.points}
          hasActiveSubscription={hasActiveSubscription}
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
              const progress = Math.min(
                (usuario.points / quest.value) * 100,
                100,
              );

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
            Maestria: {currentCourseTitle}
          </h1>

          <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
            <Image
              src={currentCourseImg}
              alt="Course Mastery"
              width={60}
              height={60}
            />
            <div className="flex flex-col gap-y-2 w-full">
              <p className="text-neutral-700 text-xl font-bold">
                Complete o curso "{currentCourseTitle}"
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
