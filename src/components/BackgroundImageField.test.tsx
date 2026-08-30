import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { BackgroundImageField } from './BackgroundImageField'

it('uploads and removes a valid background image', async () => {
  const user = userEvent.setup()
  const preparedImage = {
    url: 'blob:poster',
    name: 'poster.jpg',
    positionX: 50,
    positionY: 50,
    opacity: 100,
    blur: 0,
  }
  const prepare = vi.fn().mockResolvedValue(preparedImage)
  const onChange = vi.fn()
  const { rerender } = render(
    <BackgroundImageField value={null} onChange={onChange} prepare={prepare} />,
  )
  const file = new File(['image'], 'poster.jpg', { type: 'image/jpeg' })

  await user.upload(screen.getByLabelText('上传背景图'), file)
  expect(prepare).toHaveBeenCalledWith(file)
  expect(onChange).toHaveBeenCalledWith(preparedImage)

  rerender(
    <BackgroundImageField
      value={preparedImage}
      onChange={onChange}
      prepare={prepare}
    />,
  )
  expect(screen.getByText('poster.jpg')).toHaveAttribute('title', 'poster.jpg')

  await user.click(screen.getByRole('button', { name: '移除背景图' }))
  expect(onChange).toHaveBeenLastCalledWith(null)
})

it('shows an upload error without replacing the current image', async () => {
  const user = userEvent.setup()
  const prepare = vi.fn().mockRejectedValue(new Error('图片无法读取，请更换文件'))
  const onChange = vi.fn()
  render(
    <BackgroundImageField
      value={{
        url: 'blob:current',
        name: 'current.jpg',
        positionX: 50,
        positionY: 50,
        opacity: 100,
        blur: 0,
      }}
      onChange={onChange}
      prepare={prepare}
    />,
  )

  await user.upload(
    screen.getByLabelText('更换背景图'),
    new File(['broken'], 'broken.png', { type: 'image/png' }),
  )

  expect(screen.getByRole('alert')).toHaveTextContent('图片无法读取，请更换文件')
  expect(onChange).not.toHaveBeenCalled()
})