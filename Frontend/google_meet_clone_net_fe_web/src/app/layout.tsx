import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import ThreeDBackground from "@/components/ui/3d-background";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
});

export const metadata: Metadata = {
  title: "Google Meet NET Clone",
  description: "Google Meet NET Clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased font-sans`}
      >
        <ThreeDBackground />
        {children}
      </body>
    </html>
  );
}
