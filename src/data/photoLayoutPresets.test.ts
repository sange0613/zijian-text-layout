import { expect, it } from 'vitest'
import { PHOTO_LAYOUT_PRESETS } from './photoLayoutPresets'
import { FONT_BY_ID } from './presets'
import { createTextLayoutPatch } from './textLayoutPresets'
import { DEFAULT_EDITOR_STATE, parseStoredState } from '../state/editorState'

it.each(PHOTO_LAYOUT_PRESETS)('keeps $label inside the canvas and restores it from saved records', (preset) => {
  const frame = preset.photo!.frame
  expect(frame.x + frame.width).toBeLessThanOrEqual(100)
  expect(frame.y + frame.height).toBeLessThanOrEqual(100)
  expect(frame.width).toBeGreaterThan(0)
  expect(frame.height).toBeGreaterThan(0)
  expect(FONT_BY_ID.has(preset.titleStyle.fontId)).toBe(true)
  expect(preset.bodyStyle.fontId).toBe(preset.titleStyle.fontId)
  const saved = { ...DEFAULT_EDITOR_STATE, ...createTextLayoutPatch(preset.id, DEFAULT_EDITOR_STATE) }
  expect(parseStoredState(JSON.stringify(saved))).toEqual(saved)
})

it('scales the typography to a smaller canvas without changing its dimensions', () => {
  const state = { ...DEFAULT_EDITOR_STATE, sizeId: 'custom', customWidth: 621, customHeight: 828 }
  const patch = createTextLayoutPatch('photo-full-title', state)
  expect(patch.titleStyle?.fontSize).toBe(52)
  expect(patch).not.toHaveProperty('sizeId')
})

it('restores readable dark text when switching from a white photo title to a text preset', () => {
  const photoState = { ...DEFAULT_EDITOR_STATE, ...createTextLayoutPatch('photo-full-title', DEFAULT_EDITOR_STATE) }
  const patch = createTextLayoutPatch('center-quote', photoState)
  expect(patch.titleStyle?.color).toBe('#171717')
  expect(patch.titleStyle).not.toHaveProperty('widthPercent')
})
