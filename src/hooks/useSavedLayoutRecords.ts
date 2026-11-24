import { useCallback, useEffect, useState, useRef } from 'react'
import { MAX_LIBRARY_PHOTO_LENGTH } from '../background/saveTemplatePhoto'
import { LAYOUT_LIBRARY_KEY, libraryRecords, readLayoutLibrary, reconcileLayoutLibrary } from '../state/layoutLibrarySync'
import {
  createSavedLayoutRecord,
  importSavedLayoutRecords,
  parseSavedLayoutRecords,
  SAVED_LAYOUT_RECORDS_KEY,
} from '../state/savedLayoutRecords'
import type { BackgroundImageValue, EditorState, SavedLayoutRecord } from '../types'

function checkPhotoCapacity(records: SavedLayoutRecord[]) {
  if (records.reduce((total, record) => total + (record.photo?.url.length ?? 0), 0) > MAX_LIBRARY_PHOTO_LENGTH) {
    throw new Error('照片模板空间不足，可备份并清理旧记录，或仅保存排版')
  }
}

export function useSavedLayoutRecords() {
  const [records, setRecords] = useState(() =>
    parseSavedLayoutRecords(localStorage.getItem(SAVED_LAYOUT_RECORDS_KEY)),
  )
  const latest = useRef(records)

  useEffect(() => {
    const device = localStorage.getItem('project-suite-device-id-v1') ?? 'zijian-local'
    const previous = readLayoutLibrary(localStorage.getItem(LAYOUT_LIBRARY_KEY))
    if (!previous.entries.length && records.length) {
      localStorage.setItem(LAYOUT_LIBRARY_KEY, JSON.stringify(reconcileLayoutLibrary(previous, records, device)))
    } else if (previous.entries.length) {
      const restored = libraryRecords(previous)
      latest.current = restored
      setRecords(restored)
    }
    const receive = (event: StorageEvent) => {
      if (event.key !== LAYOUT_LIBRARY_KEY) return
      const next = libraryRecords(readLayoutLibrary(event.newValue))
      latest.current = next
      setRecords(next)
    }
    window.addEventListener('storage', receive)
    return () => window.removeEventListener('storage', receive)
    // Load the library once; subsequent local changes are recorded by persistRecords.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const persistRecords = useCallback((next: typeof records) => {
    const device = localStorage.getItem('project-suite-device-id-v1') ?? 'zijian-local'
    const library = reconcileLayoutLibrary(readLayoutLibrary(localStorage.getItem(LAYOUT_LIBRARY_KEY)), next, device)
    localStorage.setItem(LAYOUT_LIBRARY_KEY, JSON.stringify(library))
    latest.current = next
    setRecords(next)
  }, [])

  const save = useCallback((state: EditorState, name = '', photo?: BackgroundImageValue) => {
    const next = [createSavedLayoutRecord(state, name, photo), ...latest.current]
    if (photo) checkPhotoCapacity(next)
    persistRecords(next)
  }, [persistRecords])

  const rename = useCallback((id: string, name: string) => {
    persistRecords(latest.current.map((record) => record.id === id ? { ...record, name } : record))
  }, [persistRecords])

  const remove = useCallback((id: string) => {
    persistRecords(latest.current.filter((record) => record.id !== id))
  }, [persistRecords])

  const toggleFavorite = useCallback((id: string) => {
    persistRecords(latest.current.map((record) => record.id === id ? { ...record, favorite: !record.favorite } : record))
  }, [persistRecords])

  const importRecords = useCallback((raw: string) => {
    const result = importSavedLayoutRecords(raw, latest.current)
    checkPhotoCapacity(result.records)
    persistRecords(result.records)
    return { imported: result.imported, skipped: result.skipped }
  }, [persistRecords])

  return { records, save, rename, remove, toggleFavorite, importRecords }
}
