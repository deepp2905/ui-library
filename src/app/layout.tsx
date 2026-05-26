import type { Metadata } from 'next';
import Script from 'next/script';
import '@/styles/globals.css';

const description =
  'Fun Components & Interactions crafted with hundreds of iterations, subtle motion, and fine tuning the final layer of polish.';

export const metadata: Metadata = {
  title: 'Fun Components and Interactions by Deep Patel',
  description,
  openGraph: {
    title: 'Fun Components and Interactions by Deep Patel',
    description,
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1920,
        height: 1025,
        alt: 'Fun Components and Interactions by Deep Patel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fun Components and Interactions by Deep Patel',
    description,
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
