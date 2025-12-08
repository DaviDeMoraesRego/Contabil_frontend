import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const HasPlan = () => {
  return (
    <div className="border-2 rounded-xl p-4 space-y-4 mt-5">
      <div className="space-y-2">
        <div className="flex items-center gap-x-2">
          <Image src="/unlimited.png" alt="Pro" height={26} width={26} />
          <h3 className="font-bold text-lg">Aproveite seus corações ilimitados!</h3>
        </div>
        <p className="text-muted-foreground">
          Jogue, aprenda e arrisque!
        </p>
      </div>
      <Button asChild variant="super" className="w-full" size="lg">
        <Link href="/learn">
            jogar
        </Link>
      </Button>
    </div>
  );
};
