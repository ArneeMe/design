export const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
export const hex = c => "#" + c.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
export const mix = (a, b, t) => hex(rgb(a).map((v, i) => v + (rgb(b)[i] - v) * t));

export const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const bayer = (x, y) => BAYER4[(y & 3) * 4 + (x & 3)];
export const dither = (x, y, t) => t * 16 > bayer(x, y) + 0.5;

export class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 4);
  }
  set(x, y, color, alpha = 255) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.data.set([...rgb(color), alpha], i);
  }
  rect(x, y, w, h, color) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, color);
  }
  scaled(s) {
    const out = new Canvas(this.w * s, this.h * s);
    for (let y = 0; y < out.h; y++)
      for (let x = 0; x < out.w; x++) {
        const i = ((y / s | 0) * this.w + (x / s | 0)) * 4;
        out.data.set(this.data.subarray(i, i + 4), (y * out.w + x) * 4);
      }
    return out;
  }
  halved() {
    const out = new Canvas(this.w >> 1, this.h >> 1);
    for (let y = 0; y < out.h; y++)
      for (let x = 0; x < out.w; x++) {
        const px = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([dx, dy]) => this.data.subarray(((2 * y + dy) * this.w + 2 * x + dx) * 4, ((2 * y + dy) * this.w + 2 * x + dx) * 4 + 4));
        const a = px.reduce((s, p) => s + p[3], 0);
        const o = (y * out.w + x) * 4;
        for (let c = 0; c < 3; c++) out.data[o + c] = a ? Math.round(px.reduce((s, p) => s + p[c] * p[3], 0) / a) : 0;
        out.data[o + 3] = Math.round(a / 4);
      }
    return out;
  }
}
