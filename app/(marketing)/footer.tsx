import { Mail, Code2, Users } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full border-t-2 border-slate-200 bg-white/50 backdrop-blur-sm">
      <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-y-6">
        {/* Lado Esquerdo: Créditos */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-y-1">
          <div className="flex items-center gap-x-2 text-slate-500 mb-1">
            <Users className="w-4 h-4" />
            <p className="text-sm font-medium italic">
              Desenvolvido pela{" "}
              <span
                className="text-slate-700 font-semibold underline decoration-blue-500/30 hover:decoration-blue-500 transition-all cursor-help"
                title="Davi de Moraes, Caio Peccora, Guilherme Barbosa, Gustavo Carrias, Elisabeth Silva, André Felipe, João Paulo"
              >
                equipe Contabil
              </span>
            </p>
          </div>
          <p className="text-xs text-slate-400 max-w-[300px]">
            Com apoio do Prof. Roberto Carlos Raymundo da Silva.
          </p>
          <p className="text-[10px] text-slate-300 uppercase tracking-tighter mt-2">
            © {new Date().getFullYear()} — Tecnologia Educacional
          </p>
        </div>

        {/* Lado Direito: Seu Marketing (CTA) */}
        <div className="flex flex-col items-center md:items-end gap-y-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Soluções Web de Alta Performance
          </span>
          <a
            href="mailto:davi.de.moraes.rego@gmail.com"
            className="group flex items-center gap-x-3 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-200 active:scale-95"
          >
            <Code2 className="w-5 h-5 group-hover:rotate-12 transition-transform text-blue-400 group-hover:text-white" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs opacity-70 mb-1">
                Gostou do projeto?
              </span>
              <span className="text-sm font-bold">
                Contrate o Desenvolvedor
              </span>
            </div>
            <Mail className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </footer>
  );
};
