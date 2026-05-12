"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Check, Loader } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { getAllCourses } from "@/services/courseApi";
import { createUser, getUserByClerkId } from "@/services/usuarioApi";

const CoursesPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const [courses, setCourses] = useState<any[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [userResponse, coursesResponse] = await Promise.all([
          getUserByClerkId(user.id),
          getAllCourses(),
        ]);

        const userData = userResponse.data;
        setUsuario(userData);
        setActiveCourseId(userData.activeCourse);
        setCourses(coursesResponse.data);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        toast.error("Erro ao carregar os cursos disponíveis.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const onSelect = async (id: number) => {
    if (id !== 1) {
      toast.warning("Este curso estará disponível em breve!");
      return;
    }

    if (!usuario) return;

    if (id === activeCourseId) {
      return router.push("/learn");
    }

    try {
      await createUser({
        ...usuario,
        activeCourse: id,
      });

      router.push("/learn");
    } catch (error) {
      toast.error("Erro ao selecionar o curso.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader className="h-20 w-20 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full max-w-[912px] px-3 mx-auto pt-10 pb-20">
      <h1 className="text-2xl font-bold text-neutral-700 mb-8">
        Cursos de Contabilidade
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {courses.map((curso) => (
          <div
            key={curso.id}
            onClick={() => onSelect(curso.id)}
            className={cn(
              "h-full border-2 rounded-xl border-b-4 hover:bg-black/5 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-4 pb-6 min-h-[210px] transition-all",
              activeCourseId === curso.id && "border-blue-400",
            )}
          >
            <div className="w-full flex justify-end min-h-[24px]">
              {activeCourseId === curso.id && (
                <div className="rounded-md bg-green-600 flex items-center justify-center p-1.5 shadow-sm">
                  <Check className="text-white stroke-[4] h-4 w-4" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-neutral-700 text-center px-2">
              {curso.id === 1 ? curso.title : "Em breve..."}
            </h2>

            <div className="relative h-[80px] w-[80px] mt-4">
              <Image
                src={curso.id === 1 ? curso.imageSrc : "/lock.svg"}
                alt={curso.title}
                fill
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
