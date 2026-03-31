export const BAR_HEIGHT_CLASSES = [
  'h-[8%]',
  'h-[16%]',
  'h-[24%]',
  'h-[32%]',
  'h-[40%]',
  'h-[48%]',
  'h-[56%]',
  'h-[64%]',
  'h-[72%]',
  'h-[80%]',
  'h-[88%]',
  'h-[96%]',
];

export function barHeightClass(pct) {
  const clamped = Math.max(0, Math.min(100, pct));
  const i = Math.min(BAR_HEIGHT_CLASSES.length - 1, Math.floor((clamped / 100) * BAR_HEIGHT_CLASSES.length));
  return BAR_HEIGHT_CLASSES[i];
}
