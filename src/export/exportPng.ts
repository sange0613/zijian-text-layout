import { toPng } from 'html-to-image'

type ExportOptions = {
  width: number
  height: number
  name: string
}

type RenderOptions = Parameters<typeof toPng>[1]
type ExportDependencies = {
  render: (node: HTMLElement, options: RenderOptions) => Promise<string>
  download: (dataUrl: string, filename: string) => void
  fontsReady: Promise<unknown>
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
}

function timestamp(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}-${hours}${minutes}${seconds}`
}

export async function exportPng(
  node: HTMLElement,
  options: ExportOptions,
  dependencies?: Partial<ExportDependencies>,
) {
  const download = dependencies?.download ?? downloadDataUrl
  const dataUrl = await renderPng(node, options, dependencies)
  download(dataUrl, `字间-${options.name}-${timestamp()}.png`)
}

export async function renderPng(
  node: HTMLElement,
  options: Pick<ExportOptions, 'width' | 'height'> & { fontEmbedCSS?: string },
  dependencies?: Partial<ExportDependencies>,
) {
  const render = dependencies?.render ?? toPng
  const fontsReady = dependencies?.fontsReady ?? document.fonts?.ready ?? Promise.resolve()

  await fontsReady
  return render(node, {
    width: options.width,
    height: options.height,
    canvasWidth: options.width,
    canvasHeight: options.height,
    pixelRatio: 1,
    cacheBust: false,
    skipAutoScale: true,
    fontEmbedCSS: options.fontEmbedCSS,
    style: {
      width: `${options.width}px`,
      height: `${options.height}px`,
      transform: 'none',
      transformOrigin: 'top left',
    },
  })
}
