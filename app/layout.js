import "./globals.css";
import "./ui/interactions.css";
import { Suspense } from "react";

export const metadata = {
  title: "Promociones y Descuentos",
  description:
    "Promociones activas, liquidaciones, MSI, cupones y códigos de tiendas en México. Se actualiza al refrescar.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Promos MX",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e11d48",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head />
      <body>
        <Suspense fallback={<div className="boot">Cargando…</div>}>
          {children}
        </Suspense>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').catch(function () {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
