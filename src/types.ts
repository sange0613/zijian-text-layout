export type TextStyle = {
  fontId: string
  fontSize: number
  fontWeight: number
  color: string
}

export type TextBlockPosition = {
  x: number
  y: number
}

export type CustomTextBlock = {
  id: string
  text: string
  fontId: string
  fontSize: number
  fontWeight: number
  color: string
  position: TextBlockPosition
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
  textLayoutId: string
  signaturePosition: SignaturePosition
  signatureFontId: string
  signatureFontSize: number
  titleStyle: TextStyle
  bodyStyle: TextStyle
  titlePosition: TextBlockPosition
  bodyPosition: TextBlockPosition
  customTextBlocks: CustomTextBlock[]
  backgroundColor: string
  sizeId: string
  customWidth: number
  customHeight: number
}

export type SavedLayoutRecord = {
  id: string
  name: string
  savedAt: number
  state: EditorState
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

export type TextLayoutPreset = {
  id: string
  label: string
  rule: string
  titleStyle: TextStyle
  bodyStyle: TextStyle
  titlePosition: TextBlockPosition
  bodyPosition: TextBlockPosition
}
