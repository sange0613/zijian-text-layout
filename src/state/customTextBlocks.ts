import type { CustomTextBlock, TextBlockPosition } from '../types'

export const MAX_CUSTOM_TEXT_BLOCKS = 8

export function createCustomTextBlock(index: number): CustomTextBlock {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: `自定义文字 ${index}`,
    fontId: 'source-sans',
    fontSize: 28,
    fontWeight: 600,
    color: '#111111',
    position: { x: 50, y: 50 },
  }
}

export function updateCustomTextBlock(
  blocks: CustomTextBlock[],
  id: string,
  patch: Partial<Omit<CustomTextBlock, 'id'>> & { position?: TextBlockPosition },
) {
  return blocks.map((block) => (block.id === id ? { ...block, ...patch } : block))
}
