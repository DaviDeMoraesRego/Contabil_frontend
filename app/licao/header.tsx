import { ExitModal } from "@/components/modals/exit-modal";
import { InfoDialog } from "@/components/modals/InfoModel";
import { StartLessonDialog } from "@/components/modals/startLesson-modal";
import { Progress } from "@/components/ui/progress";
import { useExitModal } from "@/store/use-exit-modal";
import { InfinityIcon, X } from "lucide-react";
import Image from "next/image";

type Props = {
  activeCourse: number
  hearts: number;
  points: number
  percentage: number;
  hasActiveSubscription: boolean;
  clerkId: string;
  desafios: any;
};

export const Header = ({
  activeCourse,
  hearts,
  points,
  percentage,
  hasActiveSubscription,
}: Props) => {

    const { open } = useExitModal();
  return (
    
    
    <header className="lg:pt-[20px] pt-[10px] px-5 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full">
      
      <X
        onClick={open}
        className="text-slate-500 hover:opacity-75 transition cursor-pointer"
      />
      <Progress value={percentage} />
      <div className="text-rose-500 flex items-center font-bold">
        <Image
          src="/hearts.svg"
          height={28}
          width={28}
          alt="Heart"
          className="mr-2"
        />
        {!!hasActiveSubscription ? (
          <InfinityIcon className="h-6 w-6 stroke-[3] shrink-0" />
        ) : (
          hearts
        )}
      </div>
      <div className="text-orange-500 flex items-center font-bold">
        <Image
          src="/points.svg"
          height={28}
          width={28}
          alt="Heart"
          className="mr-2"
        />
        {points}
      </div>
      <InfoDialog pdfId={activeCourse} tam={40}/>
    </header>
  );
};
