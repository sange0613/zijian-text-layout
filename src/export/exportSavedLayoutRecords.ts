import type { SavedLayoutRecord } from '../types'

type DownloadBlob = (blob: Blob, filename: string) => void

type ExportSavedLayoutRecordsDependencies = {
  download: DownloadBlob
  now: Date
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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function exportSavedLayoutRecords(
  records: SavedLayoutRecord[],
  dependencies?: Partial<ExportSavedLayoutRecordsDependencies>,
) {
  const now = dependencies?.now ?? new Date()
  const download = dependencies?.download ?? downloadBlob
  const blob = new Blob(
    [
      JSON.stringify(
        {
          app: 'zijian-text-layout',
          version: 1,
          exportedAt: now.toISOString(),
          records,
        },
        null,
        2,
      ),
    ],
    { type: 'application/json;charset=utf-8' },
  )

  download(blob, `字间-保存记录-${timestamp(now)}.json`)
}
