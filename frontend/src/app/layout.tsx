import type { Metadata } from 'next';
import './globals.css';
import { RadioProvider } from '@/contexts/RadioContext';

export const metadata: Metadata = {
  title: 'Underground Tattoo & Barber',
  description: 'Estúdio de tatuagem e barbearia com estilo underground. Arte na pele e estilo no corte.',
  keywords: ['tattoo', 'tatuagem', 'barbearia', 'barber', 'underground', 'estúdio'],
  openGraph: {
    title: 'Underground Tattoo & Barber',
    description: 'Arte na pele e estilo no corte.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <RadioProvider>
          {children}
        </RadioProvider>
      </body>
    </html>
  );
}
