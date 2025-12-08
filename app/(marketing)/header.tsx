"use client";

import Image from "next/image";
import { Loader } from "lucide-react";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthRedirectHandler = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    const shouldRedirect = sessionStorage.getItem("redirect-after-login");

    if (isSignedIn && shouldRedirect === "true") {
      sessionStorage.removeItem("redirect-after-login");
      router.push("/learn");
    }
  }, [isSignedIn, router]);

  return null;
};

export const Header = () => {
  return (
    <header className="h-20 w-full border-b-2 border-slate-200 px-4">
      <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
        
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/seta.svg" height={60} width={60} alt="logo" />
          <h1 className="text-2xl font-extrabold text-blue-400 tracking-wide">
            Contabil
          </h1>
        </div>

        <ClerkLoading>
          <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        </ClerkLoading>

        <ClerkLoaded>
          <SignedIn>
            <UserButton />
            <AuthRedirectHandler />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button
                size="lg"
                variant="ghost"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("redirect-after-login", "true");
                  }
                }}
              >
                Login
              </Button>
            </SignInButton>
          </SignedOut>
        </ClerkLoaded>
      </div>
    </header>
  );
};