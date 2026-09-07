import { act, renderHook } from '@testing-library/react'
import { expect, it } from 'vitest'
import { STORAGE_KEY } from '../state/editorState'
import { usePersistedEditorState } from './usePersistedEditorState'

it('persists updates to local storage', () => {
  const { result } = renderHook(() => usePersistedEditorState())

  act(() => result.current.update({ title: '新的标题' }))

  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toMatchObject({
    title: '新的标题',
  })
})

it('supports undo and redo while keeping storage in sync', () => {
  const { result } = renderHook(() => usePersistedEditorState())
  const originalTitle = result.current.state.title

  act(() => result.current.update({ title: '第一版标题' }))
  expect(result.current.canUndo).toBe(true)

  act(() => result.current.undo())
  expect(result.current.state.title).toBe(originalTitle)
  expect(result.current.canRedo).toBe(true)
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).title).toBe(originalTitle)

  act(() => result.current.redo())
  expect(result.current.state.title).toBe('第一版标题')
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).title).toBe('第一版标题')
})