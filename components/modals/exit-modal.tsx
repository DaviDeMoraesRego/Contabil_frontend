"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExitModal } from "@/store/use-exit-modal";
import { isNull } from "util";
import { resetLicao } from "@/services/progressoDesafiosApi";
import { toast } from "sonner";
import { ClerkLoading } from "@clerk/nextjs";
import { Loader } from "lucide-react";

export const ExitModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useExitModal();

  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image src="/sad.svg" alt="tristeza" height={80} width={80} />
          </div>
          <DialogTitle className="text-center font-bold text-2xl">
            Espera aí, não vai!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Você sairá desta lição. Está certo disso?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={close}
            >
              Continuar Aprendendo
            </Button>
            <Button
              variant="dangerOutline"
              className="w-full"
              size="lg"
              onClick={() => {close(); router.push("/learn");}}
            >
              Encerrar Lição
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
