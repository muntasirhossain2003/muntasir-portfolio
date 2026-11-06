import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, VT323 } from "next/font/google";
import { profile } from "@/data/content";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-jb",
  display: "swap",
});

const vt = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${profile.name} — MUNTASIR_OS`,
  description: `${profile.name}: ${profile.role}. Research papers rendered as live ASCII, projects, and experience — in a terminal.`,
  openGraph: {
    title: `${profile.name} — MUNTASIR_OS`,
    description: "Research papers rendered as live ASCII, projects, and experience — in a terminal.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#040805",
  colorScheme: "dark",
};

// Restore the saved phosphor colour before first paint.
const phosphorScript = `try{var p=localStorage.getItem('phosphor');if(p==='amber'||p==='ice'||p==='green')document.documentElement.setAttribute('data-phosphor',p)}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-phosphor="green" suppressHydrationWarning className={`${mono.variable} ${vt.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: phosphorScript }} />
      </head>
      <body>
        {children}
        <div className="crt-overlay" aria-hidden />
      </body>
    </html>
  );
}
