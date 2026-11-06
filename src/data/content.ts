/**
 * ─────────────────────────────────────────────────────────────
 *  ALL SITE CONTENT LIVES HERE.
 *  Edit this file to change text, papers, projects and links.
 *  Entries marked "SAMPLE" are placeholders — replace them.
 * ─────────────────────────────────────────────────────────────
 */

/** Which animated figure illustrates a paper. Pick the closest match to its core idea. */
export type FigureKind =
  | "neural" // signals flowing through a layered network (deep learning, CNN, transformers)
  | "graph" // message passing across a graph (GNNs, networks, social/knowledge graphs)
  | "landscape" // gradient descent on a loss surface (optimization, training dynamics)
  | "wave"; // signal decomposed into components (signal processing, time series, audio, EEG)

export type PaperStatus = "Published" | "Accepted" | "Under Review" | "Preprint" | "In Progress";

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  status: PaperStatus;
  year: number;
  /** One or two sentences: the core idea. Shown highlighted. */
  keyIdea: string;
  abstract: string;
  figure: FigureKind;
  figureCaption: string;
  links: { pdf?: string; code?: string; doi?: string };
  bibtex: string;
}

export interface Project {
  name: string;
  summary: string;
  description: string;
  stack: string[];
  year: string;
  links: { code?: string; demo?: string };
}

export interface TrajectoryItem {
  kind: "education" | "research" | "work" | "award";
  title: string;
  org: string;
  period: string;
  note?: string;
}

export interface SkillGroup {
  symbol: string;
  label: string;
  items: string[];
}

export const profile = {
  name: "Muntasir Hossain",
  /** How your name appears in author lists — it gets bolded. */
  citeName: "M. Hossain",
  role: "Researcher & Software Engineer", // SAMPLE
  affiliation: "Department of Computer Science and Engineering", // SAMPLE
  institution: "Your University", // SAMPLE
  location: "Bangladesh", // SAMPLE
  abstract:
    "This document presents the research and engineering work of Muntasir Hossain. " +
    "We study how learning systems can be made more efficient, more interpretable and more useful in practice, " +
    "and we build software that turns those ideas into working tools. " +
    "The following sections describe selected publications, each with an animated figure of its core mechanism, " +
    "followed by projects, a trajectory to date, and references for further contact.", // SAMPLE
  keywords: ["machine learning", "deep learning", "systems", "open source"], // SAMPLE
  links: {
    github: "https://github.com/muntasirhossain2003",
    scholar: "", // e.g. https://scholar.google.com/citations?user=XXXX
    linkedin: "", // e.g. https://www.linkedin.com/in/xxxx
    email: "", // e.g. you@example.com
    cv: "", // e.g. /cv.pdf (put the file in /public)
  },
};

export const introduction: string[] = [
  // SAMPLE — write 2–3 short paragraphs about yourself.
  "I am a computer science researcher and engineer interested in the point where theory becomes something people can run. My work spans machine learning methods and the software needed to make them practical: data pipelines, training infrastructure and the interfaces that put models in front of users.",
  "I like problems that need both a careful derivation and a well-made tool. This portfolio is set out like a paper on purpose: each publication below has a small animated figure showing the mechanism at its centre, so you can see the idea before reading the abstract.",
];

export const skills: SkillGroup[] = [
  // SAMPLE
  { symbol: "𝓛", label: "languages", items: ["Python", "C++", "TypeScript", "SQL"] },
  { symbol: "𝓜", label: "learning", items: ["PyTorch", "scikit-learn", "Hugging Face", "NumPy"] },
  { symbol: "𝓦", label: "web", items: ["Next.js", "React", "Node.js", "Tailwind"] },
  { symbol: "𝓣", label: "tooling", items: ["Git", "Docker", "Linux", "LaTeX"] },
];

