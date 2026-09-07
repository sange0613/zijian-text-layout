import { TEXT_LAYOUT_PRESETS } from '../data/textLayoutPresets'
import { FONT_BY_ID } from '../data/presets'

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
            <span className="layout-preset-option-heading">
              <strong>{preset.label}</strong>
              <small>{FONT_BY_ID.get(preset.titleStyle.fontId)?.label}</small>
            </span>
            <span>{preset.rule}</span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}
