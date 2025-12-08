import { cn } from "@/lib/utils";
import {
  ClerkLoading,
  ClerkLoaded,
  UserButton
} from "@clerk/nextjs"
import {Loader} from "lucide-react"

import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-item";

type Props = {
  className?: string;
};

export const Sidebar = ({ className }: Props) => {
  return (
    <div
      className={cn(
        "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col",
        className
      )}
    >
      <Link href="/learn">
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/seta.svg" height={40} width={60} alt="logo" />
          <h1 className="text-2xl font-extrabold text-blue-400 tracking-wide">
            Contabil
          </h1>
        </div>
      </Link>
      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem label={"Aprender"} iconSrc={"/home.svg"} href={"/learn"} />
      </div>
      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem label={"Ranking"} iconSrc={"/leaderboard-star.svg"} href={"/leaderboard"} />
      </div>
      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem label={"Missões"} iconSrc={"/quests.svg"} href={"/quests"} />
      </div>
      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem label={"Loja"} iconSrc={"/shopping.svg"} href={"/shop"} />
      </div>
      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem label={"Ajuda"} iconSrc={"/help.svg"} href={"/help"} />
      </div>

      <div className="p-4">
        <ClerkLoading>
          <Loader className="h-5 w-5 text-muted-foreground animate-spin"/>
        </ClerkLoading>
        <ClerkLoaded>
          <UserButton afterSignOutUrl="/"/>
        </ClerkLoaded>
      </div>
    </div>
  );
};
