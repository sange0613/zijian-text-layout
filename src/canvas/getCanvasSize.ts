import { SIZE_BY_ID } from '../data/presets'
import type { EditorState, SizePreset } from '../types'

export function getCanvasSize(state: EditorState): SizePreset {
  if (state.sizeId === 'custom') {
    return {
      id: 'custom',
      label: '自定义',
      detail: `${state.customWidth} × ${state.customHeight}`,
      width: state.customWidth,
      height: state.customHeight,
    }
  }

  return SIZE_BY_ID.get(state.sizeId)!
}
