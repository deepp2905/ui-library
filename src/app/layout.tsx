import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { site } from '@/lib/site';
import '@/styles/globals.css';

/* Self-hosted via next/font instead of a CSS @import from Google Fonts.
   The @import was a render-blocking chain (HTML → globals.css → Google
   CSS → font files) that delayed first paint most on slow mobile
   networks; next/font inlines the @font-face, preloads the file from our
   own origin and adds a size-matched fallback so text doesn't shift. */
const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-geist',
  display: 'swap',
});
const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-geist-mono',
  display: 'swap',
  // Only used by Counter / Menu, which aren't on the homepage.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.author.url }],
  creator: site.author.name,
  keywords: [...site.keywords],
  /* Relative to metadataBase. The homepage has no meaningful query
     params, so every variant collapses onto the bare origin. */
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: site.name,
    locale: site.locale,
    title: site.title,
    description: site.description,
    images: [
      { url: site.ogImage, width: 1200, height: 630, alt: site.ogImageAlt },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    images: [{ url: site.ogImage, alt: site.ogImageAlt }],
  },
  /* favicon.ico, icon.svg and apple-icon.png in this folder are picked
     up by Next's file conventions; manifest.ts adds the PWA icons. */
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={site.language} className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        {/* Microsoft Clarity — session analytics. Loads after hydration
            so it doesn't block initial paint. */}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wwgld63lud");`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
