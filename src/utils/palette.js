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

function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  return { h: h * 60, s: s * 100, l: l * 100 };
}

// A soft pastel version of any hex color, keeping its hue but flattening
// saturation and lifting lightness — used for diagram "heading" areas
// (spoke boxes, hub) that should stay soft no matter how bold the color
// they're derived from is.
export function pastelize(hex, { saturation = 26, lightness = 87 } = {}) {
  const { h } = hexToHsl(hex);
  const bg = hslToHex(h, saturation, lightness);
  return { bg, text: pickTextColor(bg) };
}

// Builds `count` swatches around a single hue, each paired with whichever
// text color (white or dark ink) contrasts better against it. A narrow hue
// band (base +/- spread/2) plus out-of-phase saturation/lightness cycles
// (periods 3 and 4, same trick as softGreenRamp) keep every step reading as
// "that color family" while still landing in clearly different light/
// medium/dark bands — a plain lightness fade goes muddy once a section has
// more than a handful of books, since the whole range gets divided into
// slivers too small to tell apart.
export function hueRamp(hue, count, { spread = 24, saturation = 34, lMax = 80, lMin = 46 } = {}) {
  const total = Math.max(count, 1);
  return Array.from({ length: total }, (_, i) => {
    const t = total === 1 ? 0.5 : i / (total - 1);
    const h = hue - spread / 2 + t * spread;
    const s = saturation + (i % 3) * 13;
    const l = lMax - ((i + 2) % 4) * ((lMax - lMin) / 3);
    const bg = hslToHex(h, s, l);
    return { bg, text: pickTextColor(bg) };
  });
}

// A wider spread of distinct, muted greens — hue varies across the ramp
// instead of just lightness, so adjacent swatches read as different named
// greens rather than steps of a single gradient. Kept to 100-148 so neither
// end drifts into yellow/olive or teal/cyan — it should read as "green,"
// full stop, at every step. Saturation and lightness each cycle on their
// own out-of-phase period (3 and 4) so adjacent items land in clearly
// different light/medium/dark bands instead of all clustering at "medium."
export function softGreenRamp(count) {
  const total = Math.max(count, 1);
  const hueStart = 100;
  const hueEnd = 148;
  return Array.from({ length: total }, (_, i) => {
    const t = total === 1 ? 0.5 : i / (total - 1);
    const hue = hueStart + t * (hueEnd - hueStart);
    const saturation = 26 + (i % 3) * 15;
    const lightness = 40 + ((i + 2) % 4) * 13;
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

// A section's spoke-box swatch: always a soft pastel in that section's hue
// family, independent of however bold/varied its books' own ramp is — the
// "heading" areas (spoke boxes, hub) stay soft even when the reading
// buttons underneath them are more saturated for distinctness.
export function sectionSwatch(section, fallbackIndex) {
  if (section?.hue === 'soft-green') return pastelize('#3aa050');
  if (section?.hue === 'soft-earth') return pastelize('#a15c38');
  if (typeof section?.hue === 'number') return pastelize(hslToHex(section.hue, 45, 45));
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
