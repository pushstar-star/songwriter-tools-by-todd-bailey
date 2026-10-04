import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Songwriter Tools by Todd Bailey",
  description: "Write, organize, improve, pitch, and perform your songs.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Songwriter Tools by Todd Bailey",
    description: "One workspace for every song, from first line to live stage.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Songwriter Tools by Todd Bailey",
    description: "One workspace for every song, from first line to live stage.",
    images: ["/og.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Songwriter Tools",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#171814" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>{children}</body>
    </html>
  );
}
