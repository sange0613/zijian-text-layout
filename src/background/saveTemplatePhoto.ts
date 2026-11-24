import type { BackgroundImageValue } from '../types'

export const MAX_TEMPLATE_PHOTO_LENGTH = 96_000
export const MAX_LIBRARY_PHOTO_LENGTH = 280_000

export function readTemplatePhoto(value: unknown): BackgroundImageValue | undefined {
  if (!value || typeof value !== 'object') return
  const photo = value as Partial<BackgroundImageValue>
  if (typeof photo.url !== 'string' || photo.url.length > MAX_TEMPLATE_PHOTO_LENGTH ||
      !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo.url) ||
      typeof photo.name !== 'string') return
  const within = (number: unknown, max: number): number is number =>
    typeof number === 'number' && Number.isFinite(number) && number >= 0 && number <= max
  if (!within(photo.positionX, 100) || !within(photo.positionY, 100) ||
      !within(photo.opacity, 100) || !within(photo.blur, 40)) return
  return { url: photo.url, name: photo.name.slice(0, 160), positionX: photo.positionX,
    positionY: photo.positionY, opacity: photo.opacity, blur: photo.blur }
}

export async function saveTemplatePhoto(photo: BackgroundImageValue) {
  const image = new Image()
  image.src = photo.url
  await image.decode()
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('无法处理这张照片')
  for (const side of [1440, 1200, 960, 720, 480, 320, 200]) {
    const scale = Math.min(1, side / Math.max(image.naturalWidth, image.naturalHeight))
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    for (const quality of [0.82, 0.65, 0.48]) {
      const result = readTemplatePhoto({ ...photo, url: canvas.toDataURL('image/jpeg', quality) })
      if (result) return result
    }
  }
  throw new Error('这张照片压缩后仍太大，请换一张照片')
}
