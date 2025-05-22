// frontend/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";
import PageTransition from "@/components/PageTransition";

// Importing font variables
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata = {
  title: "NexText | Real-time Chat",
  description:
    "NexText – a modern real-time chat application built with Next.js and FastAPI",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans text-base antialiased bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300 ease-in-out min-h-screen flex flex-col">
        <Providers>
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
