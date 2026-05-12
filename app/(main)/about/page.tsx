"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// CORREÇÃO: Importando o Link correto do Next.js
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ChevronDown,
  Instagram,
  Linkedin,
  Loader,
  Mail,
  MessageCircle,
  // O Link do lucide deve ser renomeado se for usar ícone,
  // mas aqui vamos usar os específicos (Linkedin, Instagram, etc)
} from "lucide-react";
import { toast } from "sonner";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { HasPlan } from "@/components/has-plan";

import { getCourseById } from "@/services/courseApi";
import { getUserByClerkId } from "@/services/usuarioApi";
import { getSubscription } from "@/services/subscription";
import { Button } from "@/components/ui/button";

const AboutPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [hasActiveSubscription, setHasActiveSubscription] =
    useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    const initAboutPage = async () => {
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
        console.error("Erro ao carregar página Sobre:", error);
        toast.error("Erro ao carregar informações da página.");
      } finally {
        setIsLoading(false);
      }
    };

    initAboutPage();
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
        <div className="w-full flex flex-col">
          <div className="flex flex-col items-center md:items-start mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-800 mb-2">
              Nossa História
            </h1>
            <div className="h-1.5 w-20 bg-blue-500 rounded-full" />
          </div>

          <section className="space-y-6 text-neutral-600 text-lg leading-relaxed">
            <p>
              O <strong>Contabil</strong> não nasceu apenas como uma linha de
              código, mas como uma solução para um desafio real. Idealizado
              originalmente como um projeto de TCC na <strong>ETEC</strong>, sob
              a mentoria do <strong>Prof. Roberto Carlos</strong>, o projeto foi
              fruto do trabalho árduo da <strong>Equipe Contabil</strong>.
            </p>

            <div className="bg-neutral-50 text-black p-6 rounded-2xl border-l-8 border-blue-500 shadow-lg my-8">
              <p className="italic text-lg">
                &quot;A contabilidade é um instrumento que fornece o máximo de
                informações úteis para a tomada de decisões dentro e fora da
                empresa.&quot;
              </p>
              <span className="block mt-3 text-sm font-bold text-blue-400">
                — MARION, José. Contabilidade Básica.
              </span>
            </div>

            <p>
              Ao analisar os dados do <strong>SEBRAE (2024)</strong>, percebemos
              que a falta de conhecimento técnico é um dos principais motivos
              para o encerramento de atividades de microempreendedores.
            </p>

            <p className="font-semibold text-neutral-800">
              Transformei esse projeto em uma plataforma escalável, com a visão
              de expandir essa metodologia para diversos ramos do conhecimento.
            </p>
          </section>

          <hr className="my-12 border-neutral-200" />

          <section className="w-full mt-4">
            <h2 className="text-2xl font-bold text-neutral-800 mb-8">
              O Desenvolvedor
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-6 md:p-10 rounded-3xl border-2 border-b-8 border-neutral-200">
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-xl rotate-3 hover:rotate-0 transition duration-300 flex-shrink-0">
                <Image
                  src="/dev-avatar.webp"
                  alt="Davi de Moraes"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col text-center md:text-left flex-1 items-center md:items-start">
                <h3 className="text-2xl md:text-3xl font-bold text-neutral-800">
                  Davi de Moraes
                </h3>
                <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-4">
                  Full Cycle Developer
                </p>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  Especialista em arquitetar e entregar sistemas de ponta a
                  ponta. Desde Plataformas Educacionais a Sistemas SaaS
                  escaláveis e E-commerces de alta performance.
                </p>

                <div className="relative group w-full md:w-fit outline-none" tabIndex={0}>
                  <Button
                    size="lg"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold border-b-4 border-blue-700 active:border-b-0 transition-all flex items-center justify-center"
                  >
                    Entrar em contato
                    <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                  </Button>

                  <div className="absolute left-0 top-full pt-2 w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible group-active:opacity-100 group-active:visible transition-all duration-200 z-[100]">
                    <div className="bg-white border-2 border-b-4 border-neutral-200 rounded-xl p-2 shadow-xl">
                      <Link
                        href="https://wa.me/5511959105162?text=Olá,+gostaria+de+falar+sobre+parcerias!"
                        target="_blank"
                        className="flex items-center gap-3 p-3 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-700 font-medium"
                      >
                        <MessageCircle className="h-5 w-5 text-green-500" />{" "}
                        WhatsApp
                      </Link>
                      <Link
                        href="https://www.linkedin.com/in/davi-de-moraes-3a7a61264/"
                        target="_blank"
                        className="flex items-center gap-3 p-3 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-700 font-medium"
                      >
                        <Linkedin className="h-5 w-5 text-blue-700" /> LinkedIn
                      </Link>
                      <Link
                        href="mailto:davi.de.moraes.rego@gmail.com"
                        className="flex items-center gap-3 p-3 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-700 font-medium"
                      >
                        <Mail className="h-5 w-5 text-red-500" /> E-mail
                      </Link>
                      <Link
                        href="https://www.instagram.com/d_4_v_1moraes/"
                        target="_blank"
                        className="flex items-center gap-3 p-3 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-700 font-medium"
                      >
                        <Instagram className="h-5 w-5 text-pink-500" />{" "}
                        Instagram
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default AboutPage;
