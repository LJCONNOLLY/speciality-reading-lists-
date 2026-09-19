// Fixed-order categorical palette (validated for CVD-safe adjacent contrast —
// see the dataviz skill's palette reference). Used decoratively here to give
// each reading its own identity color; cycle in this order, never reassign.
export const PALETTE = [
  { bg: '#2a78d6', text: '#ffffff' }, // blue
  { bg: '#eb6834', text: '#1c1b1a' }, // orange
  { bg: '#1baf7a', text: '#1c1b1a' }, // aqua
  { bg: '#eda100', text: '#1c1b1a' }, // yellow
  { bg: '#e87ba4', text: '#1c1b1a' }, // magenta
  { bg: '#008300', text: '#ffffff' }, // green
  { bg: '#4a3aa7', text: '#ffffff' }, // violet
  { bg: '#e34948', text: '#1c1b1a' }, // red
];

export function paletteSwatch(index) {
  return PALETTE[index % PALETTE.length];
}

// ---- Single-hue shade ramps (for a section that wants "shades of one
// color" instead of the multicolor categorical cycle above) ----

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16));
}

function relativeLuminance([r, g, b]) {
  const channel = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [r, g, b].map(channel);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hexA, hexB) {
  const lumA = relativeLuminance(hexToRgb(hexA));
  const lumB = relativeLuminance(hexToRgb(hexB));
  const [lighter, darker] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
  return (lighter + 0.05) / (darker + 0.05);
}

function pickTextColor(bgHex) {
  return contrastRatio(bgHex, '#ffffff') >= contrastRatio(bgHex, '#1c1b1a') ? '#ffffff' : '#1c1b1a';
}

function hslToHex(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

// Builds `count` swatches at a single hue, light-to-dark, each paired with
// whichever text color (white or dark ink) contrasts better against it.
export function hueRamp(hue, count, { saturation = 45, lMax = 82, lMin = 26 } = {}) {
  const total = Math.max(count, 1);
  return Array.from({ length: total }, (_, i) => {
    const t = total === 1 ? 0 : i / (total - 1);
    const lightness = lMax - t * (lMax - lMin);
    const bg = hslToHex(hue, saturation, lightness);
    return { bg, text: pickTextColor(bg) };
  });
}

// A wider spread of distinct, muted greens — hue varies across the ramp
// instead of just lightness, so adjacent swatches read as different named
// greens rather than steps of a single gradient. Saturation/lightness
// wobble slightly per item so it doesn't read as a smooth fade either.
// Kept to 100-148 so neither end drifts into yellow/olive or teal/cyan —
// it should read as "green," full stop, at every step.
export function softGreenRamp(count) {
  const total = Math.max(count, 1);
  const hueStart = 100;
  const hueEnd = 148;
  return Array.from({ length: total }, (_, i) => {
    const t = total === 1 ? 0.5 : i / (total - 1);
    const hue = hueStart + t * (hueEnd - hueStart);
    const saturation = 34 + (i % 3) * 6;
    const lightness = 56 + ((i + 1) % 3) * 7;
    const bg = hslToHex(hue, saturation, lightness);
    return { bg, text: pickTextColor(bg) };
  });
}

// A wider spread of natural earth tones — terracotta through brown to
// beige/tan — for a list that wants a muted, low-key identity instead of
// the bright categorical palette. Hue sweeps warm-dark to warm-light while
// saturation falls and lightness rises alongside it (matching how those
// named colors actually relate), with a little wobble so it doesn't read
// as one smooth gradient.
export function softEarthRamp(count) {
  const total = Math.max(count, 1);
  return Array.from({ length: total }, (_, i) => {
    const t = total === 1 ? 0.3 : i / (total - 1);
    const hue = 12 + t * (48 - 12);
    const saturation = 50 - t * 25 + ((i % 3) * 4 - 4);
    const lightness = 40 + t * 36 + (((i + 1) % 3) * 4 - 4);
    const bg = hslToHex(hue, saturation, lightness);
    return { bg, text: pickTextColor(bg) };
  });
}

function resolveRamp(hue, count) {
  if (hue === 'soft-green') return softGreenRamp(count);
  if (hue === 'soft-earth') return softEarthRamp(count);
  return hueRamp(hue, count);
}

// A single representative swatch for a section's spoke box: a mid-tone from
// its `hue` ramp if it has one, else the categorical palette at
// `fallbackIndex`.
export function sectionSwatch(section, fallbackIndex) {
  if (section?.hue != null) {
    return resolveRamp(section.hue, 3)[1];
  }
  return paletteSwatch(fallbackIndex);
}

// Maps every book in a list to its swatch: books in a section that defines
// a `hue` get shades of that one color family (in list order); books left
// over (no section, or a section with no `hue`) fall back to the list's
// `defaultPalette` ramp if it sets one, else the bright categorical
// palette — each keyed to its stable position within that group so a
// book's color never shifts when a filter changes.
export function bookSwatches(list) {
  const bookIdsBySection = {};
  const fallbackIds = [];
  list.books.forEach((book) => {
    const sectionDef = book.section && list.sections?.find((s) => s.id === book.section);
    if (sectionDef?.hue != null) {
      (bookIdsBySection[book.section] ||= []).push(book.id);
    } else {
      fallbackIds.push(book.id);
    }
  });

  const map = {};
  Object.entries(bookIdsBySection).forEach(([sectionId, bookIds]) => {
    const sectionDef = list.sections.find((s) => s.id === sectionId);
    const ramp = resolveRamp(sectionDef.hue, bookIds.length);
    bookIds.forEach((id, i) => {
      map[id] = ramp[i];
    });
  });

  if (list.defaultPalette) {
    const ramp = resolveRamp(list.defaultPalette, fallbackIds.length);
    fallbackIds.forEach((id, i) => {
      map[id] = ramp[i];
    });
  } else {
    list.books.forEach((book, i) => {
      if (!map[book.id]) {
        map[book.id] = paletteSwatch(i);
      }
    });
  }

  return map;
}
