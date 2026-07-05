import { useRef } from 'react'
import { EditorPanel } from './components/EditorPanel'
import { ExportButton } from './components/ExportButton'
import { PreviewCanvas } from './components/PreviewCanvas'
import { getCanvasSize } from './canvas/getCanvasSize'
import { exportPng } from './export/exportPng'
import { usePersistedEditorState } from './hooks/usePersistedEditorState'
import { useSessionBackgroundImage } from './hooks/useSessionBackgroundImage'

export default function App() {
  const { state, update } = usePersistedEditorState()
  const { backgroundImage, setBackgroundImage } = useSessionBackgroundImage()
  const previewRef = useRef<HTMLDivElement>(null)
  const isEmpty = !state.title.trim() && !state.body.trim() && !state.signature.trim()
  const size = getCanvasSize(state)

  const handleExport = async () => {
    if (!previewRef.current) throw new Error('Preview canvas is unavailable')
    await exportPng(previewRef.current, {
      width: size.width,
      height: size.height,
      name: size.label.replace(/\s+/g, '-'),
    })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1 aria-label="字间">字间 <span>· 排版工具</span></h1>
        <ExportButton isEmpty={isEmpty} onExport={handleExport} />
      </header>
      <main className="workspace">
        <EditorPanel
          state={state}
          backgroundImage={backgroundImage}
          onChange={update}
          onBackgroundImageChange={setBackgroundImage}
        />
        <PreviewCanvas ref={previewRef} state={state} backgroundImage={backgroundImage} />
      </main>
    </div>
  )
}
