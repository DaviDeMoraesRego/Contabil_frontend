"use client";

import { Lightbulb } from "lucide-react";
import { Button } from "../ui/button";

export function InfoDialog({ pdfId, tam }: { pdfId?: number; tam: number }) {
  const pdfPath = `/curso${pdfId}.html`;

  return (
    <Button
      variant="ghost"
      onClick={() => window.open(pdfPath, "_blank")}
      className="hover:opacity-75 transition cursor-pointer hover:bg-slate-100 rounded-lg flex items-center justify-center"
      style={{ width: tam + 22, height: tam + 12 }}
    >
      <Lightbulb className="text-yellow-300" size={tam} style={{ width: tam, height: tam }}/>
    </Button>
  );
}
