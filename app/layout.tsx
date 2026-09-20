import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'PersonTrack AI - Segmentação e Rastreamento de Pessoas em Vídeo',
  description: 'Processamento de vídeos com detecção de alta resolução, segmentação precisa com SAM 2 e rastreamento persistente ReID.',
  openGraph: {
    title: 'PersonTrack AI - Segmentação e Rastreamento de Pessoas em Vídeo',
    description: 'Processamento de vídeos com detecção de alta resolução, segmentação precisa com SAM 2 e rastreamento persistente ReID.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PersonTrack AI - Segmentação e Rastreamento de Pessoas em Vídeo',
    description: 'Processamento de vídeos com detecção de alta resolução, segmentação precisa com SAM 2 e rastreamento persistente ReID.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
