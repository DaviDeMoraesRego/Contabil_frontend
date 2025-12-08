import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const Promo = () => {
  return (
    <div className="border-2 rounded-xl p-4 space-y-4 mt-5">
      <div className="space-y-2">
        <div className="flex items-center gap-x-2">
          <Image src="/unlimited.png" alt="Pro" height={26} width={26} />
          <h3 className="font-bold text-lg">Adquira o Contabil Pro!</h3>
        </div>
        <p className="text-muted-foreground">
          Tenha corações ilimitados e aproveite!
        </p>
      </div>
      <Button asChild variant="super" className="w-full" size="lg">
        <Link href="/shop">
            Obter já
        </Link>
      </Button>
    </div>
  );
};
