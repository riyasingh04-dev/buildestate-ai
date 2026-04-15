import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BuildEstate AI | Premium Real Estate Platform",
  description: "Connecting property buyers with top-tier builders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
