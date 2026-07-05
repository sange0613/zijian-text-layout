import { expect, it } from 'vitest'
import { DEFAULT_EDITOR_STATE } from '../state/editorState'
import { getCanvasSize } from './getCanvasSize'

it('resolves an existing canvas preset', () => {
  expect(getCanvasSize({ ...DEFAULT_EDITOR_STATE, sizeId: 'square' })).toMatchObject({
    label: '方图 1:1',
    width: 1080,
    height: 1080,
  })
})

it('builds a custom canvas size from editor state', () => {
  expect(
    getCanvasSize({
      ...DEFAULT_EDITOR_STATE,
      sizeId: 'custom',
      customWidth: 1600,
      customHeight: 900,
    }),
  ).toEqual({
    id: 'custom',
    label: '自定义',
    detail: '1600 × 900',
    width: 1600,
    height: 900,
  })
})
