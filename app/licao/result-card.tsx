import Image from "next/image";

import { cn } from "@/lib/utils";
import { InfinityIcon } from "lucide-react";

type Props = {
  value: number;
  variant: "pontos" | "corações";
  hasActiveSubscription: boolean;
};

export const ResultCard = ({
  value,
  variant,
  hasActiveSubscription,
}: Props) => {
  const imageSrc = variant === "corações" ? "/hearts.svg" : "/points.svg";

  return (
    <div
      className={cn(
        "rounded-2xl border-2 w-full",
        variant === "pontos" && "bg-orange-400 border-orange-400",
        variant === "corações" && "bg-rose-500 border-rose-500"
      )}
    >
      <div
        className={cn(
          "p-1.5 text-white rounded-t-xl font-bold text-center uppercase text-xs",
          variant === "corações" && "bg-rose-500",
          variant === "pontos" && "bg-orange-400"
        )}
      >
        {variant === "corações" ? "Corações Restantes" : "XP atual"}
      </div>
      <div
        className={cn(
          "rounded-2xl bg-white items-center flex justify-center p-6 font-bold text-lg",
          variant === "corações" && "text-rose-500",
          variant === "pontos" && "text-orange-400"
        )}
      >
        <Image
          alt="icon"
          src={imageSrc}
          height={30}
          width={30}
          className="mr-1.5"
        />
        {hasActiveSubscription ? (
          <InfinityIcon className="h-6 w-6 stroke-[3] shrink-0" />
        ) : (
          value
        )}
      </div>
    </div>
  );
};
