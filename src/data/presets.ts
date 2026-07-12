import type { FontPreset, SizePreset } from '../types'

export const FONT_PRESETS: FontPreset[] = [
  {
    id: 'source-serif',
    label: '思源宋体',
    family: 'Noto Serif SC',
    fallback: 'Songti SC, STSong, serif',
    usage: '文艺 · 正文',
  },
  {
    id: 'source-sans',
    label: '思源黑体',
    family: 'Noto Sans SC',
    fallback: 'PingFang SC, Microsoft YaHei, sans-serif',
    usage: '清晰 · 通用',
  },
  {
    id: 'smiley',
    label: '得意黑',
    family: 'Smiley Sans',
    fallback: 'PingFang SC, Microsoft YaHei, sans-serif',
    usage: '醒目 · 标题',
  },
  {
    id: 'huiwen-mincho',
    label: '汇文明朝体',
    family: 'Huiwen Mincho',
    fallback: 'Songti SC, STSong, serif',
    usage: '复古 · 海报',
  },
]

export const SIZE_PRESETS: SizePreset[] = [
  { id: 'redbook', label: '小红书 3:4', detail: '1242 × 1656', width: 1242, height: 1656 },
  { id: 'square', label: '方图 1:1', detail: '1080 × 1080', width: 1080, height: 1080 },
  { id: 'wechat', label: '公众号首图', detail: '900 × 383', width: 900, height: 383 },
  { id: 'mini-program-vertical', label: '小程序竖图', detail: '750 × 1000', width: 750, height: 1000 },
  { id: 'wechat-vertical', label: '公众号竖图', detail: '900 × 1200', width: 900, height: 1200 },
  { id: 'story', label: '手机竖版', detail: '1080 × 1920', width: 1080, height: 1920 },
  { id: 'landscape', label: '横版 16:9', detail: '1920 × 1080', width: 1920, height: 1080 },
]

export const FONT_BY_ID = new Map(FONT_PRESETS.map((font) => [font.id, font]))
export const SIZE_BY_ID = new Map(SIZE_PRESETS.map((size) => [size.id, size]))
