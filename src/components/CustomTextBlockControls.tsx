import { FONT_PRESETS } from '../data/presets'
import { MAX_CUSTOM_TEXT_BLOCKS } from '../state/customTextBlocks'
import type { CustomTextBlock } from '../types'
import { ColorField } from './ColorField'
import { FontSizeSlider } from './FontSizeSlider'

type CustomTextBlockControlsProps = {
  blocks: CustomTextBlock[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<Omit<CustomTextBlock, 'id'>>) => void
  onRemove: (id: string) => void
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

export function CustomTextBlockControls({
  blocks,
  selectedId,
  onSelect,
  onAdd,
  onUpdate,
  onRemove,
}: CustomTextBlockControlsProps) {
  const selected = blocks.find((block) => block.id === selectedId) ?? blocks[0] ?? null

  return (
    <fieldset className="settings-section custom-text-controls">
      <legend>自定义文字</legend>
      <div className="custom-text-toolbar">
        <span>{blocks.length ? `已添加 ${blocks.length} 个` : '可添加多个文字块'}</span>
        <button
          type="button"
          className="custom-text-add-button"
          disabled={blocks.length >= MAX_CUSTOM_TEXT_BLOCKS}
          onClick={onAdd}
        >
          添加文字
        </button>
      </div>
      {blocks.length ? (
        <div className="custom-text-list" role="list" aria-label="自定义文字列表">
          {blocks.map((block, index) => (
            <button
              key={block.id}
              type="button"
              role="listitem"
              className={`custom-text-chip${block.id === selected?.id ? ' custom-text-chip--active' : ''}`}
              aria-pressed={block.id === selected?.id}
              onClick={() => onSelect(block.id)}
            >
              {block.text.trim() || `自定义文字 ${index + 1}`}
            </button>
          ))}
        </div>
      ) : null}
      {selected ? (
        <div className="custom-text-editor">
          <label className="field-control custom-text-content-field">
            <span>文字内容</span>
            <textarea
              aria-label="自定义文字内容"
              rows={3}
              value={selected.text}
              onChange={(event) => onUpdate(selected.id, { text: event.target.value })}
            />
          </label>
          <div className="control-row control-row--font">
            <label className="field-control">
              <span>字体</span>
              <select
                aria-label="自定义文字字体"
                value={selected.fontId}
                onChange={(event) => onUpdate(selected.id, { fontId: event.target.value })}
              >
                {FONT_PRESETS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.label} · {font.usage}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-control">
              <span>粗细</span>
              <select
                aria-label="自定义文字粗细"
                value={selected.fontWeight}
                onChange={(event) =>
                  onUpdate(selected.id, { fontWeight: Number(event.target.value) })
                }
              >
                <option value="400">常规</option>
                <option value="600">中粗</option>
                <option value="700">粗体</option>
                <option value="800">特粗</option>
              </select>
            </label>
          </div>
          <FontSizeSlider
            label="自定义文字字号"
            value={selected.fontSize}
            min={12}
            max={120}
            onChange={(fontSize) => onUpdate(selected.id, { fontSize })}
          />
          <ColorField
            label="自定义文字颜色"
            value={selected.color}
            onChange={(color) => onUpdate(selected.id, { color })}
          />
          <div className="custom-text-position-grid">
            <PositionSlider
              label="自定义文字左右位置"
              value={selected.position.x}
              onChange={(x) =>
                onUpdate(selected.id, { position: { ...selected.position, x } })
              }
            />
            <PositionSlider
              label="自定义文字上下位置"
              value={selected.position.y}
              onChange={(y) =>
                onUpdate(selected.id, { position: { ...selected.position, y } })
              }
            />
          </div>
          <button
            type="button"
            className="custom-text-remove-button"
            onClick={() => onRemove(selected.id)}
          >
            删除当前文字
          </button>
        </div>
      ) : (
        <p className="custom-text-empty">还没有自定义文字</p>
      )}
    </fieldset>
  )
}
