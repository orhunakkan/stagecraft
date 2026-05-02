import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stagecraft',
  description: 'Practice modern Playwright test automation skills.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
