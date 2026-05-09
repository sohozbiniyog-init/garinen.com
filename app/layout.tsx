import type { Metadata } from 'next';
import { Fascinate, Fira_Code, Noto_Sans, Geist } from 'next/font/google';
import { BankRatesProvider } from '@/lib/bank-rates-context';
import { FeaturedProvider } from '@/lib/featured-context';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const fascinate = Fascinate({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-fascinate'
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-noto-sans'
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fira-code'
});

export const metadata: Metadata = {
  title: 'GariNen',
  description: 'Bangladesh-focused car marketplace for buyers, vendors, and admins.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${fascinate.variable} ${notoSans.variable} ${firaCode.variable} flex min-h-screen flex-col`}>
        <BankRatesProvider>
          <FeaturedProvider>
            <div className="flex-1">
              {children}
            </div>
            <SiteFooter />
          </FeaturedProvider>
        </BankRatesProvider>
      </body>
    </html>
  );
}