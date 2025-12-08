import { cn } from "@/lib/utils";
import { Card } from "./card";

type Props = {
    options: any;
    onSelect: (id: number) => void;
    status: "correta" | "incorreta" | "nenhum";
    selectedOption?: number
    disabled?: boolean;
    type: "SELECT" | "ASSIST";
}

export const Challange = ({
    options,
    onSelect,
    status,
    selectedOption,
    disabled,
    type
}: Props) => {
    return (
        <div className={cn("grid gap-2 pb-6",
            type === "ASSIST" && "grid-cols-1",
            type === "SELECT" && "grid-cols-2 lg:grid-cols-[repeat(auto-fit, minmax(0, 1fr))]"
        )}>
            {options.map((option: any, i: number) => (
                <Card
                    key={option.id}
                    id={option.id}
                    text={option.texto}
                    imageSrc={option.imageSrc}
                    shortcut={`${i+1}`}
                    selected={selectedOption === option.id}
                    onClick={() => onSelect(option.id)}
                    status={status}
                    audioSrc = {option.audioSrc}
                    disabled = {disabled}
                    type = {type}
                />
            ))}
        </div>
    );
}