"use client";

import {
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import { getAllCourses } from "@/services/courseApi";
import { ClerkLoading, useUser } from "@clerk/nextjs";
import { Check, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createUser, getUserByClerkId } from "@/services/usuarioApi";
import { toast } from "sonner";

const CoursesPage = () => {
  const [courses, setCourses] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCourse, setActiveCourse] = useState<number | null>(null);
  const router = useRouter();

  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      return;
    }
     const fetchUser = async () => {
      let userData;
      try {
        const response = await getUserByClerkId(user.id);
        userData = response.data;
      } catch (error) {
        console.error(error);
        toast.error("erro ao buscar usuarios: " + error )
      }
      return userData;
     }

     setUsuario(fetchUser());
  }, [user]);

  const goToCourse = (id: number) => {
    if (id !== 1) {
      toast.warning("Curso disponível em breve!"); //TODO: desenvolver outros cursos;
      return;
    }
    if (!usuario) {
      toast.error("erro ao buscar usuario")
      return;
    }

    router.push("/learn");

    const usuario1 = {
      clerkId: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      userImgSrc: usuario.userImgSrc,
      activeCourse: id,
      hearts: usuario.hearts,
      points: usuario.points,
    };

    createUser(usuario1);
  };

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const userData = await getUserByClerkId(user.id);
        setActiveCourse(userData.data.activeCourse);

        const response = await getAllCourses();
        const coursesList = response.data;

        setCourses(coursesList);
      } catch (err) {
        toast.error("Erro ao buscar os Cursos!");
        setError("⚠️");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ClerkLoading>
          <Loader className="h-32 w-32 text-muted-foreground animate-spin" />
        </ClerkLoading>
      </div>
    );
  } else if (error) {
    return (
      <div className="flex items-center justify-center h-screen">{error}</div>
    );
  }

  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <h1 className="text-2xl font-bold text-neutral-700">
        Cursos de Contabilidade
      </h1>
      <div className="pt-7 pb-5 grid grid-cols-2 lg:grid-cols-[repeat(autofill, minmax(210px, lrf))] gap-4">
        {courses.map(
          (curso: { id: number; title: string; imageSrc: string }) => (
            <div
              key={curso.id}
              onClick={() => goToCourse(curso.id)}
              className={cn(
                "h-full border-2 rounded-xl border-b-4 hover:bg-black/5 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-3 pb-6 min-h-[217px] min-w-[200px]"
              )}
            >
              <div className="min-[24px] w-full flex items-center justify-end">
                {activeCourse == curso.id && (
                  <div className="rounded-md bg-green-600 flex items-center justify-center p-1.5">
                    <Check className="text-white stroke-[4] h-4 w-4" />
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-neutral-700">
                {
                  curso.id === 1
                    ? curso.title
                    : "Curso disponível em breve..." /*TODO: desenvolver outros cursos*/
                }
              </h1>
              <Image
                src={
                  curso.id === 1
                    ? curso.imageSrc
                    : "/lock.svg" /*TODO: desenvolver outros cursos*/
                }
                height={50}
                width={100}
                alt=""
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
