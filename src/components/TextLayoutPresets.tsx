import { useState } from 'react'
import { splitComparison, TEXT_LAYOUT_PRESETS, XHS_TEXT_LAYOUT_PRESETS } from '../data/textLayoutPresets'
import { PHOTO_LAYOUT_PRESETS } from '../data/photoLayoutPresets'
import { FONT_BY_ID } from '../data/presets'
import type { TextBlockPosition, TextLayoutPreset, TextStyle } from '../types'

type TextLayoutPresetsProps = {
  value: string
  onChange: (value: string) => void
}

function miniatureTextStyle(position: TextBlockPosition, style: TextStyle) {
  return { left: `${position.x}%`, top: `${position.y}%`, width: `${style.widthPercent}%`, color: style.color, textAlign: style.textAlign }
}

function LayoutMiniature({ preset }: { preset: TextLayoutPreset }) {
  const { photo, textCard } = preset
  if (!photo && !textCard) return null
  const columns = textCard?.comparison ? splitComparison(textCard.detail) : null
  return (
    <span className="layout-miniature" aria-hidden="true" style={{ background: photo?.paper ?? '#fff' }}>
      {photo ? <>
        <span className="layout-miniature-image" style={{ left: `${photo.frame.x}%`, top: `${photo.frame.y}%`, width: `${photo.frame.width}%`, height: `${photo.frame.height}%` }} />
        {photo.overlays.map((overlay, index) => <span key={index} className="layout-miniature-overlay" style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, width: `${overlay.width}%`, height: `${overlay.height}%`, background: overlay.background }} />)}
      </> : null}
      <span className="layout-miniature-title" style={{
        ...miniatureTextStyle(preset.titlePosition, preset.titleStyle),
        fontSize: textCard ? Math.max(4, preset.titleStyle.fontSize * 50 / 1242) : undefined,
      }}>{textCard?.headline ?? '标题文字'}</span>
      <span className={`layout-miniature-body${columns ? ' text-card-comparison' : ''}`} style={miniatureTextStyle(preset.bodyPosition, preset.bodyStyle)}>
        {columns ? <><span>{columns[0]}</span><span>{columns[1]}</span></> : textCard?.detail ?? '正文说明'}
      </span>
    </span>
  )
}

export function TextLayoutPresets({ value, onChange }: TextLayoutPresetsProps) {
  const [tab, setTab] = useState<'photo' | 'text'>(() => XHS_TEXT_LAYOUT_PRESETS.some(({ id }) => id === value) ? 'text' : 'photo')
  const groups = tab === 'photo' ? [{ label: '', presets: PHOTO_LAYOUT_PRESETS }] : [
    { label: '小红书常用 · 6 套', presets: XHS_TEXT_LAYOUT_PRESETS },
    { label: '经典排版 · 10 套', presets: TEXT_LAYOUT_PRESETS },
  ]
  return (
    <fieldset className="settings-section text-layout-presets">
      <legend>排版构图</legend>
      <div className="layout-type-tabs" role="group" aria-label="构图类型">
        <button type="button" aria-pressed={tab === 'photo'} onClick={() => setTab('photo')}>图片配文字 · 10 套</button>
        <button type="button" aria-pressed={tab === 'text'} onClick={() => setTab('text')}>纯文字排版</button>
      </div>
      <p className="layout-preset-hint">{tab === 'photo' ? '先选构图，再上传照片。标题建议 1–2 行，正文 3–4 行。' : '一键套用字号、字体和布局，不改你的文案。'}</p>
      {groups.map((group) => (
        <div key={group.label}>
          {group.label ? <p className="layout-preset-group-label">{group.label}</p> : null}
          <div className="layout-preset-grid">
            {group.presets.map((preset) => (
              <button key={preset.id} type="button"
                className={`layout-preset-option${preset.photo || preset.textCard ? ' layout-preset-option--miniature' : ''}`}
                aria-pressed={value === preset.id} onClick={() => onChange(preset.id)}>
                <LayoutMiniature preset={preset} />
                <span className="layout-card-copy">
                  <span className="layout-preset-option-heading">
                    <strong>{preset.label}</strong>
                    <small>{FONT_BY_ID.get(preset.titleStyle.fontId)?.label}</small>
                  </span>
                  <span>{preset.rule}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  )
}
