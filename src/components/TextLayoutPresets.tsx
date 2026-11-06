import { useState } from 'react'
import { TEXT_LAYOUT_PRESETS } from '../data/textLayoutPresets'
import { PHOTO_LAYOUT_PRESETS } from '../data/photoLayoutPresets'
import { FONT_BY_ID } from '../data/presets'

type TextLayoutPresetsProps = {
  value: string
  onChange: (value: string) => void
}

export function TextLayoutPresets({ value, onChange }: TextLayoutPresetsProps) {
  const [tab, setTab] = useState<'photo' | 'text'>('photo')
  const presets = tab === 'photo' ? PHOTO_LAYOUT_PRESETS : TEXT_LAYOUT_PRESETS
  return (
    <fieldset className="settings-section text-layout-presets">
      <legend>排版构图</legend>
      <div className="layout-type-tabs" role="group" aria-label="构图类型">
        <button type="button" aria-pressed={tab === 'photo'} onClick={() => setTab('photo')}>图片配文字 · 10 套</button>
        <button type="button" aria-pressed={tab === 'text'} onClick={() => setTab('text')}>纯文字排版</button>
      </div>
      <p className="layout-preset-hint">{tab === 'photo' ? '先选构图，再上传照片。标题建议 1–2 行，正文 3–4 行。' : '只排文字时，选择适合的留白和对齐方式。'}</p>
      <div className="layout-preset-grid">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`layout-preset-option${preset.photo ? ' layout-preset-option--photo' : ''}`}
            aria-pressed={value === preset.id}
            onClick={() => onChange(preset.id)}
          >
            {preset.photo ? (
              <span className="layout-miniature" aria-hidden="true" style={{ background: preset.photo.paper }}>
                <span className="layout-miniature-image" style={{ left: `${preset.photo.frame.x}%`, top: `${preset.photo.frame.y}%`, width: `${preset.photo.frame.width}%`, height: `${preset.photo.frame.height}%` }} />
                {preset.photo.overlays.map((overlay, index) => <span key={index} className="layout-miniature-overlay" style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, width: `${overlay.width}%`, height: `${overlay.height}%`, background: overlay.background }} />)}
                <span className="layout-miniature-title" style={{ left: `${preset.titlePosition.x}%`, top: `${preset.titlePosition.y}%`, width: `${preset.titleStyle.widthPercent}%`, color: preset.titleStyle.color, textAlign: preset.titleStyle.textAlign }}>标题文字</span>
                <span className="layout-miniature-body" style={{ left: `${preset.bodyPosition.x}%`, top: `${preset.bodyPosition.y}%`, width: `${preset.bodyStyle.widthPercent}%`, color: preset.bodyStyle.color, textAlign: preset.bodyStyle.textAlign }}>正文说明</span>
              </span>
            ) : null}
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
    </fieldset>
  )
}
