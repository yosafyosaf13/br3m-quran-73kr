import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "براعم تحفيظ القرآن الكريم",
  description: "نظام إدارة براعم تحفيظ القرآن الكريم - مجمع التوحيد بالعباسة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
