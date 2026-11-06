# Muntasir Hossain — Living Paper

My research portfolio as a stack of real paper in 3D. The title page turns onto the stack, the pages scatter as you scroll, and each publication is a physical sheet whose animated figure lifts off the page. Scroll turns the page with a curl shader.

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

Next.js 16 · TypeScript · Tailwind CSS v4 · three.js + react-three-fiber · custom GLSL page-curl shader · Lenis · Motion.

Page textures are typeset at runtime on canvas (`src/three/pages.ts`), so editing `content.ts` updates the 3D pages too.
