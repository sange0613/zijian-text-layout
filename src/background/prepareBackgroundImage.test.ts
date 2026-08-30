import { describe, expect, it, vi } from 'vitest'
import { MAX_BACKGROUND_IMAGE_BYTES, prepareBackgroundImage } from './prepareBackgroundImage'

const dependencies = () => ({
  createObjectURL: vi.fn(() => 'blob:poster'),
  revokeObjectURL: vi.fn(),
  decode: vi.fn(() => Promise.resolve()),
})

describe('prepareBackgroundImage', () => {
  it('decodes a valid image before returning its session value', async () => {
    const deps = dependencies()
    const file = new File(['image'], '海报.jpg', { type: 'image/jpeg' })

    await expect(prepareBackgroundImage(file, deps)).resolves.toEqual({
      url: 'blob:poster',
      name: '海报.jpg',
      positionX: 50,
      positionY: 50,
      opacity: 100,
      blur: 0,
    })
    expect(deps.decode).toHaveBeenCalledWith('blob:poster')
  })

  it('rejects files over 20MB before creating a URL', async () => {
    const deps = dependencies()
    const file = new File(['x'], 'large.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: MAX_BACKGROUND_IMAGE_BYTES + 1 })

    await expect(prepareBackgroundImage(file, deps)).rejects.toThrow(
      '图片过大，请选择 20MB 以内的图片',
    )
    expect(deps.createObjectURL).not.toHaveBeenCalled()
  })

  it('rejects non-images', async () => {
    const deps = dependencies()
    const file = new File(['text'], 'notes.txt', { type: 'text/plain' })

    await expect(prepareBackgroundImage(file, deps)).rejects.toThrow(
      '图片无法读取，请更换文件',
    )
  })

  it('revokes the new URL when decoding fails', async () => {
    const deps = dependencies()
    deps.decode.mockRejectedValue(new Error('decode failed'))
    const file = new File(['broken'], 'broken.png', { type: 'image/png' })

    await expect(prepareBackgroundImage(file, deps)).rejects.toThrow(
      '图片无法读取，请更换文件',
    )
    expect(deps.revokeObjectURL).toHaveBeenCalledWith('blob:poster')
  })
})
