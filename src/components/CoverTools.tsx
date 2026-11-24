import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { getFontEmbedCSS } from 'html-to-image'
import { prepareBackgroundImage } from '../background/prepareBackgroundImage'
import { renderPng } from '../export/exportPng'
import { getCanvasSize } from '../canvas/getCanvasSize'
import type { BackgroundImageValue, EditorState } from '../types'
import { PreviewCanvas } from './PreviewCanvas'

type CoverToolsProps = {
  mode: 'feed' | 'batch'
  state: EditorState
  backgroundImage: BackgroundImageValue | null
  onClose: () => void
}

const MAX_BATCH_SIZE = 12

export function CoverTools({ mode, state, backgroundImage, onClose }: CoverToolsProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const ownedImages = useRef<BackgroundImageValue[]>([])
  const [images, setImages] = useState<BackgroundImageValue[]>([])
  const [index, setIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    dialog.current?.showModal()
    return () => ownedImages.current.forEach((image) => URL.revokeObjectURL(image.url))
  }, [])

  async function selectImages(files: File[]) {
    if (!files.length) return
    if (files.length > MAX_BATCH_SIZE) {
      setError(`每批最多选择 ${MAX_BATCH_SIZE} 张照片`)
      return
    }
    setBusy(true)
    setError('')
    setStatus('正在读取照片…')
    const next: BackgroundImageValue[] = []
    const failed: string[] = []
    for (const file of files) {
      try {
        const image = await prepareBackgroundImage(file)
        next.push(backgroundImage ? { ...backgroundImage, url: image.url, name: image.name } : image)
      } catch {
        failed.push(file.name)
      }
    }
    if (next.length) {
      ownedImages.current.forEach((image) => URL.revokeObjectURL(image.url))
      ownedImages.current = next
      setImages(next)
      setIndex(0)
    }
    setError(failed.length ? `无法读取：${failed.join('、')}` : '')
    setStatus('')
    setBusy(false)
  }

  async function exportBatch() {
    if (!canvas.current || !images.length) return
    setBusy(true)
    setError('')
    const requestedIndex = index
    const files: Record<string, Uint8Array> = {}
    try {
      setStatus('正在准备字体…')
      const { zipSync } = await import('fflate')
      await document.fonts?.ready
      const fontEmbedCSS = await getFontEmbedCSS(canvas.current)
      const size = getCanvasSize(state)
      for (const [number, image] of images.entries()) {
        setStatus(`正在生成 ${number + 1} / ${images.length}`)
        flushSync(() => setIndex(number))
        const node = canvas.current
        if (!node) throw new Error('预览已关闭')
        await node.querySelector('img')?.decode()
        const png = await renderPng(node, { ...size, fontEmbedCSS })
        const name = image.name.replace(/\.[^.]+$/, '').replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0, 100)
        files[`${number + 1}-${name || '封面'}.png`] = new Uint8Array(await (await fetch(png)).arrayBuffer())
      }
      const archive = zipSync(files, { level: 0 })
      const url = URL.createObjectURL(new Blob([new Uint8Array(archive)], { type: 'application/zip' }))
      const link = document.createElement('a')
      link.href = url
      link.download = '字间-批量封面.zip'
      document.body.append(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 30_000)
      setStatus(`已生成 ${images.length} 张封面`)
    } catch {
      setStatus('')
      setError(`生成第 ${Object.keys(files).length + 1} 张封面时失败，请重试`)
    } finally {
      setIndex(requestedIndex)
      setBusy(false)
    }
  }

  const title = mode === 'feed' ? '小红书缩略预览' : '批量出图'
  return (
    <dialog ref={dialog} className="cover-tools-dialog" aria-labelledby="cover-tools-title"
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }}>
      <header className="cover-tools-heading">
        <h2 id="cover-tools-title">{title}</h2>
        <button type="button" disabled={busy} onClick={onClose}>关闭</button>
      </header>
      {mode === 'feed' ? (
        <>
          <p>模拟手机双列浏览，看看小图里的文字是否清楚。</p>
          <div className="cover-feed-preview">
            <PreviewCanvas compact state={state} backgroundImage={backgroundImage} />
            <div className="cover-feed-neighbor" aria-hidden="true" />
          </div>
        </>
      ) : (
        <>
          <p>用当前排版替换照片，逐张预览，一次下载全部 PNG。</p>
          <label className="batch-picker">选择照片（最多 {MAX_BATCH_SIZE} 张）
            <input type="file" accept="image/*" multiple disabled={busy} onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? [])
              event.currentTarget.value = ''
              void selectImages(files)
            }} />
          </label>
          {images[index] ? (
            <>
              <PreviewCanvas compact ref={canvas} state={state} backgroundImage={images[index]} />
              <div className="batch-navigation">
                <button type="button" disabled={busy || index === 0} onClick={() => setIndex(index - 1)}>上一张</button>
                <span>{index + 1} / {images.length} · {images[index].name}</span>
                <button type="button" disabled={busy || index === images.length - 1} onClick={() => setIndex(index + 1)}>下一张</button>
              </div>
              <button type="button" className="export-button" disabled={busy} onClick={() => void exportBatch()}>批量下载 ZIP</button>
            </>
          ) : null}
          {status ? <p role="status">{status}</p> : null}
          {error ? <p role="alert">{error}</p> : null}
        </>
      )}
    </dialog>
  )
}
