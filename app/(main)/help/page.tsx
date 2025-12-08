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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { contacts, partners } from "@/components/constants";
import { Quests } from "@/components/quests";
import { HasPlan } from "@/components/has-plan";

const HelpPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [course, setCourse] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
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
      } catch (err) {
        toast.error("Erro ao buscar curso!");
        console.error(err);
      }
    };

    fetchCourse();
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
    <div className="flex flex-row-reverse gap-[48px] px-6 pb-32">
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
          <Image src="/help.svg" alt="help" width={125} height={105} />

          <h1 className="text-center font-bold text-neutral-800 text-3xl my-6">
            Ajuda
          </h1>

          <p className="text-muted-foreground text-center text-lg mb-6">
            Entre em contato conosco!
          </p>
          <ul className="w-full">
            <h2 className="text-neutral-700 text-lg font-bold">
              Suporte e dúvidas
            </h2>
            {contacts.map((contact: any) => {
              return (
                <div
                  key={contact.tittle}
                  className="flex items-center w-full p-4 gap-x-4 border-t-2"
                >
                  <Image
                    src={contact.imgUrl}
                    alt="contact"
                    width={60}
                    height={60}
                  />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-neutral-700 text-xl font-bold">
                      {contact.tittle}
                    </p>
                    <Button>
                      <Link href={contact.url}>entrar em contato</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </ul>
          <ul className="w-full pt-8">
            <h2 className="text-neutral-700 text-xl font-bold">
              Negócios e parcerias
            </h2>
            {partners.map((partner: any) => {
              return (
                <div
                  key={partner.tittle}
                  className="flex items-center w-full p-4 gap-x-4 border-t-2"
                >
                  <Image
                    src={partner.imgUrl}
                    alt="contact"
                    width={60}
                    height={60}
                  />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-neutral-700 text-xl font-bold">
                      {partner.tittle}
                    </p>
                    <Button>
                      <Link href={partner.url}>Propor parceria</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </ul>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default HelpPage;
