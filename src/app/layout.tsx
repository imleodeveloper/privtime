import type { Metadata } from "next";
import "./globals.css";
import { Header } from "../../components/header";
import { Inter } from "next/font/google";
import { WhatsAppButton } from "../../components/whatsapp-button";
import { BannerAge } from "../../components/banner-age";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "PriveTime - Agendamento Seguro e Ágil | ViaModels ",
  description:
    "O PriveTime é o app de agendamento da ViaModels feito para profissionais do prazer. Organize seus horários, receba clientes com praticidade e mantenha sua privacidade em primeiro lugar.",
  keywords: [
    "privetime",
    "viamodels",
    "agenda discreta",
    "aplicativo de agendamento ágil",
    "app de agendamento",
    "acompanhantes",
    "agendamento ágil",
    "agendamento acompanhantes",
    "organização de horários",
    "profissionais do prazer",
    "agenda privativa",
  ],
  openGraph: {
    title: "PriveTime - Agendamento Seguro e Ágil",
    description:
      "Organize seus atendimentos de forma prática e privada. O Privetime, da ViaModels, é o app ideal para profissionais do prazer que valorizam segurança, organização e agilidade.",
    url: "https://privetime.viamodels.com.br",
    siteName: "PriveTime",
    images: [
      {
        url: "/privetime-pink-not-bg.webp",
        width: 1200,
        height: 630,
        alt: "PriveTime - Agenda discreta e segura",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "jZAgz9oxWhBW9TS1X-eHciNatV2azc9F0xRHpT9rA1c",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.variable} antialiased relative`}>
        {children}
        {/* <BannerAge /> */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
