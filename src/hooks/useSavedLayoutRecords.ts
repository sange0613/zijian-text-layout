import { useCallback, useState } from 'react'
import {
  createSavedLayoutRecord,
  MAX_SAVED_LAYOUT_RECORDS,
  parseSavedLayoutRecords,
  SAVED_LAYOUT_RECORDS_KEY,
} from '../state/savedLayoutRecords'
import type { EditorState } from '../types'

export function useSavedLayoutRecords() {
  const [records, setRecords] = useState(() =>
    parseSavedLayoutRecords(localStorage.getItem(SAVED_LAYOUT_RECORDS_KEY)),
  )

  const save = useCallback((state: EditorState) => {
    setRecords((current) => {
      const next = [createSavedLayoutRecord(state), ...current].slice(
        0,
        MAX_SAVED_LAYOUT_RECORDS,
      )
      localStorage.setItem(SAVED_LAYOUT_RECORDS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setRecords((current) => {
      const next = current.filter((record) => record.id !== id)
      localStorage.setItem(SAVED_LAYOUT_RECORDS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { records, save, remove }
}
