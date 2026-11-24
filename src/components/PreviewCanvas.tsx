import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { getCanvasSize } from '../canvas/getCanvasSize'
import { getOverflowLabels } from '../canvas/getOverflowLabels'
import { FONT_BY_ID } from '../data/presets'
import { splitComparison, TEXT_LAYOUT_BY_ID } from '../data/textLayoutPresets'
import { useCanvasDrag, type DragTarget } from '../hooks/useCanvasDrag'
import type { BackgroundImageValue, EditorState, SignaturePosition, TextBlockPosition } from '../types'

type PreviewCanvasProps = {
  state: EditorState
  backgroundImage: BackgroundImageValue | null
  compact?: boolean
  actions?: ReactNode
  onMoveText?: (target: DragTarget, position: TextBlockPosition) => void
}

function getSignaturePositionStyle(position: SignaturePosition): CSSProperties {
  const isTop = position.startsWith('top-')
  const textAlign = position.endsWith('-left')
    ? 'left'
    : position.endsWith('-right')
      ? 'right'
      : 'center'

  return {
    top: isTop ? '6%' : undefined,
    bottom: isTop ? undefined : '6%',
    textAlign,
  }
}

export const PreviewCanvas = forwardRef<HTMLDivElement, PreviewCanvasProps>(function PreviewCanvas(
  { state, backgroundImage, compact = false, actions, onMoveText },
  forwardedRef,
) {
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)
  const [overflowLabels, setOverflowLabels] = useState<string[]>([])
  const size = getCanvasSize(state)
  const titleFont = FONT_BY_ID.get(state.titleStyle.fontId)!
  const bodyFont = FONT_BY_ID.get(state.bodyStyle.fontId)!
  const signatureFont = FONT_BY_ID.get(state.signatureFontId)!
  const preset = TEXT_LAYOUT_BY_ID.get(state.textLayoutId)
  const photo = preset?.photo
  const usesTextControls = photo || preset?.textCard
  const columns = preset?.textCard?.comparison ? splitComparison(state.body) : null
  const { drag, props: dragProps } = useCanvasDrag(onMoveText)
  const displayScale = compact ? Math.min(140 / size.width, 195 / size.height) : scale
  const titlePosition = drag?.target.type === 'title' ? drag.position : state.titlePosition
  const bodyPosition = drag?.target.type === 'body' ? drag.position : state.bodyPosition
  const signatureOffset = drag?.target.type === 'signature' ? drag.position : state.signatureOffset

  useImperativeHandle(forwardedRef, () => canvasRef.current as HTMLDivElement)

  useEffect(() => {
    const stage = stageRef.current
    if (compact || !stage || typeof ResizeObserver === 'undefined') return
    const updateScale = () => {
      const horizontal = Math.max(stage.clientWidth - 64, 240) / size.width
      const vertical = Math.max(stage.clientHeight - 64, 280) / size.height
      setScale(Math.min(horizontal, vertical, 0.72))
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [compact, size.height, size.width])

  useEffect(() => {
    const canvas = canvasRef.current
    if (compact || !canvas) return
    let cancelled = false
    const checkOverflow = () => {
      if (cancelled) return
      const elements = [...canvas.querySelectorAll<HTMLElement>('[data-overflow-label]')]
      setOverflowLabels(
        getOverflowLabels(
          canvas.getBoundingClientRect(),
          elements.map((element) => ({
            label: element.dataset.overflowLabel ?? '文字',
            rect: element.getBoundingClientRect(),
          })),
        ),
      )
    }
    const frame = requestAnimationFrame(checkOverflow)
    void document.fonts?.ready.then(checkOverflow)
    window.addEventListener('resize', checkOverflow)
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', checkOverflow)
    }
  }, [compact, scale, state])

  return (
    <section className={compact ? 'preview-stage preview-stage--compact' : 'preview-stage'} aria-label={compact ? '封面缩略预览' : '排版预览'} ref={stageRef}>
      {!compact && photo && !backgroundImage ? <div className="preview-template-hint">上传背景图，即可套用当前构图</div> : null}
      {overflowLabels.length ? (
        <div className="preview-overflow-warning" role="status">
          <span aria-hidden="true">!</span>
          文字超出画布：{overflowLabels.join('、')}
        </div>
      ) : null}
      <div
        className="preview-sizer"
        style={{ width: size.width * displayScale, height: size.height * displayScale }}
      >
        <div
          ref={canvasRef}
          className="preview-canvas"
          data-testid="preview-canvas"
          data-export-canvas="true"
          data-size={`${size.width}x${size.height}`}
          data-layout={state.textLayoutId}
          style={{
            width: size.width,
            height: size.height,
            backgroundColor: state.backgroundColor,
            transform: `scale(${displayScale})`,
          }}
        >
          {backgroundImage || photo ? (
            <div className="preview-image-frame" data-testid="preview-image-frame" style={photo ? {
              left: `${photo.frame.x}%`, top: `${photo.frame.y}%`, width: `${photo.frame.width}%`, height: `${photo.frame.height}%`,
              background: backgroundImage ? undefined : '#9FAFA5',
            } : undefined}>
            {backgroundImage ? (
            <img
              className="preview-background-image"
              data-testid="preview-background-image"
              src={backgroundImage.url}
              style={{
                objectPosition: `${backgroundImage.positionX}% ${backgroundImage.positionY}%`,
                opacity: backgroundImage.opacity / 100,
                filter: `blur(${backgroundImage.blur}px)`,
                transform: `scale(${1 + backgroundImage.blur / 300})`,
              }}
              alt=""
              aria-hidden="true"
            />
            ) : null}
            </div>
          ) : null}
          {photo?.overlays.map((overlay, index) => (
            <div key={index} className="preview-photo-overlay" aria-hidden="true" style={{
              left: `${overlay.x}%`, top: `${overlay.y}%`, width: `${overlay.width}%`, height: `${overlay.height}%`, background: overlay.background,
            }} />
          ))}
          <div className={`preview-content preview-content--${state.textLayoutId}${photo ? ' preview-content--photo' : ''}`}>
            {state.title ? (
              <h2
                data-testid="preview-title"
                data-overflow-label="标题"
                {...dragProps({ type: 'title' }, state.titlePosition)}
                style={{
                  left: `${titlePosition.x}%`,
                  top: `${titlePosition.y}%`,
                  color: state.titleStyle.color,
                  fontFamily: `'${titleFont.family}', ${titleFont.fallback}`,
                  fontSize: state.titleStyle.fontSize,
                  fontWeight: state.titleStyle.fontWeight,
                  ...(usesTextControls ? { width: `${state.titleStyle.widthPercent ?? 82}%`, maxWidth: 'none', textAlign: state.titleStyle.textAlign ?? 'left', lineHeight: state.titleStyle.lineHeight ?? 1.45, margin: 0 } : {}),
                }}
              >
                {state.title}
              </h2>
            ) : null}
            {state.body ? (
              <p
                data-testid="preview-body"
                data-overflow-label="正文"
                className={columns ? 'text-card-comparison' : undefined}
                {...dragProps({ type: 'body' }, state.bodyPosition)}
                style={{
                  left: `${bodyPosition.x}%`,
                  top: `${bodyPosition.y}%`,
                  color: state.bodyStyle.color,
                  fontFamily: `'${bodyFont.family}', ${bodyFont.fallback}`,
                  fontSize: state.bodyStyle.fontSize,
                  fontWeight: state.bodyStyle.fontWeight,
                  ...(usesTextControls ? { width: `${state.bodyStyle.widthPercent ?? 80}%`, maxWidth: 'none', textAlign: state.bodyStyle.textAlign ?? 'left', lineHeight: state.bodyStyle.lineHeight ?? 1.6, margin: 0 } : {}),
                }}
              >
                {columns ? <><span>{columns[0]}</span><span>{columns[1]}</span></> : state.body}
              </p>
            ) : null}
          </div>
          {state.signature ? (
            <div
              className="preview-signature"
              data-testid="preview-signature"
              data-overflow-label="署名"
              {...dragProps({ type: 'signature' }, state.signatureOffset)}
              style={{
                ...getSignaturePositionStyle(state.signaturePosition),
                ...(signatureOffset ? { left: `${signatureOffset.x}%`, top: `${signatureOffset.y}%`, right: 'auto', bottom: 'auto', width: 'max-content', maxWidth: '78%', transform: 'translate(-50%, -50%)' } : {}),
                color: state.signatureColor,
                fontFamily: `'${signatureFont.family}', ${signatureFont.fallback}`,
                fontSize: state.signatureFontSize,
                fontWeight: state.bodyStyle.fontWeight,
              }}
            >
              {state.signature}
            </div>
          ) : null}
          {state.customTextBlocks.map((block) => {
            const font = FONT_BY_ID.get(block.fontId)!
            const position = drag?.target.type === 'custom' && drag.target.id === block.id ? drag.position : block.position
            return block.text ? (
              <div
                key={block.id}
                className="preview-custom-text"
                data-testid={`preview-custom-text-${block.id}`}
                data-overflow-label="自定义文字"
                {...dragProps({ type: 'custom', id: block.id }, block.position)}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  color: block.color,
                  fontFamily: `'${font.family}', ${font.fallback}`,
                  fontSize: block.fontSize,
                  fontWeight: block.fontWeight,
                }}
              >
                {block.text}
              </div>
            ) : null
          })}
        </div>
        {drag?.position.x === 50 ? <span className="preview-snap-guide preview-snap-guide--vertical" /> : null}
        {drag?.position.y === 50 ? <span className="preview-snap-guide preview-snap-guide--horizontal" /> : null}
      </div>
      {!compact ? <div className="preview-meta">
        <span>{size.label} · {size.detail}</span>
        {actions ? <div className="preview-actions">{actions}</div> : null}
      </div> : null}
    </section>
  )
})
