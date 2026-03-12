import type { Metadata } from "next";
import { Shell } from "@/components/ui/shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRISM",
  description: "Research-grade interface for spatial microstructure prediction."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
