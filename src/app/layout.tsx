import type { Metadata, Viewport } from "next";
import { PwaRuntime } from "@/components/pwa-runtime";
import { ClientErrorReporter } from "@/components/client-error-reporter";
import "./globals.css";

export const metadata: Metadata = {
  title: "JuegoFamiliaEch",
  description:
    "Juego grupal de conversación para compartir historias cara a cara.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JuegoFamiliaEch",
  },
  icons: {
    icon: [
      {
        url: "/api/pwa/icon/192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/api/pwa/icon/512",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/api/pwa/icon/180",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f1e8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <PwaRuntime />
        <ClientErrorReporter />
        {children}
      </body>
    </html>
  );
}
