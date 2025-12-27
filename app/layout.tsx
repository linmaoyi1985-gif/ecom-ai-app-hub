import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecom AI App Hub",
  description: "跨境电商AI工具集合",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
