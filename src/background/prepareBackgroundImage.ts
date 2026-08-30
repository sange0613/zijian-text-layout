import type { BackgroundImageValue } from '../types'

export const MAX_BACKGROUND_IMAGE_BYTES = 20 * 1024 * 1024

type BackgroundImageDependencies = {
  createObjectURL: (file: File) => string
  revokeObjectURL: (url: string) => void
  decode: (url: string) => Promise<void>
}

function decodeImage(url: string) {
  const image = new Image()
  image.src = url
  if (typeof image.decode === 'function') return image.decode()

  return new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('decode failed'))
  })
}

const BROWSER_DEPENDENCIES: BackgroundImageDependencies = {
  createObjectURL: (file) => URL.createObjectURL(file),
  revokeObjectURL: (url) => URL.revokeObjectURL(url),
  decode: decodeImage,
}

export async function prepareBackgroundImage(
  file: File,
  dependencies: BackgroundImageDependencies = BROWSER_DEPENDENCIES,
): Promise<BackgroundImageValue> {
  if (file.size > MAX_BACKGROUND_IMAGE_BYTES) {
    throw new Error('图片过大，请选择 20MB 以内的图片')
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('图片无法读取，请更换文件')
  }

  const url = dependencies.createObjectURL(file)
  try {
    await dependencies.decode(url)
    return {
      url,
      name: file.name,
      positionX: 50,
      positionY: 50,
      opacity: 100,
      blur: 0,
    }
  } catch {
    dependencies.revokeObjectURL(url)
    throw new Error('图片无法读取，请更换文件')
  }
}
