import { TEXT_LAYOUT_PRESETS } from '../data/textLayoutPresets'

type TextLayoutPresetsProps = {
  value: string
  onChange: (value: string) => void
}

export function TextLayoutPresets({ value, onChange }: TextLayoutPresetsProps) {
  return (
    <fieldset className="settings-section text-layout-presets">
      <legend>小红书排版</legend>
      <div className="layout-preset-grid">
        {TEXT_LAYOUT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="layout-preset-option"
            aria-pressed={value === preset.id}
            onClick={() => onChange(preset.id)}
          >
            <strong>{preset.label}</strong>
            <span>{preset.rule}</span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}
