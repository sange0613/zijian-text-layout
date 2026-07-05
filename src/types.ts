export type TextStyle = {
  fontId: string
  fontSize: number
  fontWeight: number
  color: string
}

export type SignaturePosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type EditorState = {
  title: string
  body: string
  signature: string
  signaturePosition: SignaturePosition
  signatureFontId: string
  signatureFontSize: number
  titleStyle: TextStyle
  bodyStyle: TextStyle
  backgroundColor: string
  sizeId: string
  customWidth: number
  customHeight: number
}

export type SizePreset = {
  id: string
  label: string
  detail: string
  width: number
  height: number
}

export type FontPreset = {
  id: string
  label: string
  family: string
  fallback: string
  usage: string
}

export type BackgroundImageValue = {
  url: string
  name: string
  positionX: number
  positionY: number
}
