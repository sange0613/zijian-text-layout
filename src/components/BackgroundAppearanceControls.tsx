import type { CSSProperties } from 'react'

type BackgroundAppearanceControlsProps = {
  opacity: number
  blur: number
  onOpacityChange: (value: number) => void
  onBlurChange: (value: number) => void
}

type AppearanceSliderProps = {
  label: string
  shortLabel: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (value: number) => void
}

function AppearanceSlider({
  label,
  shortLabel,
  value,
  min,
  max,
  unit,
  onChange,
}: AppearanceSliderProps) {
  const progress = ((value - min) / (max - min)) * 100

  return (
    <label className="background-appearance-slider">
      <span>{shortLabel}</span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        value={value}
        style={{ '--range-progress': `${progress}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output>
        {value}{unit}
      </output>
    </label>
  )
}

export function BackgroundAppearanceControls({
  opacity,
  blur,
  onOpacityChange,
  onBlurChange,
}: BackgroundAppearanceControlsProps) {
  return (
    <div className="background-appearance-controls" role="group" aria-label="背景图效果">
      <AppearanceSlider
        label="背景图透明度"
        shortLabel="透明"
        value={opacity}
        min={0}
        max={100}
        unit="%"
        onChange={onOpacityChange}
      />
      <AppearanceSlider
        label="背景图模糊度"
        shortLabel="模糊"
        value={blur}
        min={0}
        max={30}
        unit=" px"
        onChange={onBlurChange}
      />
    </div>
  )
}
