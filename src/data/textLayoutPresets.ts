import type { EditorState, TextLayoutPreset } from '../types'

export const TEXT_LAYOUT_PRESETS: TextLayoutPreset[] = [
  {
    id: 'hero-title',
    label: '大标题居中',
    rule: '标题强，正文短，适合封面一句话',
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
  },
  {
    id: 'guide-list',
    label: '干货清单',
    rule: '左对齐，适合步骤/要点',
    titleStyle: {
      fontId: 'source-sans',
      fontSize: 66,
      fontWeight: 800,
      color: '#141414',
    },
    bodyStyle: {
      fontId: 'source-sans',
      fontSize: 32,
      fontWeight: 500,
      color: '#4B4B4B',
    },
  },
  {
    id: 'top-bottom',
    label: '上下分区',
    rule: '标题靠上，正文靠下',
    titleStyle: {
      fontId: 'source-serif',
      fontSize: 72,
      fontWeight: 700,
      color: '#1F1D1A',
    },
    bodyStyle: {
      fontId: 'source-sans',
      fontSize: 28,
      fontWeight: 400,
      color: '#4B4B4B',
    },
  },
  {
    id: 'center-quote',
    label: '居中金句',
    rule: '居中留白，适合情绪文案',
    titleStyle: {
      fontId: 'source-serif',
      fontSize: 76,
      fontWeight: 700,
      color: '#171717',
    },
    bodyStyle: {
      fontId: 'source-serif',
      fontSize: 26,
      fontWeight: 400,
      color: '#4B4B4B',
    },
  },
  {
    id: 'magazine-left',
    label: '左侧杂志感',
    rule: '窄栏排版，干净高级',
    titleStyle: {
      fontId: 'huiwen-mincho',
      fontSize: 62,
      fontWeight: 700,
      color: '#151515',
    },
    bodyStyle: {
      fontId: 'source-sans',
      fontSize: 24,
      fontWeight: 400,
      color: '#4B4B4B',
    },
  },
  {
    id: 'number-focus',
    label: '标题压底',
    rule: '文字靠下，适合留白图片',
    titleStyle: {
      fontId: 'smiley',
      fontSize: 96,
      fontWeight: 800,
      color: '#151515',
    },
    bodyStyle: {
      fontId: 'source-sans',
      fontSize: 30,
      fontWeight: 600,
      color: '#4B4B4B',
    },
  },
]

export const TEXT_LAYOUT_BY_ID = new Map(
  TEXT_LAYOUT_PRESETS.map((preset) => [preset.id, preset]),
)

export const DEFAULT_TEXT_LAYOUT_ID = TEXT_LAYOUT_PRESETS[0].id

export function createTextLayoutPatch(
  presetId: string,
  current?: EditorState,
): Partial<EditorState> {
  const preset = TEXT_LAYOUT_BY_ID.get(presetId) ?? TEXT_LAYOUT_PRESETS[0]
  return {
    textLayoutId: preset.id,
    titleStyle: {
      ...preset.titleStyle,
      color: current?.titleStyle.color ?? preset.titleStyle.color,
    },
    bodyStyle: {
      ...preset.bodyStyle,
      color: current?.bodyStyle.color ?? preset.bodyStyle.color,
    },
  }
}
