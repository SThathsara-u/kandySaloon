import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from '@/contexts/AuthContext';
import { EmployeeAuthProvider } from '@/contexts/EmployeeAuthContext'

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
    <html lang="en">
      <EmployeeAuthProvider>
      <AuthProvider>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
            {children}
        </ThemeProvider>
      </body>
      </AuthProvider>
      </EmployeeAuthProvider>
    </html>
  );
}
