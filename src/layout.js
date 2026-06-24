export function calculatePreviewScale(containerWidth, documentWidth = 794, horizontalPadding = 24) {
  const width = Number(containerWidth);
  if (!Number.isFinite(width) || width <= 0) return 1;
  return Math.min(1, Math.max(0.2, (width - horizontalPadding) / documentWidth));
}
