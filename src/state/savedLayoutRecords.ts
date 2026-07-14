import { parseStoredState } from './editorState'
import type { EditorState, SavedLayoutRecord } from '../types'

export const SAVED_LAYOUT_RECORDS_KEY = 'zijian-saved-layout-records-v1'
export const MAX_SAVED_LAYOUT_RECORDS = 20

function isRecordShape(value: unknown): value is SavedLayoutRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.savedAt === 'number' &&
    Number.isFinite(record.savedAt) &&
    Boolean(record.state) &&
    typeof record.state === 'object'
  )
}

export function parseSavedLayoutRecords(raw: string | null): SavedLayoutRecord[] {
  if (!raw) return []
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value
      .filter(isRecordShape)
      .map((record) => ({
        ...record,
        state: parseStoredState(JSON.stringify(record.state)),
      }))
      .slice(0, MAX_SAVED_LAYOUT_RECORDS)
  } catch {
    return []
  }
}

function getRecordName(state: EditorState) {
  const titleLine = state.title.split('\n').find((line) => line.trim())?.trim()
  const bodyLine = state.body.split('\n').find((line) => line.trim())?.trim()
  return (titleLine || bodyLine || state.signature.trim() || '未命名记录').slice(0, 24)
}

export function createSavedLayoutRecord(state: EditorState): SavedLayoutRecord {
  const savedAt = Date.now()
  return {
    id: `${savedAt}-${Math.random().toString(36).slice(2, 8)}`,
    name: getRecordName(state),
    savedAt,
    state: JSON.parse(JSON.stringify(state)) as EditorState,
  }
}
