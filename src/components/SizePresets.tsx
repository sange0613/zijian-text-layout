import { useState, type FormEvent } from 'react'
import { SIZE_PRESETS } from '../data/presets'

type SizePresetsProps = {
  value: string
  customWidth: number
  customHeight: number
  onChange: (value: string) => void
  onCustomSizeChange: (width: number, height: number) => void
}

const MIN_CUSTOM_SIZE = 320
const MAX_CUSTOM_SIZE = 4096

function normalizeDimension(draft: string, fallback: number) {
  const parsed = Number(draft)
  const value = Number.isFinite(parsed) && draft.trim() !== '' ? parsed : fallback
  return Math.round(Math.min(MAX_CUSTOM_SIZE, Math.max(MIN_CUSTOM_SIZE, value)))
}

export function SizePresets({
  value,
  customWidth,
  customHeight,
  onChange,
  onCustomSizeChange,
}: SizePresetsProps) {
  const [widthDraft, setWidthDraft] = useState(String(customWidth))
  const [heightDraft, setHeightDraft] = useState(String(customHeight))

  const applyCustomSize = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const width = normalizeDimension(widthDraft, customWidth)
    const height = normalizeDimension(heightDraft, customHeight)
    setWidthDraft(String(width))
    setHeightDraft(String(height))
    onCustomSizeChange(width, height)
  }

  return (
    <fieldset className="settings-section">
      <legend>常用尺寸</legend>
      <div className="size-grid">
        {SIZE_PRESETS.map((size) => (
          <button
            type="button"
            className="size-option"
            aria-pressed={value === size.id}
            key={size.id}
            onClick={() => onChange(size.id)}
          >
            <strong>{size.label}</strong>
            <span>{size.detail}</span>
          </button>
        ))}
      </div>
      <form
        className="custom-size-form"
        aria-label="自定义画布大小"
        data-active={value === 'custom'}
        noValidate
        onSubmit={applyCustomSize}
      >
        <span className="custom-size-label">自定义</span>
        <input
          aria-label="自定义宽度"
          type="number"
          min={MIN_CUSTOM_SIZE}
          max={MAX_CUSTOM_SIZE}
          inputMode="numeric"
          value={widthDraft}
          onChange={(event) => setWidthDraft(event.target.value)}
        />
        <span className="custom-size-times" aria-hidden="true">×</span>
        <input
          aria-label="自定义高度"
          type="number"
          min={MIN_CUSTOM_SIZE}
          max={MAX_CUSTOM_SIZE}
          inputMode="numeric"
          value={heightDraft}
          onChange={(event) => setHeightDraft(event.target.value)}
        />
        <button type="submit" aria-label="应用自定义尺寸">应用</button>
      </form>
    </fieldset>
  )
}
