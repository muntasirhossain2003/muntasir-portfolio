import { Chrome } from "@/components/Chrome";
import { Introduction } from "@/components/Introduction";
import { PaperFigure } from "@/components/PaperFigure";
import { ProjectsTable } from "@/components/ProjectsTable";
import { References } from "@/components/References";
import { Section } from "@/components/Section";
import { TitlePage } from "@/components/TitlePage";
import { Trajectory } from "@/components/Trajectory";
import { papers, profile } from "@/data/content";

export default function Home() {
  return (
    <>
      <Chrome />
      <main>
        <TitlePage />

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Section id="introduction" n="1" title="Introduction">
            <Introduction />
          </Section>

          <Section
            id="publications"
            n="2"
            title="Publications"
            kicker="Each paper comes with a live figure of its central mechanism. The figures run in real time and pause when off screen."
          >
            <div className="space-y-24 sm:space-y-32">
              {papers.map((p, i) => (
                <PaperFigure key={p.id} paper={p} index={i} />
              ))}
            </div>
          </Section>

          <Section id="projects" n="3" title="Projects">
            <ProjectsTable />
          </Section>

          <Section id="trajectory" n="4" title="Trajectory">
            <Trajectory />
          </Section>

          <Section id="references" title="References">
            <References />
          </Section>
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-12 pt-4 sm:px-6">
        <div className="flex flex-col justify-between gap-2 border-t border-rule pt-6 font-mono text-[11px] text-ink-faint sm:flex-row">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <span>Typeset in Newsreader &amp; JetBrains Mono · built with Next.js</span>
        </div>
      </footer>
    </>
  );
}
