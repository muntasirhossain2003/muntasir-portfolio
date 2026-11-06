/** Tiny shared signal: when the boot screen finished (performance.now() seconds). */
let doneAt = -1;
const listeners = new Set<() => void>();

export const boot = {
  get doneAt() {
    return doneAt;
  },
  finish() {
    if (doneAt >= 0) return;
    doneAt = performance.now() / 1000;
    listeners.forEach((l) => l());
  },
  /** seconds since boot finished, or -1 while booting */
  since() {
    return doneAt < 0 ? -1 : performance.now() / 1000 - doneAt;
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
