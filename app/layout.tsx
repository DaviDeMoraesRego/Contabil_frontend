import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";

const font = Nunito({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const nunitoMono = Nunito({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contabil",
  description: "Jogo educativo de contabilidade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-br">
        <body className={`${font.variable} ${nunitoMono.variable} antialiased`}>
          <Toaster/>
          <ExitModal/>
          <HeartsModal/>
          <PracticeModal/>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
