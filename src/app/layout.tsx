import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vault | Self-Sovereign Identity",
  description: "Prove who you are without revealing your data. Built on Ethereum Sepolia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-vault-gold/20 selection:text-vault-goldLight">
        {/* 3-layer animated background system */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          {/* Layer 1: Gold Grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)',
              backgroundSize: '52px 52px'
            }}
          />
          {/* Layer 2: Radial Glows */}
          <div className="absolute -top-[20%] right-[5%] w-[600px] h-[600px] rounded-full bg-vault-gold/[0.05] blur-[120px]" />
          <div className="absolute top-[15%] -right-[15%] w-[500px] h-[500px] rounded-full bg-vault-teal/[0.03] blur-[120px]" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/[0.03] blur-[120px]" />
        </div>

        {children}
      </body>
    </html>
  );
}
