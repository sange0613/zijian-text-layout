import { expect, it, vi } from 'vitest'
import { DEFAULT_EDITOR_STATE } from '../state/editorState'
import type { SavedLayoutRecord } from '../types'
import { exportSavedLayoutRecords } from './exportSavedLayoutRecords'

function readBlob(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)))
    reader.addEventListener('error', () => reject(reader.error))
    reader.readAsText(blob)
  })
}

it('exports saved layout records as readable JSON', async () => {
  const record: SavedLayoutRecord = {
    id: 'record-1',
    name: '小红书封面模板',
    savedAt: 1784025600000,
    state: DEFAULT_EDITOR_STATE,
  }
  const download = vi.fn()

  exportSavedLayoutRecords([record], {
    download,
    now: new Date(2026, 6, 14, 18, 40, 0),
  })

  expect(download).toHaveBeenCalledWith(expect.any(Blob), '字间-保存记录-20260714-184000.json')

  const blob = download.mock.calls[0][0] as Blob
  expect(blob.type).toBe('application/json;charset=utf-8')
  const exported = JSON.parse(await readBlob(blob)) as { records: SavedLayoutRecord[] }
  expect(exported.records[0].name).toBe('小红书封面模板')
  expect(exported.records[0].state.title).toBe(DEFAULT_EDITOR_STATE.title)
})
