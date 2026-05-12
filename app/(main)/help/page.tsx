"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Promo } from "@/components/promo";
import { Button } from "@/components/ui/button";
import { Quests } from "@/components/quests";
import { HasPlan } from "@/components/has-plan";

import { getCourseById } from "@/services/courseApi";
import { getUserByClerkId } from "@/services/usuarioApi";
import { getSubscription } from "@/services/subscription";
import { contacts, partners } from "@/components/constants";

const HelpPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [hasActiveSubscription, setHasActiveSubscription] =
    useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    const initHelpPage = async () => {
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
          const periodEnd = new Date(subResponse.data.stripeCurrentPeriodEnd);
          setHasActiveSubscription(periodEnd.getTime() > Date.now());
        } else {
          setHasActiveSubscription(false);
        }
      } catch (error) {
        console.error("Erro ao carregar página de ajuda:", error);
        toast.error("Erro ao carregar informações de suporte.");
      } finally {
        setIsLoading(false);
      }
    };

    initHelpPage();
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
    // Mudança principal: flex-col para mobile, flex-row-reverse para desktop
    <div className="flex flex-col md:flex-row-reverse gap-6 md:gap-[48px] px-4 md:px-6 pb-32">
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
            src="/help.svg"
            alt="help"
            width={100}
            height={100}
            className="md:w-[125px] md:h-[105px]"
          />

          <h1 className="text-center font-bold text-neutral-800 text-2xl md:text-3xl my-4 md:my-6">
            Ajuda
          </h1>

          <p className="text-muted-foreground text-center text-base md:text-lg mb-6">
            Entre em contato conosco!
          </p>

          {/* Seção Suporte */}
          <section className="w-full">
            <h2 className="text-neutral-700 text-lg font-bold mb-4 px-2">
              Suporte e dúvidas
            </h2>
            <div className="flex flex-col bg-white rounded-xl border-2 border-b-4 border-neutral-200">
              {contacts.map((contact: any, index: number) => (
                <div
                  key={contact.tittle}
                  className={`flex flex-col sm:flex-row items-center w-full p-4 gap-4 ${index !== 0 ? "border-t-2" : ""}`}
                >
                  <div className="bg-neutral-100 p-2 rounded-lg">
                    <Image
                      src={contact.imgUrl}
                      alt={contact.tittle}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between w-full text-center sm:text-left gap-4">
                    <p className="text-neutral-700 text-lg md:text-xl font-bold">
                      {contact.tittle}
                    </p>
                    <Button asChild className="w-full sm:w-auto">
                      <Link href={contact.url}>Entrar em contato</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seção Parcerias */}
          <section className="w-full pt-10">
            <h2 className="text-neutral-700 text-lg font-bold mb-4 px-2">
              Negócios e parcerias
            </h2>
            <div className="flex flex-col bg-white rounded-xl border-2 border-b-4 border-neutral-200">
              {partners.map((partner: any, index: number) => (
                <div
                  key={partner.tittle}
                  className={`flex flex-col sm:flex-row items-center w-full p-4 gap-4 ${index !== 0 ? "border-t-2" : ""}`}
                >
                  <div className="bg-neutral-100 p-2 rounded-lg">
                    <Image
                      src={partner.imgUrl}
                      alt={partner.tittle}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between w-full text-center sm:text-left gap-4">
                    <p className="text-neutral-700 text-lg md:text-xl font-bold">
                      {partner.tittle}
                    </p>
                    <Button
                      variant="secondary"
                      asChild
                      className="w-full sm:w-auto"
                    >
                      <Link href={partner.url}>Propor parceria</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default HelpPage;
