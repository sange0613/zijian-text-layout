import { FONT_BY_ID, SIZE_BY_ID } from '../data/presets'
import { DEFAULT_TEXT_LAYOUT_ID, TEXT_LAYOUT_BY_ID } from '../data/textLayoutPresets'
import type {
  CustomTextBlock,
  EditorState,
  SignaturePosition,
  TextBlockPosition,
  TextStyle,
} from '../types'

export const STORAGE_KEY = 'zijian-editor-state-v1'

export const DEFAULT_EDITOR_STATE: EditorState = {
  title: '留一点空白，\n给生活呼吸',
  body: '好的排版让文字慢下来。标题负责建立节奏，正文留出足够的行间距，让每一句话都被看见。',
  signature: '',
  textLayoutId: DEFAULT_TEXT_LAYOUT_ID,
  signaturePosition: 'bottom-left',
  signatureFontId: 'source-sans',
  signatureFontSize: 20,
  titleStyle: {
    fontId: 'smiley',
    fontSize: 88,
    fontWeight: 800,
    color: '#111111',
  },
  bodyStyle: {
    fontId: 'source-sans',
    fontSize: 28,
    fontWeight: 500,
    color: '#4B4B4B',
  },
  titlePosition: { x: 50, y: 43 },
  bodyPosition: { x: 50, y: 59 },
  customTextBlocks: [],
  backgroundColor: '#FFFFFF',
  sizeId: 'redbook',
  customWidth: 1080,
  customHeight: 1080,
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const SIGNATURE_POSITIONS = new Set([
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
])

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isTextStyle(value: unknown): value is TextStyle {
  if (!value || typeof value !== 'object') return false
  const style = value as Record<string, unknown>
  return (
    typeof style.fontId === 'string' &&
    FONT_BY_ID.has(style.fontId) &&
    typeof style.fontSize === 'number' &&
    Number.isFinite(style.fontSize) &&
    style.fontSize >= 12 &&
    style.fontSize <= 240 &&
    typeof style.fontWeight === 'number' &&
    [400, 500, 600, 700, 800, 900].includes(style.fontWeight) &&
    typeof style.color === 'string' &&
    HEX_COLOR.test(style.color)
  )
}

function isSignaturePosition(value: unknown): value is SignaturePosition {
  return typeof value === 'string' && SIGNATURE_POSITIONS.has(value)
}

function isTextBlockPosition(value: unknown): value is TextBlockPosition {
  if (!value || typeof value !== 'object') return false
  const position = value as Record<string, unknown>
  return (
    typeof position.x === 'number' &&
    Number.isFinite(position.x) &&
    position.x >= 0 &&
    position.x <= 100 &&
    typeof position.y === 'number' &&
    Number.isFinite(position.y) &&
    position.y >= 0 &&
    position.y <= 100
  )
}

function isCustomTextBlock(value: unknown): value is CustomTextBlock {
  if (!value || typeof value !== 'object') return false
  const block = value as Record<string, unknown>
  return (
    typeof block.id === 'string' &&
    typeof block.text === 'string' &&
    typeof block.fontId === 'string' &&
    FONT_BY_ID.has(block.fontId) &&
    typeof block.fontSize === 'number' &&
    Number.isFinite(block.fontSize) &&
    block.fontSize >= 12 &&
    block.fontSize <= 160 &&
    typeof block.fontWeight === 'number' &&
    [400, 500, 600, 700, 800, 900].includes(block.fontWeight) &&
    typeof block.color === 'string' &&
    HEX_COLOR.test(block.color) &&
    isTextBlockPosition(block.position)
  )
}

function isCanvasDimension(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 10000
  )
}

