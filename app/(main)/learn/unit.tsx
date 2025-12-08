import { LessonButton } from "./lesson-button";
import { UnitBanner } from "./unit-banner";

type Props = {
    titulo: string;
    descricao: string;
    licoes: any;
    licaoAtiva: any;
    porcentagemLicaoAtiva: any;
}

export const Unit = ({
    titulo, descricao, licoes, licaoAtiva, porcentagemLicaoAtiva,
}: Props) => {
    return (
        <>
         <UnitBanner titulo={titulo} descricao={descricao}/>
         <div className="flex items-center flex-col relative">
            {licoes.map((licao: any) => {
                const licaoAtual =licao.id === licaoAtiva?.id;
                const bloqueada = !licao.completo && !licaoAtual;

                return (
                    <LessonButton 
                        key={licao.id}
                        id={licao.id}
                        index={licao.ordem - 1}
                        totalCount={licoes.length - 1}
                        atual={licaoAtual} 
                        locked={bloqueada}
                        porcentagem={porcentagemLicaoAtiva}
                    />
                )
            })}
         </div>
        </>
    )
}