import { useCallback, useEffect, useReducer, useRef } from 'react'
import { DEFAULT_EDITOR_STATE, parseStoredState, STORAGE_KEY } from '../state/editorState'
import type { EditorState } from '../types'

const HISTORY_LIMIT = 50

type EditorHistory = {
  past: EditorState[]
  present: EditorState
  future: EditorState[]
}

type HistoryAction =
  | { type: 'update'; patch: Partial<EditorState>; coalesce: boolean }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset' }

function editorHistoryReducer(history: EditorHistory, action: HistoryAction): EditorHistory {
  if (action.type === 'update') {
    const present = { ...history.present, ...action.patch }
    if (JSON.stringify(present) === JSON.stringify(history.present)) return history
    return {
      past: action.coalesce
        ? history.past
        : [...history.past, history.present].slice(-HISTORY_LIMIT),
      present,
      future: [],
    }
  }

  if (action.type === 'undo') {
    const previous = history.past.at(-1)
    if (!previous) return history
    return {
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future].slice(0, HISTORY_LIMIT),
    }
  }

  if (action.type === 'redo') {
    const next = history.future[0]
    if (!next) return history
    return {
      past: [...history.past, history.present].slice(-HISTORY_LIMIT),
      present: next,
      future: history.future.slice(1),
    }
  }

  if (JSON.stringify(history.present) === JSON.stringify(DEFAULT_EDITOR_STATE)) return history
  return {
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: DEFAULT_EDITOR_STATE,
    future: [],
  }
}

export function usePersistedEditorState() {
  const lastUpdateRef = useRef<{ key: string; at: number } | null>(null)
  const [history, dispatch] = useReducer(editorHistoryReducer, null, () => ({
    past: [],
    present: parseStoredState(localStorage.getItem(STORAGE_KEY)),
    future: [],
  }))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.present))
  }, [history.present])

  const update = useCallback((patch: Partial<EditorState>) => {
    const keys = Object.keys(patch)
    const key = keys.length === 1 ? keys[0] : ''
    const at = Date.now()
    const lastUpdate = lastUpdateRef.current
    const coalesce = Boolean(key && lastUpdate?.key === key && at - lastUpdate.at < 750)
    lastUpdateRef.current = key ? { key, at } : null
    dispatch({ type: 'update', patch, coalesce })
  }, [])

  const reset = useCallback(() => {
    lastUpdateRef.current = null
    dispatch({ type: 'reset' })
  }, [])

  const undo = useCallback(() => {
    lastUpdateRef.current = null
    dispatch({ type: 'undo' })
  }, [])

  const redo = useCallback(() => {
    lastUpdateRef.current = null
    dispatch({ type: 'redo' })
  }, [])

  return {
    state: history.present,
    update,
    reset,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
