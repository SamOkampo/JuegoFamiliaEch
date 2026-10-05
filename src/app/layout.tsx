import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JuegoFamiliaEch",
  description: "Juego grupal de conversación para compartir historias cara a cara.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
