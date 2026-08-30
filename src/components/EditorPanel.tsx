import { FONT_PRESETS } from '../data/presets'
import { createTextLayoutPatch } from '../data/textLayoutPresets'
import type { BackgroundImageValue, EditorState, SavedLayoutRecord } from '../types'
import { BackgroundImageField } from './BackgroundImageField'
import { BackgroundAppearanceControls } from './BackgroundAppearanceControls'
import { BackgroundPositionControls } from './BackgroundPositionControls'
import { ColorField } from './ColorField'
import { CustomTextBlockControls } from './CustomTextBlockControls'
import { FontSizeSlider } from './FontSizeSlider'
import { SignaturePositionPicker } from './SignaturePositionPicker'
import { SizePresets } from './SizePresets'
import { TextStyleControls } from './TextStyleControls'
import { TextLayoutPresets } from './TextLayoutPresets'
import { SavedLayoutRecords } from './SavedLayoutRecords'

type EditorPanelProps = {
  state: EditorState
  backgroundImage: BackgroundImageValue | null
  savedRecords: SavedLayoutRecord[]
  recordName: string
  justSaved: boolean
  onChange: (patch: Partial<EditorState>) => void
  selectedCustomTextId: string | null
  onBackgroundImageChange: (value: BackgroundImageValue | null) => void
  onSelectCustomText: (id: string) => void
  onAddCustomText: () => void
  onUpdateCustomText: (
    id: string,
    patch: Partial<Omit<EditorState['customTextBlocks'][number], 'id'>>,
  ) => void
  onRemoveCustomText: (id: string) => void
  onRecordNameChange: (name: string) => void
  onSaveRecord: () => void
  onExportRecords: () => void
  onRenameRecord: (id: string, name: string) => void
  onApplyRecord: (state: EditorState) => void
  onRemoveRecord: (id: string) => void
}

export function EditorPanel({
  state,
  backgroundImage,
  savedRecords,
  recordName,
  justSaved,
  onChange,
  selectedCustomTextId,
  onBackgroundImageChange,
  onSelectCustomText,
  onAddCustomText,
  onUpdateCustomText,
  onRemoveCustomText,
  onRecordNameChange,
  onSaveRecord,
  onExportRecords,
  onRenameRecord,
  onApplyRecord,
  onRemoveRecord,
}: EditorPanelProps) {
  return (
    <>
      <aside className="editor-panel editor-panel--content" aria-label="文字与样式">
        <div className="panel-intro">
          <h2>文字与样式</h2>
          <p>输入文字后，直接调整对应样式</p>
        </div>
        <section
          className="settings-section text-edit-section text-edit-section--title"
          aria-labelledby="title-editor-heading"
        >
          <div className="edit-section-heading">
            <h3 id="title-editor-heading">标题</h3>
            <span>主视觉文字</span>
          </div>
          <label className="field-control">
            <span className="visually-hidden">标题内容</span>
            <textarea
              aria-label="标题内容"
              rows={2}
              value={state.title}
              onChange={(event) => onChange({ title: event.target.value })}
            />
          </label>
          <TextStyleControls
            name="标题"
            value={state.titleStyle}
            position={state.titlePosition}
            embedded
            onChange={(titleStyle) => onChange({ titleStyle })}
            onPositionChange={(titlePosition) => onChange({ titlePosition })}
          />
        </section>
        <section
          className="settings-section text-edit-section text-edit-section--body"
          aria-labelledby="body-editor-heading"
        >
          <div className="edit-section-heading">
            <h3 id="body-editor-heading">正文</h3>
            <span>内容与说明</span>
          </div>
          <label className="field-control">
            <span className="visually-hidden">正文内容</span>
            <textarea
              aria-label="正文内容"
              className="body-textarea"
              rows={5}
              value={state.body}
              onChange={(event) => onChange({ body: event.target.value })}
            />
          </label>
          <TextStyleControls
            name="正文"
            value={state.bodyStyle}
            position={state.bodyPosition}
            embedded
            onChange={(bodyStyle) => onChange({ bodyStyle })}
            onPositionChange={(bodyPosition) => onChange({ bodyPosition })}
          />
        </section>
        <fieldset className="settings-section signature-section">
          <legend>署名</legend>
          <div className="signature-row">
            <label className="field-control signature-field">
              <span>署名文字</span>
              <textarea
                aria-label="署名文字"
                className="signature-input"
                rows={2}
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
        <CustomTextBlockControls
          blocks={state.customTextBlocks}
          selectedId={selectedCustomTextId}
          onSelect={onSelectCustomText}
          onAdd={onAddCustomText}
          onUpdate={onUpdateCustomText}
          onRemove={onRemoveCustomText}
        />
      </aside>

      <aside className="editor-panel editor-panel--style" aria-label="排版与画布">
        <div className="panel-intro">
          <h2>排版与画布</h2>
          <p>调整整张图片的布局、尺寸和背景</p>
        </div>
        <section className="settings-section background-section" aria-label="画布背景">
          <div className="settings-heading">
            <span>画布背景</span>
          </div>
          <BackgroundImageField
            value={backgroundImage}
            onChange={onBackgroundImageChange}
          />
          {backgroundImage ? (
            <>
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
              <BackgroundAppearanceControls
                opacity={backgroundImage.opacity}
                blur={backgroundImage.blur}
                onOpacityChange={(opacity) =>
                  onBackgroundImageChange({ ...backgroundImage, opacity })
                }
                onBlurChange={(blur) =>
                  onBackgroundImageChange({ ...backgroundImage, blur })
                }
              />
            </>
          ) : null}
          <ColorField
            label="背景颜色"
            value={state.backgroundColor}
            onChange={(backgroundColor) => onChange({ backgroundColor })}
          />
        </section>
        <TextLayoutPresets
          value={state.textLayoutId}
          onChange={(textLayoutId) => onChange(createTextLayoutPatch(textLayoutId, state))}
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
        <SavedLayoutRecords
          records={savedRecords}
          recordName={recordName}
          justSaved={justSaved}
          onRecordNameChange={onRecordNameChange}
          onSave={onSaveRecord}
          onExport={onExportRecords}
          onRename={onRenameRecord}
          onApply={onApplyRecord}
          onRemove={onRemoveRecord}
        />
      </aside>
    </>
  )
}