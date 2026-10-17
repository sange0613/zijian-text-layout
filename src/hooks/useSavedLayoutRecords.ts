import { useCallback, useEffect, useState } from 'react'
import { LAYOUT_LIBRARY_KEY, libraryRecords, readLayoutLibrary, reconcileLayoutLibrary } from '../state/layoutLibrarySync'
import {
  createSavedLayoutRecord,
  importSavedLayoutRecords,
  parseSavedLayoutRecords,
  SAVED_LAYOUT_RECORDS_KEY,
} from '../state/savedLayoutRecords'
import type { EditorState } from '../types'

export function useSavedLayoutRecords() {
  const [records, setRecords] = useState(() =>
    parseSavedLayoutRecords(localStorage.getItem(SAVED_LAYOUT_RECORDS_KEY)),
  )

  useEffect(() => {
    const device = localStorage.getItem('project-suite-device-id-v1') ?? 'zijian-local'
    const previous = readLayoutLibrary(localStorage.getItem(LAYOUT_LIBRARY_KEY))
    if (!previous.entries.length && records.length) {
      localStorage.setItem(LAYOUT_LIBRARY_KEY, JSON.stringify(reconcileLayoutLibrary(previous, records, device)))
    } else if (previous.entries.length) {
      const restored = libraryRecords(previous)
      localStorage.setItem(SAVED_LAYOUT_RECORDS_KEY, JSON.stringify(restored))
      setRecords(restored)
    }
    const receive = (event: StorageEvent) => {
      if (event.key !== LAYOUT_LIBRARY_KEY) return
      const next = libraryRecords(readLayoutLibrary(event.newValue))
      localStorage.setItem(SAVED_LAYOUT_RECORDS_KEY, JSON.stringify(next))
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
    localStorage.setItem(SAVED_LAYOUT_RECORDS_KEY, JSON.stringify(next))
  }, [])

  const save = useCallback((state: EditorState, name = '') => {
    setRecords((current) => {
      const next = [createSavedLayoutRecord(state, name), ...current]
      persistRecords(next)
      return next
    })
  }, [persistRecords])

  const rename = useCallback((id: string, name: string) => {
    setRecords((current) => {
      const next = current.map((record) =>
        record.id === id ? { ...record, name } : record,
      )
      persistRecords(next)
      return next
    })
  }, [persistRecords])

  const remove = useCallback((id: string) => {
    setRecords((current) => {
      const next = current.filter((record) => record.id !== id)
      persistRecords(next)
      return next
    })
  }, [persistRecords])

  const toggleFavorite = useCallback((id: string) => {
    setRecords((current) => {
      const next = current.map((record) =>
        record.id === id ? { ...record, favorite: !record.favorite } : record,
      )
      persistRecords(next)
      return next
    })
  }, [persistRecords])

  const importRecords = useCallback((raw: string) => {
    const result = importSavedLayoutRecords(raw, records)
    persistRecords(result.records)
    setRecords(result.records)
    return { imported: result.imported, skipped: result.skipped }
  }, [records, persistRecords])

  return { records, save, rename, remove, toggleFavorite, importRecords }
}
