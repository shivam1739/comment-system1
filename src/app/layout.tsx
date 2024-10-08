import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/component/Header";


const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>

        <div className="fixed shadow-md top-0 left-0 w-full z-[11111] ">
          <Header />
        </div>

        <div className="pt-[5rem]">
          {children}
        </div>
      </body>
    </html>
  );
}
