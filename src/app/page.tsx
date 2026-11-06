import { Chrome } from "@/components/Chrome";
import { Introduction } from "@/components/Introduction";
import { ProjectCards } from "@/components/ProjectCards";
import { Publications } from "@/components/Publications";
import { References } from "@/components/References";
import { Section } from "@/components/Section";
import { TitlePage } from "@/components/TitlePage";
import { Trajectory } from "@/components/Trajectory";
import { profile } from "@/data/content";
import { SceneRoot } from "@/three/SceneRoot";

export default function Home() {
  return (
    <>
      <SceneRoot />
      <Chrome />
      <main className="relative z-10">
        <TitlePage />

        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <Section id="introduction" n="1" title="Introduction">
            <Introduction />
          </Section>
        </div>

        <Publications />

        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <Section id="projects" n="3" title="Projects" kicker="Index cards from the desk drawer. Hover to pick one up.">
            <ProjectCards />
          </Section>

          <Section id="trajectory" n="4" title="Trajectory">
            <Trajectory />
          </Section>

          <Section id="references" title="References">
            <References />
          </Section>
        </div>
      </main>

      <footer className="relative z-10 mx-auto max-w-5xl px-5 pb-12 pt-4 sm:px-6">
        <div className="flex flex-col justify-between gap-2 border-t border-ink/15 pt-6 font-mono text-[11px] text-ink-faint sm:flex-row">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <span>Pages rendered in WebGL · typeset in Newsreader &amp; JetBrains Mono</span>
        </div>
      </footer>
    </>
  );
}
