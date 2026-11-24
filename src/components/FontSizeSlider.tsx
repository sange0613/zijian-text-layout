import { useState, type CSSProperties } from 'react'

type FontSizeSliderProps = {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}
export function FontSizeSlider({ label, value, min, max, onChange }: FontSizeSliderProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const [dragMax, setDragMax] = useState<number | null>(null)
  const normalMax = Math.min(200, max)
  const sliderMax = dragMax ?? (value > normalMax ? max : normalMax)
  const progress = ((value - min) / (sliderMax - min)) * 100

  return (
    <div className="font-size-slider">
      <span>{label}</span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={sliderMax}
        step={1}
        value={value}
        style={{ '--range-progress': `${progress}%` } as CSSProperties}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          setDragMax(sliderMax)
        }}
        onLostPointerCapture={() => setDragMax(null)}
        onPointerUp={() => setDragMax(null)}
        onPointerCancel={() => setDragMax(null)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="font-size-entry">
        <input type="number" inputMode="numeric" aria-label={`${label}精确值`} min={min} max={max} step={1}
          value={draft ?? value}
          onChange={(event) => {
            const raw = event.target.value
            setDraft(raw)
            const number = Number(raw)
            if (raw && Number.isInteger(number) && number >= min && number <= max) onChange(number)
          }}
          onBlur={() => {
            if (draft && Number.isFinite(Number(draft))) onChange(Math.max(min, Math.min(max, Math.round(Number(draft)))))
            setDraft(null)
          }}
          onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
        />
        <span aria-hidden="true">px</span>
      </div>
    </div>
  )
}
