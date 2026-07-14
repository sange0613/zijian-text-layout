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
    titlePosition: { x: 50, y: 43 },
    bodyPosition: { x: 50, y: 59 },
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
    titlePosition: { x: 30, y: 28 },
    bodyPosition: { x: 32, y: 55 },
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
    titlePosition: { x: 33, y: 22 },
    bodyPosition: { x: 34, y: 76 },
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
    titlePosition: { x: 50, y: 46 },
    bodyPosition: { x: 50, y: 62 },
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
    titlePosition: { x: 28, y: 43 },
    bodyPosition: { x: 28, y: 64 },
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
    titlePosition: { x: 34, y: 73 },
    bodyPosition: { x: 35, y: 88 },
  },
  {
    id: 'top-left-note',
    label: '左上笔记感',
    rule: '像手帐开头，适合生活记录',
    titleStyle: {
      fontId: 'source-serif',
      fontSize: 58,
      fontWeight: 700,
      color: '#151515',
    },
    bodyStyle: {
      fontId: 'source-sans',
      fontSize: 25,
      fontWeight: 400,
      color: '#4B4B4B',
    },
    titlePosition: { x: 28, y: 25 },
    bodyPosition: { x: 30, y: 43 },
  },
  {
    id: 'right-column',
    label: '右侧竖栏感',
    rule: '右侧集中，左边留白',
    titleStyle: {
      fontId: 'huiwen-mincho',
      fontSize: 58,
      fontWeight: 700,
      color: '#151515',
    },
    bodyStyle: {
      fontId: 'source-sans',
      fontSize: 24,
      fontWeight: 400,
      color: '#4B4B4B',
    },
    titlePosition: { x: 70, y: 37 },
    bodyPosition: { x: 69, y: 58 },
  },
  {
    id: 'split-diagonal',
    label: '错位呼吸感',
    rule: '标题正文错开，更有层次',
    titleStyle: {
      fontId: 'smiley',
      fontSize: 78,
      fontWeight: 800,
      color: '#151515',
    },
    bodyStyle: {
      fontId: 'source-serif',
      fontSize: 26,
      fontWeight: 400,
      color: '#4B4B4B',
    },
    titlePosition: { x: 35, y: 35 },
    bodyPosition: { x: 64, y: 63 },
  },
  {
    id: 'bottom-center',
    label: '底部居中',
    rule: '上方留白，适合安静封面',
    titleStyle: {
      fontId: 'source-serif',
      fontSize: 68,
      fontWeight: 700,
      color: '#151515',
    },
    bodyStyle: {
      fontId: 'source-sans',
      fontSize: 25,
      fontWeight: 400,
      color: '#4B4B4B',
    },
    titlePosition: { x: 50, y: 70 },
    bodyPosition: { x: 50, y: 84 },
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
    titlePosition: preset.titlePosition,
    bodyPosition: preset.bodyPosition,
  }
}
