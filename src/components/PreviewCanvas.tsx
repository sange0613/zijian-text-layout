import { forwardRef, useEffect, useRef, useState, type CSSProperties } from 'react'
import { getCanvasSize } from '../canvas/getCanvasSize'
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
  const [scale, setScale] = useState(0.4)
  const size = getCanvasSize(state)
  const titleFont = FONT_BY_ID.get(state.titleStyle.fontId)!
  const bodyFont = FONT_BY_ID.get(state.bodyStyle.fontId)!
  const signatureFont = FONT_BY_ID.get(state.signatureFontId)!

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

  return (
    <section className="preview-stage" aria-label="排版预览" ref={stageRef}>
      <div
        className="preview-sizer"
        style={{ width: size.width * scale, height: size.height * scale }}
      >
        <div
          ref={forwardedRef}
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
              }}
              alt=""
              aria-hidden="true"
            />
          ) : null}
          <div className={`preview-content preview-content--${state.textLayoutId}`}>
            {state.title ? (
              <h2
                data-testid="preview-title"
                style={{
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
                style={{
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
              style={{
                ...getSignaturePositionStyle(state.signaturePosition),
                color: state.bodyStyle.color,
                fontFamily: `'${signatureFont.family}', ${signatureFont.fallback}`,
                fontSize: state.signatureFontSize,
                fontWeight: state.bodyStyle.fontWeight,
              }}
            >
              {state.signature}
            </div>
          ) : null}
        </div>
      </div>
      <div className="preview-meta" aria-hidden="true">
        {size.label} · {size.detail}
      </div>
    </section>
  )
})