export const papers: Paper[] = [
  {
    id: "paper-1",
    title: "Sparse Activation Routing for Efficient Deep Networks", // SAMPLE
    authors: ["M. Hossain", "A. Co-Author", "B. Advisor"],
    venue: "International Conference (sample)",
    status: "Under Review",
    year: 2026,
    keyIdea:
      "Only a small, input-dependent subset of neurons needs to fire. Routing activations sparsely cuts compute while keeping accuracy.",
    abstract:
      "Deep networks spend most of their compute on activations that contribute little to the final prediction. We propose a lightweight routing mechanism that, for each input, selects a sparse path through the network and skips the rest. The router is trained jointly with the backbone using a differentiable relaxation, and adds negligible overhead at inference. Across image and text benchmarks, our method reduces FLOPs substantially while matching the accuracy of dense baselines. (Sample abstract — replace with your own.)",
    figure: "neural",
    figureCaption:
      "Signals propagate layer by layer. Each forward pass activates a different sparse path (red); faint edges are skipped.",
    links: { pdf: "", code: "" },
    bibtex: `@inproceedings{hossain2026sparse,
  title     = {Sparse Activation Routing for Efficient Deep Networks},
  author    = {Hossain, Muntasir and Co-Author, A. and Advisor, B.},
  booktitle = {International Conference (sample)},
  year      = {2026}
}`,
  },
  {
    id: "paper-2",
    title: "Message Passing on Heterogeneous Graphs with Hop-Aware Attention", // SAMPLE
    authors: ["A. Co-Author", "M. Hossain", "B. Advisor"],
    venue: "Journal Name (sample)",
    status: "Published",
    year: 2025,
    keyIdea:
      "Information should travel further when it matters. Hop-aware attention lets each node decide how far to listen.",
    abstract:
      "Graph neural networks aggregate information from a fixed neighbourhood, which limits them on graphs where useful signal lies several hops away. We introduce hop-aware attention, which weights messages by both feature similarity and graph distance, so each node can learn its own receptive field. The method scales linearly with the number of edges and improves node classification on several heterogeneous benchmarks. (Sample abstract — replace with your own.)",
    figure: "graph",
    figureCaption:
      "A message spreads from a source node v₀ outward hop by hop. Colour intensity shows distance from the source.",
    links: { pdf: "", code: "", doi: "" },
    bibtex: `@article{coauthor2025hop,
  title   = {Message Passing on Heterogeneous Graphs with Hop-Aware Attention},
  author  = {Co-Author, A. and Hossain, Muntasir and Advisor, B.},
  journal = {Journal Name (sample)},
  year    = {2025}
}`,
  },
  {
    id: "paper-3",
    title: "Escaping Sharp Minima: Momentum Schedules for Robust Training", // SAMPLE
    authors: ["M. Hossain", "B. Advisor"],
    venue: "Workshop (sample)",
    status: "Preprint",
    year: 2025,
    keyIdea:
      "The path an optimizer takes matters as much as where it ends. A simple momentum schedule steers training toward flatter, more general minima.",
    abstract:
      "Models that converge to sharp minima of the loss surface tend to generalise poorly. We analyse how momentum shapes the optimisation trajectory and propose a schedule that raises momentum early to cross narrow basins, then anneals it to settle in wide ones. Experiments show consistent gains in test accuracy and robustness to distribution shift at no extra cost. (Sample abstract — replace with your own.)",
    figure: "landscape",
    figureCaption:
      "Gradient descent with momentum on a non-convex loss surface. Dot density shows loss; the red trail is the optimisation path from θ₀.",
    links: { pdf: "", code: "" },
    bibtex: `@misc{hossain2025momentum,
  title  = {Escaping Sharp Minima: Momentum Schedules for Robust Training},
  author = {Hossain, Muntasir and Advisor, B.},
  year   = {2025},
  note   = {Preprint}
}`,
  },
  {
    id: "paper-4",
    title: "Learnable Spectral Decomposition for Noisy Time Series", // SAMPLE
    authors: ["M. Hossain", "C. Collaborator"],
    venue: "In preparation",
    status: "In Progress",
    year: 2026,
    keyIdea:
      "Instead of fixing the frequency basis in advance, learn it. The model separates a noisy signal into a few interpretable components.",
    abstract:
      "Classical spectral methods decompose signals using a fixed basis, which handles non-stationary, noisy real-world data poorly. We propose a differentiable decomposition layer that learns a small set of adaptive components end to end. The components stay interpretable, and the model improves forecasting accuracy on sensor and physiological datasets. (Sample abstract — replace with your own.)",
    figure: "wave",
    figureCaption:
      "A composite signal x(t) separates into three learned components and recombines. The scan line samples every component at the same instant.",
    links: {},
    bibtex: `@misc{hossain2026spectral,
  title  = {Learnable Spectral Decomposition for Noisy Time Series},
  author = {Hossain, Muntasir and Collaborator, C.},
  year   = {2026},
  note   = {In preparation}
}`,
  },
];

export const projects: Project[] = [
  // SAMPLE projects — replace.
  {
    name: "Living Paper",
    summary: "This portfolio: a research paper that animates itself.",
    description:
      "A portfolio laid out like an academic paper. Each publication gets a canvas figure that animates its core mechanism. Built with Next.js, Motion and hand-written canvas renderers, with no chart libraries.",
    stack: ["Next.js", "TypeScript", "Motion", "Canvas"],
    year: "2026",
    links: { code: "https://github.com/muntasirhossain2003/muntasir-portfolio" },
  },
  {
    name: "Project Two",
    summary: "One-line summary of what it does and why it matters.",
    description:
      "Longer description: the problem, your approach, and the result. Mention a measurable outcome if you have one (users, accuracy, speed-up).",
    stack: ["Python", "PyTorch", "FastAPI"],
    year: "2025",
    links: { code: "", demo: "" },
  },
  {
    name: "Project Three",
    summary: "One-line summary of what it does and why it matters.",
    description:
      "Longer description: the problem, your approach, and the result. Mention a measurable outcome if you have one.",
    stack: ["React", "Node.js", "PostgreSQL"],
    year: "2024",
    links: { code: "" },
  },
  {
    name: "Project Four",
    summary: "One-line summary of what it does and why it matters.",
    description:
      "Longer description: the problem, your approach, and the result. Mention a measurable outcome if you have one.",
    stack: ["C++", "OpenCV"],
    year: "2023",
    links: { code: "" },
  },
];

export const trajectory: TrajectoryItem[] = [
  // SAMPLE — most recent first.
  { kind: "research", title: "Research Assistant", org: "Your Lab", period: "2025 – now", note: "efficient deep learning" },
  { kind: "work", title: "Software Engineering Intern", org: "Company", period: "2024", note: "shipped X to Y users" },
  { kind: "award", title: "Award or Scholarship", org: "Organisation", period: "2023" },
  { kind: "education", title: "B.Sc. in Computer Science & Engineering", org: "Your University", period: "2021 – 2025", note: "CGPA x.xx / 4.00" },
];
