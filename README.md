# Muntasir Hossain — Living Paper

My research portfolio, laid out like an academic paper. Each publication has a live canvas figure that animates its core idea.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Edit content

Everything lives in [`src/data/content.ts`](src/data/content.ts): profile, abstract, papers, projects, trajectory and links.

Each paper picks one animated figure:

| `figure`    | Shows                                 | Good for                         |
| ----------- | ------------------------------------- | -------------------------------- |
| `neural`    | signals flowing through layers        | deep learning, CNNs, transformers |
| `graph`     | message passing hop by hop            | GNNs, networks, knowledge graphs |
| `landscape` | gradient descent on a loss surface    | optimization, training dynamics  |
| `wave`      | signal splitting into components      | signal processing, time series   |

Put your CV at `public/cv.pdf` and set `links.cv` to `/cv.pdf`.

## Stack

Next.js 16 · TypeScript · Tailwind CSS v4 · Motion · hand-written canvas renderers.
