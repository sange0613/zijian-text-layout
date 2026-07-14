import { FONT_PRESETS } from '../data/presets'
import { createTextLayoutPatch } from '../data/textLayoutPresets'
import type { BackgroundImageValue, EditorState } from '../types'
import { BackgroundImageField } from './BackgroundImageField'
import { BackgroundPositionControls } from './BackgroundPositionControls'
import { ColorField } from './ColorField'
import { FontSizeSlider } from './FontSizeSlider'
import { SignaturePositionPicker } from './SignaturePositionPicker'
import { SizePresets } from './SizePresets'
import { TextStyleControls } from './TextStyleControls'
import { TextLayoutPresets } from './TextLayoutPresets'
import { TextPositionControls } from './TextPositionControls'

type EditorPanelProps = {
  state: EditorState
  backgroundImage: BackgroundImageValue | null
  onChange: (patch: Partial<EditorState>) => void
  onBackgroundImageChange: (value: BackgroundImageValue | null) => void
}

export function EditorPanel({
  state,
  backgroundImage,
  onChange,
  onBackgroundImageChange,
}: EditorPanelProps) {
  return (
    <aside className="editor-panel" aria-label="排版设置">
      <fieldset className="settings-section content-fields">
        <legend>文字内容</legend>
        <label className="field-control">
          <span>标题</span>
          <textarea
            aria-label="标题内容"
            rows={2}
            value={state.title}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </label>
        <label className="field-control">
          <span>正文</span>
          <textarea
            aria-label="正文内容"
            rows={2}
            value={state.body}
            onChange={(event) => onChange({ body: event.target.value })}
          />
        </label>
        <div className="signature-row">
          <label className="field-control signature-field">
            <span>署名</span>
            <input
              aria-label="署名文字"
              type="text"
              placeholder="例如：摄影 / 林野"
              value={state.signature}
              onChange={(event) => onChange({ signature: event.target.value })}
            />
          </label>
          <label className="field-control signature-font-field">
            <span>字体</span>
            <select
              aria-label="署名字体"
              value={state.signatureFontId}
              onChange={(event) => onChange({ signatureFontId: event.target.value })}
            >
              {FONT_PRESETS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>
          <SignaturePositionPicker
            value={state.signaturePosition}
            onChange={(signaturePosition) => onChange({ signaturePosition })}
          />
        </div>
        <div className="signature-size-control">
          <FontSizeSlider
            label="署名字号"
            value={state.signatureFontSize}
            min={12}
            max={64}
            onChange={(signatureFontSize) => onChange({ signatureFontSize })}
          />
        </div>
      </fieldset>

      <TextLayoutPresets
        value={state.textLayoutId}
        onChange={(textLayoutId) => onChange(createTextLayoutPatch(textLayoutId, state))}
      />
      <TextPositionControls
        titlePosition={state.titlePosition}
        bodyPosition={state.bodyPosition}
        onTitleChange={(titlePosition) => onChange({ titlePosition })}
        onBodyChange={(bodyPosition) => onChange({ bodyPosition })}
      />
      <TextStyleControls
        name="标题"
        value={state.titleStyle}
        onChange={(titleStyle) => onChange({ titleStyle })}
      />
      <TextStyleControls
        name="正文"
        value={state.bodyStyle}
        onChange={(bodyStyle) => onChange({ bodyStyle })}
      />
      <SizePresets
        value={state.sizeId}
        customWidth={state.customWidth}
        customHeight={state.customHeight}
        onChange={(sizeId) => onChange({ sizeId })}
        onCustomSizeChange={(customWidth, customHeight) =>
          onChange({ sizeId: 'custom', customWidth, customHeight })
        }
      />
      <section className="settings-section background-section" aria-label="画布背景">
        <div className="settings-heading">
          <span>画布背景</span>
          <BackgroundImageField
            value={backgroundImage}
            onChange={onBackgroundImageChange}
          />
        </div>
        {backgroundImage ? (
          <BackgroundPositionControls
            positionX={backgroundImage.positionX}
            positionY={backgroundImage.positionY}
            onChange={(positionX, positionY) =>
              onBackgroundImageChange({
                ...backgroundImage,
                positionX,
                positionY,
              })
            }
          />
        ) : null}
        <ColorField
          label="背景颜色"
          value={state.backgroundColor}
          onChange={(backgroundColor) => onChange({ backgroundColor })}
        />
      </section>
    </aside>
  )
}
