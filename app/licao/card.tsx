import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { useKey } from "react-use"

type Props = {
    id: number;
    imageSrc: string;
    audioSrc: string;
    text: string;
    shortcut: string;
    selected?: boolean;
    onClick: () => void;
    disabled?: boolean;
    status: "correta" | "incorreta" | "nenhum";
    type: "SELECT" | "ASSIST"
}

export const Card = ({
    id,
    text,
    shortcut,
    selected,
    onClick,
    disabled,
    status,
    type
}: Props) => {


    const handleClick = useCallback(() => {
        if (disabled) return;

        onClick();
    }, [disabled, onClick]);

    useKey(shortcut, handleClick, {}, [handleClick])

    return (
        <div onClick={handleClick} className={cn(
            "border-2 rounded-xl border-b-4 hover:bg-black/5 p-3 lg:p-4 cursor-pointer active:border-b-4 min-h-[70px] lg:min-h-[90px]",
            selected && "border-sky-300 bg-sky-100 hover:bg-sky-100",
            selected && status === "correta" && "border-green-300 bg-green-100 hover:bg-green-100",
            selected && status === "incorreta" && "border-rose-300 bg-rose-100 hover:bg-rose-100",
            disabled && "pointer-events-none hover:bg-white",
            type === "ASSIST" && "lg:p-3 w-full"
            )}>
            <div className={cn(
                "flex items-center justify-between",
                type === "ASSIST" && "flex-row-reverse"
            )}>
                {type === "ASSIST" && <div/>}
                <p className={cn(
                    "text-neutral-600 text-sm lg:text-base",
                    selected && "text-sky-500",
                    selected && status === "correta" && "text-green-500",
                    selected && status === "incorreta" && "text-rose-500"
                )}>
                    {text}
                </p>
                <div className={cn(
                    "lg:w-[30px] lg:h-[30px] w-[20px] h-[20px] border-0 flex items-center justify-center rounded-lg text-neutral-400 lg:text-[15px] text-xs font-semibold",
                    selected && "text-sky-500",
                    selected && status === "correta" && "text-green-500",
                    selected && status === "incorreta" && "text-rose-500"
                )}>
                    {shortcut}
                </div>
            </div>
        </div>
    )
}