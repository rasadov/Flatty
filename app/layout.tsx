import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { CurrencyProvider } from '@/components/ui/currency-selector';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flatty',
  description: 'Find your perfect place to live',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <CurrencyProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow pt-16">
                  {children}
                </main>
                <Footer />
              </div>
            </CurrencyProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
} 