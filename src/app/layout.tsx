
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { I18nProvider } from '@/lib/i18n/provider';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Impostor Web - Juego Online de Roles Ocultos gratis',
  description: 'Juega a Impostor Web gratis en tu navegador. Un divertido juego party de engaño, deducción social y roles ocultos similar a Among Us y Spyfall para jugar local con amigos.',
  keywords: 'impostor web, juego impostor, juego de roles ocultos, among us online, spyfall online, party game gratis, juegos para jugar con amigos local, impostor gratis online',
  metadataBase: new URL('https://impostor-web.online'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Impostor Web - Juego Online de Roles Ocultos gratis',
    description: 'Juega a Impostor Web gratis. Un divertido juego party de engaño y deducción social similar a Among Us para jugar local con amigos.',
    url: 'https://impostor-web.online/',
    siteName: 'Impostor Web',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Impostor Web',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Impostor Web - Juego Online de Roles Ocultos',
    description: 'Juega a Impostor Web gratis. Descubre al impostor en este juego de engaño y deducción social desde un solo dispositivo.',
    images: ['/icon.png'],
  },
  verification: {
    google: 'JpXidX7v3WkmW5N7v_0315yP2latBy1jT0gor-CYZY4',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  return (
    <I18nProvider>
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
          {publisherId && (
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          )}
        </head>
        <body className={cn("font-body antialiased", 'bg-background')}>
          {children}
          <Toaster />
        </body>
      </html>
    </I18nProvider>
  );
}