function isEditorState(value: unknown): value is EditorState {
  if (!value || typeof value !== 'object') return false
  const state = value as Record<string, unknown>
  return (
    typeof state.title === 'string' &&
    typeof state.body === 'string' &&
    typeof state.signature === 'string' &&
    typeof state.textLayoutId === 'string' &&
    TEXT_LAYOUT_BY_ID.has(state.textLayoutId) &&
    isSignaturePosition(state.signaturePosition) &&
    typeof state.signatureFontId === 'string' &&
    FONT_BY_ID.has(state.signatureFontId) &&
    typeof state.signatureFontSize === 'number' &&
    Number.isFinite(state.signatureFontSize) &&
    state.signatureFontSize >= 12 &&
    state.signatureFontSize <= 240 &&
    isTextStyle(state.titleStyle) &&
    isTextStyle(state.bodyStyle) &&
    isTextBlockPosition(state.titlePosition) &&
    isTextBlockPosition(state.bodyPosition) &&
    Array.isArray(state.customTextBlocks) &&
    state.customTextBlocks.every(isCustomTextBlock) &&
    typeof state.backgroundColor === 'string' &&
    HEX_COLOR.test(state.backgroundColor) &&
    typeof state.sizeId === 'string' &&
    (SIZE_BY_ID.has(state.sizeId) || state.sizeId === 'custom') &&
    isCanvasDimension(state.customWidth) &&
    isCanvasDimension(state.customHeight)
  )
}

export function parseStoredState(raw: string | null): EditorState {
  if (!raw) return DEFAULT_EDITOR_STATE
  try {
    const value: unknown = JSON.parse(raw)
    const legacyBodyFontSize =
      value &&
      typeof value === 'object' &&
      'bodyStyle' in value &&
      value.bodyStyle &&
      typeof value.bodyStyle === 'object' &&
      'fontSize' in value.bodyStyle &&
      typeof value.bodyStyle.fontSize === 'number' &&
      Number.isFinite(value.bodyStyle.fontSize)
        ? clamp(value.bodyStyle.fontSize, 12, 80)
        : DEFAULT_EDITOR_STATE.bodyStyle.fontSize
    const candidate =
      value && typeof value === 'object'
        ? {
            ...value,
            ...(!('signature' in value) ? { signature: '' } : {}),
            ...(!('textLayoutId' in value)
              ? { textLayoutId: DEFAULT_TEXT_LAYOUT_ID }
              : {}),
            ...(!('signaturePosition' in value)
              ? { signaturePosition: 'bottom-left' as const }
              : {}),
            ...(!('signatureFontId' in value) &&
              'bodyStyle' in value &&
              value.bodyStyle &&
              typeof value.bodyStyle === 'object' &&
              'fontId' in value.bodyStyle &&
              typeof value.bodyStyle.fontId === 'string'
              ? { signatureFontId: value.bodyStyle.fontId }
              : {}),
            ...(!('signatureFontSize' in value)
              ? {
                  signatureFontSize: Math.round(
                    Math.max(14, legacyBodyFontSize * 0.72),
                  ),
                }
              : {}),
            ...(!('titlePosition' in value)
              ? { titlePosition: DEFAULT_EDITOR_STATE.titlePosition }
              : {}),
            ...(!('bodyPosition' in value)
              ? { bodyPosition: DEFAULT_EDITOR_STATE.bodyPosition }
              : {}),
            ...(!('customTextBlocks' in value) ? { customTextBlocks: [] } : {}),
            ...(!('customWidth' in value) ? { customWidth: 1080 } : {}),
            ...(!('customHeight' in value) ? { customHeight: 1080 } : {}),
          }
        : value
    if (!isEditorState(candidate)) return DEFAULT_EDITOR_STATE
    return {
      ...candidate,
      titleStyle: {
        ...candidate.titleStyle,
        fontSize: clamp(candidate.titleStyle.fontSize, 24, 160),
      },
      bodyStyle: {
        ...candidate.bodyStyle,
        fontSize: clamp(candidate.bodyStyle.fontSize, 12, 80),
      },
      titlePosition: {
        x: clamp(candidate.titlePosition.x, 0, 100),
        y: clamp(candidate.titlePosition.y, 0, 100),
      },
      bodyPosition: {
        x: clamp(candidate.bodyPosition.x, 0, 100),
        y: clamp(candidate.bodyPosition.y, 0, 100),
      },
      customTextBlocks: candidate.customTextBlocks.slice(0, 12).map((block) => ({
        ...block,
        text: block.text.slice(0, 200),
        fontSize: clamp(block.fontSize, 12, 120),
        position: {
          x: clamp(block.position.x, 0, 100),
          y: clamp(block.position.y, 0, 100),
        },
      })),
      signatureFontSize: clamp(candidate.signatureFontSize, 12, 64),
      customWidth: Math.round(clamp(candidate.customWidth, 320, 4096)),
      customHeight: Math.round(clamp(candidate.customHeight, 320, 4096)),
    }
  } catch {
    return DEFAULT_EDITOR_STATE
  }
}
