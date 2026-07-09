import { describe, expect, it } from 'vitest'
import { FONT_PRESETS, SIZE_PRESETS } from '../data/presets'
import { DEFAULT_TEXT_LAYOUT_ID } from '../data/textLayoutPresets'
import { DEFAULT_EDITOR_STATE, parseStoredState } from './editorState'

describe('editor presets', () => {
  it('contains exactly the approved fonts', () => {
    expect(FONT_PRESETS.map((font) => font.label)).toEqual([
      '思源宋体',
      '思源黑体',
      '得意黑',
      '汇文明朝体',
    ])
  })

  it('contains the five approved canvas sizes', () => {
    expect(SIZE_PRESETS.map(({ width, height }) => [width, height])).toEqual([
      [1242, 1656],
      [1080, 1080],
      [900, 383],
      [1080, 1920],
      [1920, 1080],
    ])
  })
})

describe('parseStoredState', () => {
  it('returns the default state for malformed JSON', () => {
    expect(parseStoredState('{broken')).toEqual(DEFAULT_EDITOR_STATE)
  })

  it('returns the default state for invalid saved values', () => {
    expect(parseStoredState('{"title":12}')).toEqual(DEFAULT_EDITOR_STATE)
  })

  it('restores a valid saved state', () => {
    const saved = { ...DEFAULT_EDITOR_STATE, title: '新的标题', sizeId: 'square' }
    expect(parseStoredState(JSON.stringify(saved))).toEqual(saved)
  })

  it('adds the default text layout to legacy state', () => {
    const legacy = { ...DEFAULT_EDITOR_STATE } as Record<string, unknown>
    delete legacy.textLayoutId

    expect(parseStoredState(JSON.stringify(legacy))).toEqual({
      ...legacy,
      textLayoutId: DEFAULT_TEXT_LAYOUT_ID,
    })
  })

  it('rejects an unknown text layout', () => {
    const saved = { ...DEFAULT_EDITOR_STATE, textLayoutId: 'unknown-layout' }
    expect(parseStoredState(JSON.stringify(saved))).toEqual(DEFAULT_EDITOR_STATE)
  })

  it('adds default custom dimensions to legacy state', () => {
    const legacy = { ...DEFAULT_EDITOR_STATE } as Record<string, unknown>
    delete legacy.customWidth
    delete legacy.customHeight

    expect(parseStoredState(JSON.stringify(legacy))).toMatchObject({
      customWidth: 1080,
      customHeight: 1080,
    })
  })

  it('restores and clamps custom canvas dimensions', () => {
    const saved = {
      ...DEFAULT_EDITOR_STATE,
      sizeId: 'custom',
      customWidth: 5000,
      customHeight: 720,
    }

    expect(parseStoredState(JSON.stringify(saved))).toMatchObject({
      sizeId: 'custom',
      customWidth: 4096,
      customHeight: 720,
    })
  })

  it('adds an empty signature to a valid legacy state', () => {
    const legacy = { ...DEFAULT_EDITOR_STATE } as Record<string, unknown>
    delete legacy.signature

    expect(parseStoredState(JSON.stringify(legacy))).toEqual({
      ...legacy,
      signature: '',
    })
  })

  it('restores a signature in the current state', () => {
    const saved = { ...DEFAULT_EDITOR_STATE, signature: '摄影 / 林野' }
    expect(parseStoredState(JSON.stringify(saved))).toEqual(saved)
  })

  it('adds the default signature position to a valid legacy state', () => {
    const legacy = { ...DEFAULT_EDITOR_STATE } as Record<string, unknown>
    delete legacy.signaturePosition

    expect(parseStoredState(JSON.stringify(legacy))).toEqual({
      ...legacy,
      signaturePosition: 'bottom-left',
    })
  })

  it('restores a valid signature position', () => {
    const saved = { ...DEFAULT_EDITOR_STATE, signaturePosition: 'top-center' as const }
    expect(parseStoredState(JSON.stringify(saved))).toEqual(saved)
  })

  it('uses the saved body font when migrating a legacy signature font', () => {
    const legacy = { ...DEFAULT_EDITOR_STATE } as Record<string, unknown>
    delete legacy.signatureFontId

    expect(parseStoredState(JSON.stringify(legacy))).toEqual({
      ...legacy,
      signatureFontId: DEFAULT_EDITOR_STATE.bodyStyle.fontId,
    })
  })

  it('restores an independent signature font', () => {
    const saved = { ...DEFAULT_EDITOR_STATE, signatureFontId: 'huiwen-mincho' }
    expect(parseStoredState(JSON.stringify(saved))).toEqual(saved)
  })

  it('migrates a legacy signature size from the saved body size', () => {
    const legacy = { ...DEFAULT_EDITOR_STATE } as Record<string, unknown>
    delete legacy.signatureFontSize
    legacy.bodyStyle = { ...DEFAULT_EDITOR_STATE.bodyStyle, fontSize: 40 }

    expect(parseStoredState(JSON.stringify(legacy))).toMatchObject({
      signatureFontSize: 29,
    })
  })

  it('restores an independent signature size', () => {
    const saved = { ...DEFAULT_EDITOR_STATE, signatureFontSize: 36 }
    expect(parseStoredState(JSON.stringify(saved))).toEqual(saved)
  })

  it('clamps a saved signature size to the slider range', () => {
    const saved = { ...DEFAULT_EDITOR_STATE, signatureFontSize: 90 }
    expect(parseStoredState(JSON.stringify(saved))).toMatchObject({ signatureFontSize: 64 })
  })

  it('rejects an unknown signature font', () => {
    const saved = { ...DEFAULT_EDITOR_STATE, signatureFontId: 'unknown-font' }
    expect(parseStoredState(JSON.stringify(saved))).toEqual(DEFAULT_EDITOR_STATE)
  })

  it('rejects an unknown signature position', () => {
    const saved = { ...DEFAULT_EDITOR_STATE, signaturePosition: 'middle' }
    expect(parseStoredState(JSON.stringify(saved))).toEqual(DEFAULT_EDITOR_STATE)
  })

  it('clamps legacy font sizes to the slider ranges', () => {
    const saved = {
      ...DEFAULT_EDITOR_STATE,
      titleStyle: { ...DEFAULT_EDITOR_STATE.titleStyle, fontSize: 200 },
      bodyStyle: { ...DEFAULT_EDITOR_STATE.bodyStyle, fontSize: 120 },
    }

    expect(parseStoredState(JSON.stringify(saved))).toMatchObject({
      titleStyle: { fontSize: 160 },
      bodyStyle: { fontSize: 80 },
    })
  })
})
