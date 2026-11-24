import { useRef, useState, type PointerEvent } from 'react'
import type { TextBlockPosition } from '../types'

export type DragTarget = { type: 'title' | 'body' | 'signature' } | { type: 'custom'; id: string }
type DragSession = {
  pointer: number
  target: DragTarget
  start: TextBlockPosition
  origin: TextBlockPosition
  box: DOMRect
  position: TextBlockPosition | null
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)))
const snapCenter = (value: number) => Math.abs(value - 50) <= 1.5 ? 50 : clampPercent(value)

export function useCanvasDrag(onCommit?: (target: DragTarget, position: TextBlockPosition) => void) {
  const session = useRef<DragSession | null>(null)
  const [drag, setDrag] = useState<{ target: DragTarget; position: TextBlockPosition } | null>(null)

  function finish(event: PointerEvent, commit: boolean) {
    const active = session.current
    if (active?.pointer !== event.pointerId) return
    session.current = null
    setDrag(null)
    if (commit && active.position) onCommit?.(active.target, active.position)
  }

  return {
    drag,
    props(target: DragTarget, origin?: TextBlockPosition | null) {
      if (!onCommit) return {}
      return {
        'data-draggable-text': true,
        onPointerDown(event: PointerEvent<HTMLElement>) {
          const box = event.currentTarget.closest('[data-export-canvas]')?.getBoundingClientRect()
          if (session.current || event.button !== 0 || !box?.width || !box.height) return
          let text = event.currentTarget.getBoundingClientRect()
          if (target.type === 'signature' && !origin) {
            const range = event.currentTarget.ownerDocument.createRange()
            range.selectNodeContents(event.currentTarget)
            const bounds = range.getBoundingClientRect()
            if (bounds.width) text = bounds
          }
          session.current = {
            pointer: event.pointerId, target, box, position: null,
            start: { x: event.clientX, y: event.clientY },
            origin: origin ?? { x: (text.left + text.width / 2 - box.left) / box.width * 100,
              y: (text.top + text.height / 2 - box.top) / box.height * 100 },
          }
          event.currentTarget.setPointerCapture(event.pointerId)
        },
        onPointerMove(event: PointerEvent) {
          const active = session.current
          if (active?.pointer !== event.pointerId) return
          const dx = event.clientX - active.start.x
          const dy = event.clientY - active.start.y
          if (!active.position && Math.hypot(dx, dy) < (event.pointerType === 'touch' ? 6 : 3)) return
          active.position = {
            x: snapCenter(active.origin.x + dx * 100 / active.box.width),
            y: snapCenter(active.origin.y + dy * 100 / active.box.height),
          }
          setDrag({ target: active.target, position: active.position })
        },
        onPointerUp: (event: PointerEvent) => finish(event, true),
        onPointerCancel: (event: PointerEvent) => finish(event, false),
        onLostPointerCapture: (event: PointerEvent) => finish(event, false),
      }
    },
  }
}
