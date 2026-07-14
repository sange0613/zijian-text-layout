import { FONT_PRESETS } from '../data/presets'
import { createTextLayoutPatch } from '../data/textLayoutPresets'
import type { BackgroundImageValue, EditorState, SavedLayoutRecord } from '../types'
import { BackgroundImageField } from './BackgroundImageField'
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
      <aside className="editor-panel editor-panel--content" aria-label="文字编辑">
        <div className="panel-intro">
          <h2>文字编辑</h2>
          <p>填写画面中的文字内容</p>
        </div>
        <fieldset className="settings-section content-fields">
          <legend>标题与正文</legend>
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
              className="body-textarea"
              rows={5}
              value={state.body}
              onChange={(event) => onChange({ body: event.target.value })}
            />
          </label>
        </fieldset>
        <fieldset className="settings-section signature-section">
          <legend>署名</legend>
          <div className="signature-row">
            <label className="field-control signature-field">
              <span>署名文字</span>
              <input
                aria-label="署名文字"
                className="signature-input"
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
        <CustomTextBlockControls
          blocks={state.customTextBlocks}
          selectedId={selectedCustomTextId}
          onSelect={onSelectCustomText}
          onAdd={onAddCustomText}
          onUpdate={onUpdateCustomText}
          onRemove={onRemoveCustomText}
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

      <aside className="editor-panel editor-panel--style" aria-label="样式设置">
        <div className="panel-intro">
          <h2>样式设置</h2>
          <p>选择排版，再微调标题和正文</p>
        </div>
        <TextLayoutPresets
          value={state.textLayoutId}
          onChange={(textLayoutId) => onChange(createTextLayoutPatch(textLayoutId, state))}
        />
        <TextStyleControls
          name="标题"
          value={state.titleStyle}
          position={state.titlePosition}
          onChange={(titleStyle) => onChange({ titleStyle })}
          onPositionChange={(titlePosition) => onChange({ titlePosition })}
        />
        <TextStyleControls
          name="正文"
          value={state.bodyStyle}
          position={state.bodyPosition}
          onChange={(bodyStyle) => onChange({ bodyStyle })}
          onPositionChange={(bodyPosition) => onChange({ bodyPosition })}
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
    </>
  )
}
