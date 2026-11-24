import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InquiryBagDrawer from '@/components/InquiryBagDrawer';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VastraVani Looms — Direct Saree Manufacturer & B2B Wholesale Runway',
  description:
    'Factory-direct wholesale sarees crafted in Varanasi & Surat. Explore our 3D saree runway, MOQ sets, and place bulk showroom orders.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <InquiryBagDrawer />
      </body>
    </html>
  );
}
