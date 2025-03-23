import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Header } from '@/components/Header'
import Footer from "@/components/Footer";
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kandy Saloon",
  description: "Your trusted saloon service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

        <ThemeProvider>
          <AuthProvider>
          <main>
            <Header />
              {children}
            <Footer/>
          </main>
          </AuthProvider>
        </ThemeProvider>

  );
}
