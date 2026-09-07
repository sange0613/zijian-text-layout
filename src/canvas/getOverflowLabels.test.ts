import { describe, expect, it } from 'vitest'
import { getOverflowLabels, type RectBounds } from './getOverflowLabels'

function rect(left: number, top: number, right: number, bottom: number): RectBounds {
  return { left, top, right, bottom, width: right - left, height: bottom - top }
}

describe('getOverflowLabels', () => {
  it('returns labels for text outside the canvas and removes duplicates', () => {
    const canvas = rect(0, 0, 100, 100)
    expect(
      getOverflowLabels(canvas, [
        { label: '标题', rect: rect(-4, 10, 60, 30) },
        { label: '正文', rect: rect(10, 10, 90, 90) },
        { label: '标题', rect: rect(10, 80, 90, 110) },
      ]),
    ).toEqual(['标题'])
  })

  it('ignores unmeasurable zero-sized elements', () => {
    expect(
      getOverflowLabels(rect(0, 0, 100, 100), [
        { label: '标题', rect: rect(0, 0, 0, 0) },
      ]),
    ).toEqual([])
  })
})