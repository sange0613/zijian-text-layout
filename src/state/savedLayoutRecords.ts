import { DEFAULT_EDITOR_STATE, parseStoredState } from './editorState'
import type { EditorState, SavedLayoutRecord } from '../types'

export const SAVED_LAYOUT_RECORDS_KEY = 'zijian-saved-layout-records-v1'
export const MAX_SAVED_LAYOUT_RECORDS = 20
export const DEFAULT_SAVED_LAYOUT_RECORD_NAME = '未命名记录'

export function importSavedLayoutRecords(raw: string, current: SavedLayoutRecord[]) {
  let value: unknown
  try {
    value = JSON.parse(raw.replace(/^\uFEFF/, ''))
  } catch {
    throw new Error('文件格式不正确，请选择字间导出的 JSON 记录文件')
  }
  const source = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && 'app' in value &&
        value.app === 'zijian-text-layout' && 'version' in value && value.version === 1 &&
        'records' in value && Array.isArray(value.records)
      ? value.records
      : null
  if (!source) throw new Error('无法识别记录文件，请选择字间导出的 JSON 文件')
  if (!source.length) throw new Error('文件中没有可导入的记录')
  const incoming = source.map((record: unknown) => {
    if (!isRecordShape(record)) throw new Error('文件中有损坏的记录，未导入任何内容')
    const state = parseStoredState(JSON.stringify(record.state))
    if (state === DEFAULT_EDITOR_STATE) {
      throw new Error('记录中的排版数据无效，未导入任何内容')
    }
    return {
      id: record.id,
      name: normalizeRecordName(record.name),
      savedAt: record.savedAt,
      favorite: record.favorite === true,
      state,
    }
  })
  const ids = new Set(current.map((record) => record.id))
  const additions = incoming.filter((record) => {
    if (ids.has(record.id)) return false
    ids.add(record.id)
    return true
  })
  if (current.length + additions.length > MAX_SAVED_LAYOUT_RECORDS) {
    throw new Error(`最多保存 ${MAX_SAVED_LAYOUT_RECORDS} 条记录，空间不足，请整理后再导入`)
  }
  return { records: [...additions, ...current], imported: additions.length, skipped: incoming.length - additions.length }
}

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

export function parseSavedLayoutRecords(raw: string | null, limit = MAX_SAVED_LAYOUT_RECORDS): SavedLayoutRecord[] {
  if (!raw) return []
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value
      .filter(isRecordShape)
      .map((record) => ({
        ...record,
        favorite: record.favorite === true,
        state: parseStoredState(JSON.stringify(record.state)),
      }))
      .slice(0, limit)
  } catch {
    return []
  }
}

function getRecordName(state: EditorState) {
  const titleLine = state.title.split('\n').find((line) => line.trim())?.trim()
  const bodyLine = state.body.split('\n').find((line) => line.trim())?.trim()
  return normalizeRecordName(titleLine || bodyLine || state.signature)
}

export function normalizeRecordName(name: string) {
  return (name.trim() || DEFAULT_SAVED_LAYOUT_RECORD_NAME).slice(0, 24)
}

export function createSavedLayoutRecord(
  state: EditorState,
  customName = '',
): SavedLayoutRecord {
  const savedAt = Date.now()
  return {
    id: `${savedAt}-${Math.random().toString(36).slice(2, 8)}`,
    name: customName.trim() ? normalizeRecordName(customName) : getRecordName(state),
    savedAt,
    favorite: false,
    state: JSON.parse(JSON.stringify(state)) as EditorState,
  }
}
