export type RectBounds = Pick<DOMRect, 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height'>

export type LabeledRect = {
  label: string
  rect: RectBounds
}

export function getOverflowLabels(
  canvas: RectBounds,
  elements: LabeledRect[],
  tolerance = 1,
) {
  const labels = new Set<string>()
  for (const element of elements) {
    if (element.rect.width === 0 && element.rect.height === 0) continue
    if (
      element.rect.left < canvas.left - tolerance ||
      element.rect.top < canvas.top - tolerance ||
      element.rect.right > canvas.right + tolerance ||
      element.rect.bottom > canvas.bottom + tolerance
    ) {
      labels.add(element.label)
    }
  }
  return [...labels]
}
