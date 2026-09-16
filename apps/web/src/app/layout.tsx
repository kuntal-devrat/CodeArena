import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const robotoMono = Roboto_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});


export const metadata: Metadata = {
  title: "CodeArena — Social Competitive Coding",
  description:
    "Practice coding problems with friends. Real-time rooms, Peek, spectating, and a full problem bank.",
  openGraph: {
    title: "CodeArena",
    description: "Social competitive coding practice platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${roboto.variable} ${robotoMono.variable} font-sans bg-m3-surface text-m3-on-surface antialiased min-h-screen flex flex-col`}
      >

        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1d27",
              color: "#fff",
              border: "1px solid #2a2d3a",
            },
          }}
        />
      </body>
    </html>
  );
}
