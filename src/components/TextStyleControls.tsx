import { FONT_PRESETS } from '../data/presets'
import type { TextBlockPosition, TextStyle } from '../types'
import { ColorField } from './ColorField'
import { FontSizeSlider } from './FontSizeSlider'

type TextStyleControlsProps = {
  name: '标题' | '正文'
  value: TextStyle
  onChange: (value: TextStyle) => void
  position: TextBlockPosition
  onPositionChange: (value: TextBlockPosition) => void
}

function PositionSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="position-slider">
      <span>{label}</span>
      <input
        aria-label={label}
        type="range"
        min={0}
        max={100}
        value={value}
        style={{ '--range-progress': `${value}%` } as React.CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output>{value}%</output>
    </label>
  )
}

export function TextStyleControls({
  name,
  value,
  onChange,
  position,
  onPositionChange,
}: TextStyleControlsProps) {
  const update = (patch: Partial<TextStyle>) => onChange({ ...value, ...patch })

  return (
    <fieldset className="settings-section style-controls">
      <legend>{name}样式</legend>
      <div className="control-row control-row--font">
        <label className="field-control">
          <span>{name}字体</span>
          <select
            aria-label={`${name}字体`}
            value={value.fontId}
            onChange={(event) => update({ fontId: event.target.value })}
          >
            {FONT_PRESETS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label} · {font.usage}
              </option>
            ))}
          </select>
        </label>
        <label className="field-control">
          <span>{name}粗细</span>
          <select
            aria-label={`${name}粗细`}
            value={value.fontWeight}
            onChange={(event) => update({ fontWeight: Number(event.target.value) })}
          >
            <option value="400">常规</option>
            <option value="600">中粗</option>
            <option value="700">粗体</option>
            <option value="800">特粗</option>
          </select>
        </label>
      </div>
      <FontSizeSlider
        label={`${name}字号`}
        value={value.fontSize}
        min={name === '标题' ? 24 : 12}
        max={name === '标题' ? 160 : 80}
        onChange={(fontSize) => update({ fontSize })}
      />
      <ColorField label={`${name}颜色`} value={value.color} onChange={(color) => update({ color })} />
      <div className="text-position-group text-position-group--inline">
        <span className="position-group-title">位置</span>
        <PositionSlider
          label={`${name}左右位置`}
          value={position.x}
          onChange={(x) => onPositionChange({ ...position, x })}
        />
        <PositionSlider
          label={`${name}上下位置`}
          value={position.y}
          onChange={(y) => onPositionChange({ ...position, y })}
        />
      </div>
    </fieldset>
  )
}
