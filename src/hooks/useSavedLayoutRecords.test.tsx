import { act, renderHook } from '@testing-library/react'
import { expect, it } from 'vitest'
import { useSavedLayoutRecords } from './useSavedLayoutRecords'
import { DEFAULT_EDITOR_STATE } from '../state/editorState'
import { createSavedLayoutRecord, SAVED_LAYOUT_RECORDS_KEY } from '../state/savedLayoutRecords'
import { LAYOUT_LIBRARY_KEY, libraryRecords, readLayoutLibrary } from '../state/layoutLibrarySync'

it('migrates existing templates and stamps edits and deletions for cloud sync', () => {
  const record = createSavedLayoutRecord(DEFAULT_EDITOR_STATE, '旧模板')
  localStorage.setItem(SAVED_LAYOUT_RECORDS_KEY, JSON.stringify([record]))
  const { result } = renderHook(useSavedLayoutRecords)
  expect(libraryRecords(readLayoutLibrary(localStorage.getItem(LAYOUT_LIBRARY_KEY)))).toEqual([record])
  act(() => result.current.rename(record.id, '新名称'))
  expect(libraryRecords(readLayoutLibrary(localStorage.getItem(LAYOUT_LIBRARY_KEY)))[0].name).toBe('新名称')
  act(() => result.current.remove(record.id))
  expect(readLayoutLibrary(localStorage.getItem(LAYOUT_LIBRARY_KEY)).entries[0].deleted).toBe(true)
})

it('receives cloud templates live without resetting the active editor', () => {
  const { result } = renderHook(useSavedLayoutRecords)
  const record = createSavedLayoutRecord(DEFAULT_EDITOR_STATE, '另一设备模板')
  const raw = JSON.stringify({ version: 1, entries: [{ id: record.id, record, updatedAt: 10, updatedBy: 'remote' }] })
  act(() => {
    localStorage.setItem(LAYOUT_LIBRARY_KEY, raw)
    window.dispatchEvent(new StorageEvent('storage', { key: LAYOUT_LIBRARY_KEY, newValue: raw }))
  })
  expect(result.current.records).toEqual([record])
})
