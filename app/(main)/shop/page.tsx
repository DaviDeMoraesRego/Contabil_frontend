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
import { Items } from "./items";
import { getSubscription } from "@/services/subscription";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { HasPlan } from "@/components/has-plan";

const ShopPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [course, setCourse] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<
    boolean | null
  >(null);
  const [userSubscription, setUserSubscription] = useState<boolean | null>(
    null
  );

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
    if (!usuario) return;

    const fetchSubscription = async () => {
      try {
        const response = await getSubscription(usuario.clerkId);

        if (!response || !response.data) {
          setHasActiveSubscription(false);
          setHasActiveSubscription(null);
          return;
        }

        const subscription = response.data;
        setUserSubscription(subscription);

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

  const handleRefillHearts = async () => {
    if (!user) return;

    try {
      const userData = await getUserByClerkId(user.id);
      setUsuario(userData.data);
    } catch (error: any) {
      toast.error("Erro ao buscar o usuário.");
      console.error(error);
    }
  };

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
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={{ imageSrc: course.imageSrc, title: course.title }}
          hearts={usuario.hearts}
          points={usuario.points}
          hasActiveSubscription={!!hasActiveSubscription}
        />
        {!hasActiveSubscription ? <Promo /> : <HasPlan />}
        <Quests points={usuario.points}/>
      </StickyWrapper>

      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image src="/shopping.svg" alt="shop" width={125} height={105} />

          <h1 className="text-center font-bold text-neutral-800 text-3xl my-6">
            Loja
          </h1>

          <p className="text-muted-foreground text-center text-lg mb-6">
            Adquira itens e ganhe vantagem!
          </p>

          <Items
            hearts={usuario.hearts}
            points={usuario.points}
            clerkId={usuario.clerkId}
            hasActiveSubscription={!!hasActiveSubscription}
            userSubscription={userSubscription}
            onRefillHearts={handleRefillHearts}
          />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default ShopPage;
