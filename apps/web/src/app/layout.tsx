import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectFlow — Engineering Workspace",
  description: "Linear-inspired SaaS project management for software teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="bg-[#0e0e10] text-[#ededed] antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}