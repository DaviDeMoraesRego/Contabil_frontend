"use client";

import { Button } from "@/components/ui/button";
import { createUser, getUserByClerkId } from "@/services/usuarioApi";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      let userData = null;

      try {
        const response = await getUserByClerkId(user.id);
        userData = response.data;
      } catch (error: any) {
        if (
          (axios.isAxiosError(error) && error.response?.status === 404) ||
          userData === null
        ) {
        } else {
          toast.error("Erro ao buscar o usuário.");
          console.error(error);
          return;
        }
      }

      const userValue = {
        clerkId: user.id,
        nome: user.firstName,
        email: user.emailAddresses?.[0]?.emailAddress ?? "",
        userImgSrc: user.imageUrl ?? "/default-user.svg",
        activeCourse: userData?.activeCourse ?? 0,
        hearts: userData?.hearts ?? 5,
        points: userData?.points ?? 0,
      };

      try {
        await createUser(userValue);
      } catch (err) {
        toast.error("Erro ao criar/atualizar usuário.");
        console.error(err);
        return;
      }

      const shouldRedirect = sessionStorage.getItem("redirect-after-login");
      if (isSignedIn && shouldRedirect === "true") {
        sessionStorage.removeItem("redirect-after-login");
        router.push("/learn");
      }
    }

    fetchData();
  }, [isSignedIn, user, router]);

  return (
    <div className="max-w-[988px] ex-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
      <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lg:mb-0">
        <Image src={"/moneyhand.svg"} fill alt="img" />
      </div>
      <div className="flex flex-col items-center gap-y-8">
        <h1 className="text-xl lg:text-3xl font-bold text-neutral-600 max-w-[480px] text-center">
          Aprenda, pratique e masterize a contabilidade com Contabil.
        </h1>
        <div className="flex flex-col items-center gap-y-3 max-w-[330px]">
          <ClerkLoading>
            <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  size={"lg"}
                  variant={"secondary"}
                  className="w-full"
                  onClick={() =>
                    sessionStorage.setItem("redirect-after-login", "true")
                  }
                >
                  Começar
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button
                  size={"lg"}
                  variant={"primaryOutline"}
                  className="w-full"
                  onClick={() =>
                    sessionStorage.setItem("redirect-after-login", "true")
                  }
                >
                  Já tenho uma conta
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button
                size={"lg"}
                variant={"secondary"}
                className="w-full"
                asChild
              >
                <Link href={"/learn"}>Continue a aprender</Link>
              </Button>
            </SignedIn>
          </ClerkLoaded>
        </div>
      </div>
    </div>
  );
}
