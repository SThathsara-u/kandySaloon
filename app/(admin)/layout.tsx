import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { AdminHeader } from "@/components/admin/AdminHeader";
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
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <ThemeProvider>
          <AuthProvider>
          <AdminHeader />
          <EmployeeAuthProvider>
            <main>
                {children}
            </main>
            </EmployeeAuthProvider>
          <AdminFooter />
          </AuthProvider>
        </ThemeProvider>
  );
}
