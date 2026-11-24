import type { EditorState, TextLayoutPreset, TextStyle } from '../types'
import { PHOTO_LAYOUT_PRESETS } from './photoLayoutPresets'
import { getCanvasSize } from '../canvas/getCanvasSize'

const card = (
  id: string,
  label: string,
  rule: string,
  textCard: NonNullable<TextLayoutPreset['textCard']>,
  title: [font: string, size: number, x: number, y: number, width: number, align: NonNullable<TextStyle['textAlign']>],
  body: [size: number, x: number, y: number, width: number, align: NonNullable<TextStyle['textAlign']>, leading: number],
): TextLayoutPreset => ({
  id: `xhs-${id}`, label, rule, textCard,
  titlePosition: { x: title[2], y: title[3] },
  bodyPosition: { x: body[1], y: body[2] },
  titleStyle: { fontId: title[0], fontSize: title[1], fontWeight: 800, color: '#171717', widthPercent: title[4], textAlign: title[5], lineHeight: 1.2 },
  bodyStyle: { fontId: 'source-sans', fontSize: body[0], fontWeight: 400, color: '#4B4B4B', widthPercent: body[3], textAlign: body[4], lineHeight: body[5] },
})

export const XHS_TEXT_LAYOUT_PRESETS = [
  card('number-list', '数字清单', '标题先写数量，正文每行一项',
    { headline: '5 件必带小物', detail: '01 充电线\n02 收纳袋\n03 水杯' },
    ['source-sans', 116, 50, 28, 78, 'left'], [44, 50, 58, 78, 'left', 1.9]),
  card('question-answer', '问答封面', '大字提问，下方短句点出答案',
    { headline: '新手怎么入门？', detail: '先做好这一步' },
    ['smiley', 104, 50, 41, 76, 'center'], [37, 50, 65, 70, 'center', 1.65]),
  card('step-guide', '步骤教程', '页眉点题，下方逐行写 ① ② ③',
    { headline: '三步整理桌面', detail: '① 清空\n② 归类\n③ 复位' },
    ['source-sans', 80, 50, 20, 80, 'left'], [47, 53, 52, 74, 'left', 2.1]),
  card('comparison', '双栏对比', '正文用空行隔开两组，自动左右分栏',
    { headline: '这两种怎么选', detail: '方案 A\n更省时\n\n方案 B\n更省钱', comparison: true },
    ['source-sans', 83, 50, 26, 84, 'center'], [40, 50, 57, 84, 'left', 1.6]),
  card('pitfalls', '避坑提醒', '醒目的结论放上方，下方补原因',
    { headline: '这三件别急买', detail: '下单前先检查尺寸和使用频率' },
    ['smiley', 112, 47, 35, 70, 'left'], [36, 57, 68, 65, 'right', 1.75]),
  card('bold-note', '三行大字报', '标题可手动分三行，正文收在底部',
    { headline: '给自己\n留一点\n空白', detail: '一份简单的生活笔记' },
    ['smiley', 152, 50, 43, 86, 'center'], [32, 50, 81, 76, 'center', 1.65]),
]

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
      fontId: 'smiley',
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
      fontId: 'source-serif',
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
      fontId: 'huiwen-mincho',
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
      fontId: 'smiley',
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
      fontId: 'source-serif',
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
      fontId: 'huiwen-mincho',
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
      fontId: 'smiley',
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
      fontId: 'source-serif',
      fontSize: 25,
      fontWeight: 400,
      color: '#4B4B4B',
    },
    titlePosition: { x: 50, y: 70 },
    bodyPosition: { x: 50, y: 84 },
  },
]

export const TEXT_LAYOUT_BY_ID = new Map(
  [...TEXT_LAYOUT_PRESETS, ...XHS_TEXT_LAYOUT_PRESETS, ...PHOTO_LAYOUT_PRESETS].map((preset) => [preset.id, preset]),
)

export const DEFAULT_TEXT_LAYOUT_ID = TEXT_LAYOUT_PRESETS[0].id

export function createTextLayoutPatch(
  presetId: string,
  current?: EditorState,
): Partial<EditorState> {
  const preset = TEXT_LAYOUT_BY_ID.get(presetId) ?? TEXT_LAYOUT_PRESETS[0]
  const size = current ? getCanvasSize(current) : undefined
  const wasPhoto = current ? Boolean(TEXT_LAYOUT_BY_ID.get(current.textLayoutId)?.photo) : false
  const scale = (preset.photo || preset.textCard) && size ? Math.min(size.width / 1242, size.height / 1656) : 1
  return {
    textLayoutId: preset.id,
    titleStyle: {
      ...preset.titleStyle,
      fontSize: Math.max(24, Math.min(2000, Math.round(preset.titleStyle.fontSize * scale))),
      color: preset.photo || wasPhoto ? preset.titleStyle.color : current?.titleStyle.color ?? preset.titleStyle.color,
    },
    bodyStyle: {
      ...preset.bodyStyle,
      fontSize: Math.max(12, Math.min(2000, Math.round(preset.bodyStyle.fontSize * scale))),
      color: preset.photo || wasPhoto ? preset.bodyStyle.color : current?.bodyStyle.color ?? preset.bodyStyle.color,
    },
    titlePosition: preset.titlePosition,
    bodyPosition: preset.bodyPosition,
    ...(preset.photo ? {
      signatureOffset: null,
      backgroundColor: preset.photo.paper,
      signatureFontId: preset.bodyStyle.fontId,
      signatureColor: preset.photo.signatureColor,
      signaturePosition: preset.photo.signaturePosition,
    } : {}),
  }
}

export function splitComparison(text: string): [string, string] | null {
  const separator = /\r?\n[ \t]*\r?\n/.exec(text)
  if (!separator) return null
  const left = text.slice(0, separator.index).trim()
  const right = text.slice(separator.index + separator[0].length).trim()
  return left && right ? [left, right] : null
}
