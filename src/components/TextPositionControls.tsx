import type { TextBlockPosition } from '../types'

type TextPositionControlsProps = {
  titlePosition: TextBlockPosition
  bodyPosition: TextBlockPosition
  onTitleChange: (value: TextBlockPosition) => void
  onBodyChange: (value: TextBlockPosition) => void
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

export function TextPositionControls({
  titlePosition,
  bodyPosition,
  onTitleChange,
  onBodyChange,
}: TextPositionControlsProps) {
  return (
    <fieldset className="settings-section text-position-controls">
      <legend>文字位置</legend>
      <div className="text-position-group">
        <span className="position-group-title">标题</span>
        <PositionSlider
          label="标题左右位置"
          value={titlePosition.x}
          onChange={(x) => onTitleChange({ ...titlePosition, x })}
        />
        <PositionSlider
          label="标题上下位置"
          value={titlePosition.y}
          onChange={(y) => onTitleChange({ ...titlePosition, y })}
        />
      </div>
      <div className="text-position-group">
        <span className="position-group-title">正文</span>
        <PositionSlider
          label="正文左右位置"
          value={bodyPosition.x}
          onChange={(x) => onBodyChange({ ...bodyPosition, x })}
        />
        <PositionSlider
          label="正文上下位置"
          value={bodyPosition.y}
          onChange={(y) => onBodyChange({ ...bodyPosition, y })}
        />
      </div>
    </fieldset>
  )
}
