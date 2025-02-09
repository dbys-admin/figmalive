import type { Metadata } from "next";
import { Geist, Geist_Mono, Work_Sans } from "next/font/google";
import "./globals.css";
import { Room } from "./Room";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  weight:['400', '600' ,'700'], 
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Figma Clone",
  description: "A Minimalist Figma Clone using Fabric JS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${workSans.variable} bg-primary-grey-200 antialiased`}
      >
        <Room>
          {children}

        </Room>
      </body>
    </html>
  );
}
