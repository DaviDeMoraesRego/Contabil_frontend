"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { HasPlan } from "@/components/has-plan";
import { Items } from "./items";

import { getCourseById } from "@/services/courseApi";
import { getUserByClerkId } from "@/services/usuarioApi";
import { getSubscription } from "@/services/subscription";

const ShopPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [hasActiveSubscription, setHasActiveSubscription] =
    useState<boolean>(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  const initShop = useCallback(async () => {
    if (!user) return;

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

      const [courseData, subResponse] = await Promise.all([
        getCourseById(userProfile.activeCourse),
        getSubscription(userProfile.clerkId).catch(() => ({ data: null })),
      ]);

      setCourse(courseData.data);

      if (subResponse?.data) {
        const sub = subResponse.data;
        setUserSubscription(sub);

        const periodEnd = new Date(sub.stripeCurrentPeriodEnd);
        const isActive =
          periodEnd.getTime() > Date.now() && sub.stripePriceId !== "free";

        setHasActiveSubscription(isActive);
      } else {
        setHasActiveSubscription(false);
      }
    } catch (error) {
      console.error("Erro ao carregar loja:", error);
      toast.error("Erro ao carregar a loja.");
    } finally {
      setIsLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    initShop();
  }, [initShop]);

  const handleRefillHearts = async () => {
    try {
      const userData = await getUserByClerkId(user?.id as string);
      setUsuario(userData.data);
    } catch (error) {
      console.error("Erro ao atualizar dados após compra:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader className="h-20 w-20 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!usuario || !course) return null;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
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
          <Image src="/shopping.svg" alt="Loja" width={125} height={105} />

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
            hasActiveSubscription={hasActiveSubscription}
            userSubscription={userSubscription}
            onRefillHearts={handleRefillHearts}
          />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default ShopPage;
