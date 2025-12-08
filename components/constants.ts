import { getAllDesafiosByLicoesId } from "@/services/dasafiosApi";
import { getAllLicoesByUnidadesId } from "@/services/licoesApi";
import { getByClerkIdAndDesafioId } from "@/services/progressoDesafiosApi";
import { getAllUnidadesByCourseId } from "@/services/unidadesApi";

export const quests = [
  { tittle: "🥉 Ganhe 50 de XP", value: 50 },
  { tittle: "🥈 Ganhe 150 de XP", value: 150 },
  { tittle: "🥇 Ganhe 500 de XP", value: 500 },
  { tittle: "🏆 Ganhe 1000 de XP", value: 1000 },
  { tittle: "🎉 Ganhe 2000 de XP", value: 2000 },
  { tittle: "🌍 Ganhe 5000 de XP", value: 5000 },
];

export const contacts = [
  {
    tittle: "WhatsApp (Suporte)",
    url: "https://wa.me/5511999999999?text=Olá,+preciso+de+ajuda+com+o+Contábil!", //TODO: AJUSTAR COM O CELULAR
    imgUrl: "/whatsapp.svg",
  },
  {
    tittle: "Email (Suporte)",
    url: "mailto:suporte@contabilapp.com.br?subject=Suporte%20Contábil&body=Descreva%20sua%20dúvida:", //TODO: AJUSTAR COM DOMÍNIO
    imgUrl: "/gmail.svg",
  },
  {
    tittle: "Instagram",
    url: "https://instagram.com/contabil_app", // TODO: CRIAR INSTAGRAM
    imgUrl: "/instagram.svg",
  },
  {
    tittle: "Telegram (Suporte)",
    url: "https://t.me/ContabilAppHelp", // TODO: SUBSTITUIR COM TELEGRAM
    imgUrl: "/telegram.svg",
  },
];

export const partners = [
  {
    tittle: "WhatsApp (Parcerias)",
    url: "https://wa.me/5511999999999?text=Olá,+gostaria+de+falar+sobre+parcerias!", //TODO: AJUSTAR COM O CELULAR
    imgUrl: "/whatsapp.svg",
  },
  {
    tittle: "Email Comercial",
    url: "mailto:negocios@contabilapp.com.br?subject=Parcerias&body=Olá,+tenho+interesse+em+parceria:", //TODO: AJUSTAR COM DOMÍNIO
    imgUrl: "/gmail.svg",
  },
  {
    tittle: "LinkedIn",
    url: "https://www.linkedin.com/in/seu-usuario/", // TODO: AJUSTAR COM USUARIO
    imgUrl: "/linkedin.svg",
  },
  {
    tittle: "Instagram",
    url: "https://instagram.com/contabil_app", // TODO: CRIAR INSTAGRAM
    imgUrl: "/instagram.svg",
  },
  {
    tittle: "Telegram (Parcerias)",
    url: "https://t.me/ContabilAppBusiness", // TODO: SUBSTITUIR COM TELEGRAM
    imgUrl: "/telegram.svg",
  },
];

export const courseDetail = (
  courseId: 1 | 2 | 3 | 4 | 5,
  atributo: "img" | "tittle"
) => {
  const courses = [
    { id: 1, courseImgUrl: "/basica.svg", tittle: "Contabilidade Básica" },
    {
      id: 2,
      courseImgUrl: "/financeira.svg",
      tittle: "Contabilidade Financeira",
    },
    { id: 3, courseImgUrl: "/custos.svg", tittle: "Contabilidade de Custos" },
    {
      id: 4,
      courseImgUrl: "/tributaria.svg",
      tittle: "Contabilidade Tributária",
    },
    { id: 5, courseImgUrl: "/pessoal.svg", tittle: "Contabilidade Pessoal" },
  ];

  const course = courses.find((c) => c.id === courseId);
  if (!course) return "";

  if (atributo === "img") return course.courseImgUrl;
  if (atributo === "tittle") return course.tittle;

  return "";
};

export const completeCourse = async (courseId: number, clerkId: string) => {
  try {
    const unidadesResponse = await getAllUnidadesByCourseId(courseId);
    const unidades = unidadesResponse.data;

    if (!unidades || unidades.length === 0) {
      return 0;
    }

    let totalLicoes = 0;
    let totalLicoesCompletas = 0;

    for (const unidade of unidades) {
      const licoesResponse = await getAllLicoesByUnidadesId(unidade.id);
      const licoes = licoesResponse.data;

      for (const licao of licoes) {
        totalLicoes++;

        const desafiosResponse = await getAllDesafiosByLicoesId(licao.id);
        const desafios = desafiosResponse.data;

        if (!desafios || desafios.length === 0) {
          continue;
        }

        const progressoDesafios = await Promise.all(
          desafios.map(async (desafio: any) => {
            try {
              const prog = await getByClerkIdAndDesafioId(clerkId, desafio.id);
              return prog?.data?.completo === true;
            } catch {
              return false;
            }
          })
        );

        const licaoCompleta = progressoDesafios.every((p) => p === true);

        if (licaoCompleta) {
          totalLicoesCompletas++;
        }
      }
    }

    if (totalLicoes === 0) return 0;

    const porcentagem = Math.round((totalLicoesCompletas / totalLicoes) * 100);

    return porcentagem;
  } catch (err) {
    console.error("Erro ao calcular porcentagem do curso:", err);
    return 0;
  }
};
