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
