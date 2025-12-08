"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useEffect, useState } from "react";
import { useExitModal } from "@/store/use-exit-modal";

export function StartLessonDialog() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { close } = useExitModal();

  const [hasOpened, setHasOpened] = useState(true);
  const [dontRemind, setDontRemind] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = sessionStorage.getItem("dontRemindLessonDialog");
    if (stored === "true") {
      setHasOpened(false);
    }
  }, []);

  const handleClose = () => {
    if (dontRemind) {
      sessionStorage.setItem("dontRemindLessonDialog", "true");
    }
    setHasOpened(false);
    close();
  };

  if (!isClient || !hasOpened) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image src="/apoio.svg" alt="livros" height={80} width={80} />
          </div>
          <DialogTitle className="text-center font-bold text-2xl">
            Antes de continuar...
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Sempre que tiver alguma dúvida ou quiser aprender mais, clique na
            lâmpada amarela no canto superior direito. Você abrirá uma página
            com todo o conteúdo deste curso!
          </DialogDescription>
          <br />
          <DialogDescription className="text-center text-lg font-semibold text-foreground">
            Pronto para os desafios?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col items-center gap-y-4">
          <div className="flex flex-col gap-y-4 w-full">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={handleClose}
            >
              Começar
            </Button>
            <div className="flex items-center justify-center gap-x-2 text-sm">
              <input
                type="checkbox"
                id="dontRemind"
                checked={dontRemind}
                onChange={(e) => setDontRemind(e.target.checked)}
              />
              <label htmlFor="dontRemind" className="cursor-pointer">
                Não mostrar novamente
              </label>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
