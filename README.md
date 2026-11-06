# MUNTASIR_OS

My portfolio as a CRT terminal. Everything graphical is live ASCII:

- boot sequence → name banner that decrypts from noise and glitches under the cursor
- a torus that morphs into a sphere (a nod to donut.c), steerable with the mouse
- each research paper runs as a "process" whose figure — a neural net, graph message passing, gradient descent, signal decomposition — is simulated in real time and rasterised to ASCII
- `neofetch` about, `ls -la` projects, `git log --graph` experience, `./contact.sh`
- a working prompt at the bottom: try `help`, `papers`, `theme amber`, `sudo hire-me`
- three phosphor colours: green, amber, ice

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Edit content

Everything lives in [`src/data/content.ts`](src/data/content.ts): profile, papers, projects, experience and links.

Each paper picks a figure:

| `figure`    | Simulation                         | Good for                          |
| ----------- | ---------------------------------- | --------------------------------- |
| `neural`    | signals flowing through layers     | deep learning, CNNs, transformers |
| `graph`     | message passing hop by hop         | GNNs, networks, knowledge graphs  |
| `landscape` | gradient descent on a loss surface | optimization, training dynamics   |
| `wave`      | signal splitting into components   | signal processing, time series    |

## How the ASCII works

`src/ascii/engine.ts` samples any canvas into a character grid; `AsciiView` paints it at 30 fps only while on screen (a single frame under reduced motion). Sources in `src/ascii/sources.ts` turn figures, a 3D torus and text into that grid.

Next.js 16 · TypeScript · Tailwind CSS v4 · Motion · canvas 2D.
