import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Агуулах — Бараа хяналт",
  description: "Солонгосоос Монгол руу контейнероор бараа тээвэрлэх хяналт",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
