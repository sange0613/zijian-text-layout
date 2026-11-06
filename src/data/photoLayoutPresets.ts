import type { TextLayoutPreset, TextStyle } from '../types'

const full = { x: 0, y: 0, width: 100, height: 100 }
const white = '#FFFFFF'
const ink = '#252722'
const paper = '#F7F5EF'
const text = (fontId: string, fontSize: number, color: string, widthPercent: number, textAlign: TextStyle['textAlign'] = 'left', fontWeight = 400): TextStyle =>
  ({ fontId, fontSize, fontWeight, color, widthPercent, textAlign, lineHeight: 1.45 })

// Original compositions based on recurring photo/text patterns, not a platform ranking.
export const PHOTO_LAYOUT_PRESETS: TextLayoutPreset[] = [
  {
    id: 'photo-full-title', label: '全屏大字', rule: '照片铺满，标题居中；适合旅行、活动',
    titleStyle: text('source-sans', 104, white, 82, 'center', 800),
    bodyStyle: text('source-sans', 32, white, 72, 'center'),
    titlePosition: { x: 50, y: 43 }, bodyPosition: { x: 50, y: 61 },
    photo: { frame: full, paper, category: '旅行 · 活动', signaturePosition: 'bottom-center', signatureColor: white,
      overlays: [{ ...full, background: 'linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.48) 52%,rgba(0,0,0,.14))' }] },
  },
  {
    id: 'photo-bottom-title', label: '底部压字', rule: '上方展示主体，文字压底；适合探店、家居',
    titleStyle: text('smiley', 96, white, 82, 'left', 800),
    bodyStyle: text('smiley', 32, white, 80),
    titlePosition: { x: 50, y: 73 }, bodyPosition: { x: 50, y: 86 },
    photo: { frame: full, paper, category: '探店 · 家居', signaturePosition: 'top-left', signatureColor: white,
      overlays: [{ ...full, background: 'linear-gradient(180deg,transparent 30%,rgba(0,0,0,.12) 52%,rgba(0,0,0,.74))' }] },
  },
  {
    id: 'photo-top-paper', label: '顶部留白', rule: '标题在上、照片在下；适合攻略、知识分享',
    titleStyle: text('source-sans', 88, ink, 84, 'left', 800),
    bodyStyle: text('source-sans', 30, ink, 84),
    titlePosition: { x: 50, y: 14 }, bodyPosition: { x: 50, y: 27 },
    photo: { frame: { x: 0, y: 35, width: 100, height: 65 }, paper, category: '攻略 · 教程', signaturePosition: 'bottom-right', signatureColor: white, overlays: [] },
  },
  {
    id: 'photo-bottom-paper', label: '上图下文', rule: '照片与文字分区；适合好物、读书笔记',
    titleStyle: text('source-serif', 80, ink, 82, 'center', 600),
    bodyStyle: text('source-serif', 30, ink, 80, 'center'),
    titlePosition: { x: 50, y: 74 }, bodyPosition: { x: 50, y: 85 },
    photo: { frame: { x: 0, y: 0, width: 100, height: 63 }, paper, category: '好物 · 读书', signaturePosition: 'bottom-center', signatureColor: ink, overlays: [] },
  },
  {
    id: 'photo-right-image', label: '左文右图', rule: '左侧讲重点，右侧展示照片；适合产品、穿搭',
    titleStyle: text('source-serif', 72, ink, 32, 'left', 600),
    bodyStyle: text('source-serif', 30, ink, 32),
    titlePosition: { x: 23, y: 31 }, bodyPosition: { x: 23, y: 60 },
    photo: { frame: { x: 46, y: 0, width: 54, height: 100 }, paper, category: '产品 · 穿搭', signaturePosition: 'bottom-left', signatureColor: ink, overlays: [] },
  },
  {
    id: 'photo-left-image', label: '左图右文', rule: '左侧保留画面，右侧窄栏；适合空间、生活方式',
    titleStyle: text('source-serif', 72, ink, 32, 'left', 600),
    bodyStyle: text('source-serif', 30, ink, 32),
    titlePosition: { x: 77, y: 31 }, bodyPosition: { x: 77, y: 60 },
    photo: { frame: { x: 0, y: 0, width: 54, height: 100 }, paper, category: '空间 · 生活', signaturePosition: 'bottom-right', signatureColor: ink, overlays: [] },
  },
  {
    id: 'photo-polaroid', label: '拍立得留白', rule: '照片四周留边，底部写字；适合日常、旅行手记',
    titleStyle: text('huiwen-mincho', 72, ink, 80, 'center'),
    bodyStyle: text('huiwen-mincho', 30, ink, 76, 'center'),
    titlePosition: { x: 50, y: 80 }, bodyPosition: { x: 50, y: 89 },
    photo: { frame: { x: 8, y: 7, width: 84, height: 64 }, paper: '#FCFBF7', category: '日常 · 手记', signaturePosition: 'bottom-right', signatureColor: ink, overlays: [] },
  },
  {
    id: 'photo-corner-note', label: '左上叠字', rule: '文字放在左上安静区；适合风景、情绪记录',
    titleStyle: text('zhuque-fangsong', 84, white, 68),
    bodyStyle: text('zhuque-fangsong', 32, white, 60),
    titlePosition: { x: 42, y: 20 }, bodyPosition: { x: 38, y: 37 },
    photo: { frame: full, paper, category: '风景 · 情绪', signaturePosition: 'bottom-right', signatureColor: white,
      overlays: [{ ...full, background: 'linear-gradient(135deg,rgba(0,0,0,.66),rgba(0,0,0,.05) 72%)' }] },
  },
  {
    id: 'photo-editorial', label: '杂志边栏', rule: '页眉大标题，边栏配照片；适合摄影、作品集',
    titleStyle: text('source-serif', 86, ink, 84, 'left', 600),
    bodyStyle: text('source-serif', 30, ink, 23),
    titlePosition: { x: 50, y: 11 }, bodyPosition: { x: 19, y: 58 },
    photo: { frame: { x: 36, y: 23, width: 56, height: 69 }, paper, category: '摄影 · 作品', signaturePosition: 'bottom-left', signatureColor: ink, overlays: [] },
  },
  {
    id: 'photo-glass-card', label: '半透明字卡', rule: '照片做底，浅色卡片承载文字；适合清单、金句',
    titleStyle: text('source-sans', 84, ink, 68, 'center', 700),
    bodyStyle: text('source-sans', 32, ink, 66, 'center'),
    titlePosition: { x: 50, y: 42 }, bodyPosition: { x: 50, y: 58 },
    photo: { frame: full, paper, category: '清单 · 金句', signaturePosition: 'bottom-center', signatureColor: white,
      overlays: [{ x: 8, y: 28, width: 84, height: 44, background: 'rgba(255,255,255,.9)' }] },
  },
]
