import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
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
        className={`${inter.variable} ${jetbrainsMono.variable} bg-arena-bg text-white antialiased`}
      >
        {children}
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
