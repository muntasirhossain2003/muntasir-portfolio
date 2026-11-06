import { About } from "@/components/About";
import { CommandBar, StatusBar } from "@/components/Bars";
import { Boot } from "@/components/Boot";
import { Contact } from "@/components/Contact";
import { GitLog } from "@/components/GitLog";
import { Hero } from "@/components/Hero";
import { Papers } from "@/components/Papers";
import { Projects } from "@/components/Projects";
import { profile } from "@/data/content";

export default function Home() {
  return (
    <>
      <Boot />
      <StatusBar />
      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Hero />
        <About />
        <Papers />
        <Projects />
        <GitLog />
        <Contact />
        <footer className="border-t border-line pb-6 pt-6 text-[11px] text-fg-dim">
          [process exited with code 0] · © {new Date().getFullYear()} {profile.name} · rendered in ASCII at 30fps
        </footer>
      </main>
      <CommandBar />
    </>
  );
}
