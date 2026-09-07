import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { getCanvasSize } from '../canvas/getCanvasSize'
import { getOverflowLabels } from '../canvas/getOverflowLabels'
import { FONT_BY_ID } from '../data/presets'
import type { BackgroundImageValue, EditorState, SignaturePosition } from '../types'

type PreviewCanvasProps = {
  state: EditorState
  backgroundImage: BackgroundImageValue | null
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
  { state, backgroundImage },
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

  useImperativeHandle(forwardedRef, () => canvasRef.current as HTMLDivElement)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || typeof ResizeObserver === 'undefined') return
    const updateScale = () => {
      const horizontal = Math.max(stage.clientWidth - 64, 240) / size.width
      const vertical = Math.max(stage.clientHeight - 64, 280) / size.height
      setScale(Math.min(horizontal, vertical, 0.72))
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [size.height, size.width])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
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
  }, [scale, state])

  return (
    <section className="preview-stage" aria-label="排版预览" ref={stageRef}>
      {overflowLabels.length ? (
        <div className="preview-overflow-warning" role="status">
          <span aria-hidden="true">!</span>
          文字超出画布：{overflowLabels.join('、')}
        </div>
      ) : null}
      <div
        className="preview-sizer"
        style={{ width: size.width * scale, height: size.height * scale }}
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
            transform: `scale(${scale})`,
          }}
        >
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
          <div className={`preview-content preview-content--${state.textLayoutId}`}>
            {state.title ? (
              <h2
                data-testid="preview-title"
                data-overflow-label="标题"
                style={{
                  left: `${state.titlePosition.x}%`,
                  top: `${state.titlePosition.y}%`,
                  color: state.titleStyle.color,
                  fontFamily: `'${titleFont.family}', ${titleFont.fallback}`,
                  fontSize: state.titleStyle.fontSize,
                  fontWeight: state.titleStyle.fontWeight,
                }}
              >
                {state.title}
              </h2>
            ) : null}
            {state.body ? (
              <p
                data-testid="preview-body"
                data-overflow-label="正文"
                style={{
                  left: `${state.bodyPosition.x}%`,
                  top: `${state.bodyPosition.y}%`,
                  color: state.bodyStyle.color,
                  fontFamily: `'${bodyFont.family}', ${bodyFont.fallback}`,
                  fontSize: state.bodyStyle.fontSize,
                  fontWeight: state.bodyStyle.fontWeight,
                }}
              >
                {state.body}
              </p>
            ) : null}
          </div>
          {state.signature ? (
            <div
              className="preview-signature"
              data-testid="preview-signature"
              data-overflow-label="署名"
              style={{
                ...getSignaturePositionStyle(state.signaturePosition),
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
            return block.text ? (
              <div
                key={block.id}
                className="preview-custom-text"
                data-testid={`preview-custom-text-${block.id}`}
                data-overflow-label="自定义文字"
                style={{
                  left: `${block.position.x}%`,
                  top: `${block.position.y}%`,
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
      </div>
      <div className="preview-meta" aria-hidden="true">
        {size.label} · {size.detail}
      </div>
    </section>
  )
})