// Salve em: src/app/layout.tsx

import type { Metadata } from "next";
// Importamos a fonte do Google
import { Montserrat } from "next/font/google"; //
import "./globals.css";

// Configuração da fonte
const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat", // Define a variável CSS que o Tailwind usará
});

export const metadata: Metadata = {
  title: "Mentora Digital",
  description: "Descubra seu perfil de carreira.",
  icons: {
    icon: "/favicon.svg", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //
    <html lang="en" suppressHydrationWarning={true}> 

      {/* Aplicando fonte Montserrat via classe (gerada por Next.js) */}
      <body 
        className={`${montserrat.variable} font-sans`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}