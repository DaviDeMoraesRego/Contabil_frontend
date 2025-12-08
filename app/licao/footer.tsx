import { useKey, useMedia } from "react-use";
import { CheckCircle, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  onCheck: () => void;
  status: "correta" | "incorreta" | "nenhum" | "completo";
  disabled?: boolean;
  lessonId?: number;
};

export const Footer = ({ onCheck, status, disabled, lessonId }: Props) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  const isMobile = useMedia("(max-width: 1024px)");

  return (
    <footer
      className={cn(
        "min-h-[80px] lg:min-h-[110px] border-t-2 px-4 lg:px-10 py-3",
        "flex items-center",
        status === "correta" && "border-transparent bg-green-100",
        status === "incorreta" && "border-transparent bg-rose-100"
      )}
    >
      <div className="max-w-[1140px] w-full mx-auto flex items-center justify-between gap-3">
        {status === "correta" && (
          <div className="text-green-500 font-bold text-sm lg:text-2xl flex items-center">
            <CheckCircle className="h-5 w-5 lg:h-10 lg:w-10 mr-3 lg:mr-4" />
            Muito bem!
          </div>
        )}
        {status === "incorreta" && (
          <div className="text-rose-500 font-bold text-sm lg:text-2xl flex items-center">
            <XCircle className="h-5 w-5 lg:h-10 lg:w-10 mr-3 lg:mr-4" />
            Tente novamente.
          </div>
        )}
        {status === "completo" && (
          <Button
            variant="default"
            size={isMobile ? "sm" : "lg"}
            onClick={() => (window.location.href = `/licao/${lessonId}`)}
          >
            Praticar novamente
          </Button>
        )}

        <Button
          disabled={disabled}
          className="ml-auto"
          onClick={onCheck}
          size={isMobile ? "sm" : "lg"}
          variant={status === "incorreta" ? "danger" : "secondary"}
        >
          {status === "nenhum" && "Check"}
          {status === "correta" && "Próxima"}
          {status === "incorreta" && "Tentar de novo"}
          {status === "completo" && "Continuar"}
        </Button>
      </div>
    </footer>
  );
};
