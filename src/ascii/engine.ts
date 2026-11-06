/** Brightness ramps, darkest → brightest. */
export const RAMP = " .:-=+*#%@";
export const BLOCKS = " ░▒▓█";
export const NOISE = "!<>-_\\/[]{}=+*^?#01$%&";

/** Tone of a cell: 0 = phosphor, 1 = hot accent, 2 = cool accent, 3 = dim. */
export type Field = {
  cols: number;
  rows: number;
  lum: Float32Array;
  tone: Uint8Array;
  /** optional per-cell glyph override (e.g. decrypt noise) */
  glyph: (string | null)[];
};

export function makeField(cols: number, rows: number): Field {
  return {
    cols,
    rows,
    lum: new Float32Array(cols * rows),
    tone: new Uint8Array(cols * rows),
    glyph: new Array(cols * rows).fill(null),
  };
}

export function clearField(f: Field) {
  f.lum.fill(0);
  f.tone.fill(0);
  f.glyph.fill(null);
}

export type StepInfo = {
  t: number;
  dt: number;
  /** pointer in cell coordinates, or -999 when outside */
  px: number;
  py: number;
  still: boolean;
};

export type AsciiSource = {
  cols: number;
  rows: number;
  ramp: string;
  step: (f: Field, s: StepInfo) => void;
};

export type Phosphor = { fg: string; dim: string; hot: string; cool: string };

export function readPhosphor(): Phosphor {
  const s = getComputedStyle(document.documentElement);
  const v = (n: string) => s.getPropertyValue(n).trim();
  return { fg: v("--fg"), dim: v("--fg-dim"), hot: v("--hot"), cool: v("--cool") };
}

export const randGlyph = () => NOISE[(Math.random() * NOISE.length) | 0];

/**
 * Sample an RGB raster into the field. Bright = ink. Red-dominant pixels become
 * the hot tone, blue-dominant the cool tone. Uses a max/avg mix so 1px lines survive.
 */
export function rasterToField(img: ImageData, f: Field, gain = 1.25) {
  const { width: W, height: H, data } = img;
  const cw = W / f.cols;
  const ch = H / f.rows;
  for (let cy = 0; cy < f.rows; cy++) {
    const y0 = Math.floor(cy * ch);
    const y1 = Math.max(y0 + 1, Math.floor((cy + 1) * ch));
    for (let cx = 0; cx < f.cols; cx++) {
      const x0 = Math.floor(cx * cw);
      const x1 = Math.max(x0 + 1, Math.floor((cx + 1) * cw));
      let max = 0;
      let sum = 0;
      let n = 0;
      let mr = 0;
      let mg = 0;
      let mb = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * W + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const l = Math.max(r, g, b) / 255;
          sum += l;
          n++;
          if (l > max) {
            max = l;
            mr = r;
            mg = g;
            mb = b;
          }
        }
      }
      const k = cy * f.cols + cx;
      const v = Math.min(1, (0.6 * max + 0.4 * (sum / n)) * gain);
      f.lum[k] = v;
      f.tone[k] = mr > mg + 60 && mr > mb + 60 ? 1 : mb > mg + 60 && mb > mr + 60 ? 2 : 0;
    }
  }
}
