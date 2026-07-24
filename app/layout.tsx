import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stage Chords",
  description: "A hands-free, auto-scrolling chord and lyric book for live performance.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Stage Chords",
    description: "Your offline, auto-scrolling songbook for the stage.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stage Chords",
    description: "Your offline, auto-scrolling songbook for the stage.",
    images: ["/og.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stage Chords",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#090909" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>{children}</body>
    </html>
  );
}
