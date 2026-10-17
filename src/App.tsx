import { useEffect, useRef, useState } from 'react'
import { EditorPanel } from './components/EditorPanel'
import { ExportButton } from './components/ExportButton'
import { PreviewCanvas } from './components/PreviewCanvas'
import { getCanvasSize } from './canvas/getCanvasSize'
import { exportPng } from './export/exportPng'
import { exportSavedLayoutRecords } from './export/exportSavedLayoutRecords'
import { usePersistedEditorState } from './hooks/usePersistedEditorState'
import { useSessionBackgroundImage } from './hooks/useSessionBackgroundImage'
import { useSavedLayoutRecords } from './hooks/useSavedLayoutRecords'
import {
  createCustomTextBlock,
  MAX_CUSTOM_TEXT_BLOCKS,
  updateCustomTextBlock,
} from './state/customTextBlocks'
import type { CustomTextBlock } from './types'

export default function App() {
  const { state, update, undo, redo, canUndo, canRedo } = usePersistedEditorState()
  const { backgroundImage, setBackgroundImage } = useSessionBackgroundImage()
  const { records, save, rename, remove, toggleFavorite, importRecords } = useSavedLayoutRecords()
  const [recordName, setRecordName] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const [selectedCustomTextId, setSelectedCustomTextId] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const hasCustomText = state.customTextBlocks.some((block) => block.text.trim())
  const isEmpty =
    !state.title.trim() && !state.body.trim() && !state.signature.trim() && !hasCustomText
  const size = getCanvasSize(state)

  useEffect(() => {
    const handleHistoryShortcut = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey) return
      const key = event.key.toLowerCase()
      if (key !== 'z' && key !== 'y') return
      event.preventDefault()
      if (key === 'y' || event.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', handleHistoryShortcut)
    return () => window.removeEventListener('keydown', handleHistoryShortcut)
  }, [redo, undo])

  const handleExport = async () => {
    if (!previewRef.current) throw new Error('Preview canvas is unavailable')
    await exportPng(previewRef.current, {
      width: size.width,
      height: size.height,
      name: size.label.replace(/\s+/g, '-'),
    })
  }

  const handleSaveRecord = () => {
    save(state, recordName)
    setRecordName('')
    setJustSaved(true)
  }

  const handleAddCustomText = () => {
    if (state.customTextBlocks.length >= MAX_CUSTOM_TEXT_BLOCKS) return
    const block = createCustomTextBlock(state.customTextBlocks.length + 1)
    update({ customTextBlocks: [...state.customTextBlocks, block] })
    setSelectedCustomTextId(block.id)
  }

  const handleUpdateCustomText = (
    id: string,
    patch: Partial<Omit<CustomTextBlock, 'id'>>,
  ) => {
    update({ customTextBlocks: updateCustomTextBlock(state.customTextBlocks, id, patch) })
  }

  const handleRemoveCustomText = (id: string) => {
    const next = state.customTextBlocks.filter((block) => block.id !== id)
    update({ customTextBlocks: next })
    if (selectedCustomTextId === id) setSelectedCustomTextId(next[0]?.id ?? null)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1 aria-label="字间">字间 <span>· 排版工具</span></h1>
        <div className="topbar-actions">
          <div className="history-controls" role="group" aria-label="编辑历史">
            <button
              type="button"
              className="history-button"
              aria-label="撤销"
              title="撤销（⌘/Ctrl + Z）"
              disabled={!canUndo}
              onClick={undo}
            >
              <span aria-hidden="true">↶</span>
              撤销
            </button>
            <button
              type="button"
              className="history-button"
              aria-label="重做"
              title="重做（⌘/Ctrl + Shift + Z）"
              disabled={!canRedo}
              onClick={redo}
            >
              <span aria-hidden="true">↷</span>
              重做
            </button>
          </div>
          <ExportButton isEmpty={isEmpty} onExport={handleExport} />
        </div>
      </header>
      <main className="workspace">
        <EditorPanel
          state={state}
          backgroundImage={backgroundImage}
          savedRecords={records}
          recordName={recordName}
          justSaved={justSaved}
          onChange={update}
          selectedCustomTextId={selectedCustomTextId}
          onBackgroundImageChange={setBackgroundImage}
          onSelectCustomText={setSelectedCustomTextId}
          onAddCustomText={handleAddCustomText}
          onUpdateCustomText={handleUpdateCustomText}
          onRemoveCustomText={handleRemoveCustomText}
          onRecordNameChange={setRecordName}
          onSaveRecord={handleSaveRecord}
          onExportRecords={() => exportSavedLayoutRecords(records)}
          onImportRecords={importRecords}
          onRenameRecord={rename}
          onToggleFavoriteRecord={toggleFavorite}
          onApplyRecord={(savedState) => {
            update(savedState)
            setSelectedCustomTextId(savedState.customTextBlocks[0]?.id ?? null)
            setJustSaved(false)
          }}
          onRemoveRecord={remove}
        />
        <PreviewCanvas ref={previewRef} state={state} backgroundImage={backgroundImage} />
      </main>
    </div>
  )
}
