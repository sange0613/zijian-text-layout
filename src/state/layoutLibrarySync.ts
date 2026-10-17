import type { SavedLayoutRecord } from '../types'
import { parseSavedLayoutRecords } from './savedLayoutRecords'

export const LAYOUT_LIBRARY_KEY = 'zijian-layout-library-sync-v1'
type Entry = { id: string; record?: SavedLayoutRecord; deleted?: boolean; updatedAt: number; updatedBy: string }
export type LayoutLibrary = { version: 1; entries: Entry[] }

export function readLayoutLibrary(raw: string | null): LayoutLibrary {
  try {
    const value = JSON.parse(raw ?? 'null')
    return { version: 1, entries: Array.isArray(value?.entries) ? value.entries.filter((entry: Entry) =>
      entry && typeof entry.id === 'string' && Number.isFinite(entry.updatedAt) && typeof entry.updatedBy === 'string' &&
      (entry.deleted === true || (entry.record && entry.record.id === entry.id)),
    ) : [] }
  } catch { return { version: 1, entries: [] } }
}

export function libraryRecords(library: LayoutLibrary) {
  return parseSavedLayoutRecords(JSON.stringify(library.entries.filter(entry => !entry.deleted && entry.record).map(entry => entry.record)), Infinity)
}

export function reconcileLayoutLibrary(previous: LayoutLibrary, records: SavedLayoutRecord[], device: string): LayoutLibrary {
  const current = new Map(records.map(record => [record.id, record]))
  const entries = previous.entries.map(entry => {
    const record = current.get(entry.id)
    current.delete(entry.id)
    if (record && !entry.deleted && JSON.stringify(entry.record) === JSON.stringify(record)) return entry
    if (!record && entry.deleted) return entry
    const stamp = { updatedAt: Math.max(Date.now(), entry.updatedAt + 1), updatedBy: device }
    return record ? { id: entry.id, record, ...stamp } : { id: entry.id, deleted: true, ...stamp }
  })
  return { version: 1, entries: [...entries, ...[...current.values()].map(record => ({
    id: record.id, record, updatedAt: Date.now(), updatedBy: device,
  }))] }
}
