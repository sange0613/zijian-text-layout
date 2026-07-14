import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./background/prepareBackgroundImage', () => ({
  prepareBackgroundImage: vi.fn(async (file: File) => ({
    url: 'blob:poster',
    name: file.name,
    positionX: 50,
    positionY: 50,
  })),
}))

it('renders the simple editor workspace', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: '字间' })).toBeInTheDocument()
  expect(screen.getByRole('main')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '下载 PNG' })).toBeInTheDocument()
  expect(screen.getAllByRole('option', { name: /思源|得意|汇文/ })).toHaveLength(12)
})

it('updates the preview text and size immediately', async () => {
  const user = userEvent.setup()
  render(<App />)

  const title = screen.getByLabelText('标题内容')
  await user.clear(title)
  await user.type(title, '夏日来信')

  expect(screen.getByTestId('preview-title')).toHaveTextContent('夏日来信')

  await user.click(screen.getByRole('button', { name: /方图 1:1/ }))
  expect(screen.getByTestId('preview-canvas')).toHaveAttribute('data-size', '1080x1080')
})

it('applies a custom canvas size and can switch back to a preset', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.clear(screen.getByLabelText('自定义宽度'))
  await user.type(screen.getByLabelText('自定义宽度'), '1600')
  await user.clear(screen.getByLabelText('自定义高度'))
  await user.type(screen.getByLabelText('自定义高度'), '900')
  await user.click(screen.getByRole('button', { name: '应用自定义尺寸' }))

  expect(screen.getByTestId('preview-canvas')).toHaveAttribute('data-size', '1600x900')
  expect(screen.getByText('自定义 · 1600 × 900')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /方图 1:1/ }))
  expect(screen.getByTestId('preview-canvas')).toHaveAttribute('data-size', '1080x1080')
})

it('updates title typography independently', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.selectOptions(screen.getByLabelText('标题字体'), 'smiley')
  fireEvent.change(screen.getByRole('slider', { name: '标题字号' }), { target: { value: '80' } })
  fireEvent.change(screen.getByLabelText('标题颜色'), { target: { value: '#ff0000' } })

  expect(screen.getByTestId('preview-title')).toHaveStyle({
    color: '#ff0000',
    fontSize: '80px',
  })
  expect(screen.getByTestId('preview-title').getAttribute('style')).toContain('Smiley Sans')
  expect(screen.getByTestId('preview-body').getAttribute('style')).not.toContain('Smiley Sans')
})

it('applies a pure text layout preset and still allows manual size tweaks', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: /标题压底/ }))

  expect(screen.getByTestId('preview-canvas')).toHaveAttribute('data-layout', 'number-focus')
  expect(screen.getByTestId('preview-title')).toHaveStyle({
    fontSize: '96px',
    fontWeight: '800',
  })
  expect(screen.getByTestId('preview-title').getAttribute('style')).toContain('Smiley Sans')

  fireEvent.change(screen.getByRole('slider', { name: '标题字号' }), {
    target: { value: '104' },
  })

  expect(screen.getByTestId('preview-title')).toHaveStyle({ fontSize: '104px' })
  expect(screen.getByTestId('preview-canvas')).toHaveAttribute('data-layout', 'number-focus')
})

it('moves the title and body independently with position sliders', () => {
  render(<App />)

  fireEvent.change(screen.getByRole('slider', { name: '标题左右位置' }), {
    target: { value: '24' },
  })
  fireEvent.change(screen.getByRole('slider', { name: '标题上下位置' }), {
    target: { value: '32' },
  })
  fireEvent.change(screen.getByRole('slider', { name: '正文左右位置' }), {
    target: { value: '72' },
  })
  fireEvent.change(screen.getByRole('slider', { name: '正文上下位置' }), {
    target: { value: '78' },
  })

  expect(screen.getByTestId('preview-title')).toHaveStyle({
    left: '24%',
    top: '32%',
  })
  expect(screen.getByTestId('preview-body')).toHaveStyle({
    left: '72%',
    top: '78%',
  })
})

it('disables export when both text fields are empty', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.clear(screen.getByLabelText('标题内容'))
  await user.clear(screen.getByLabelText('正文内容'))

  expect(screen.getByRole('button', { name: '下载 PNG' })).toBeDisabled()
  expect(screen.getByText('请输入文字内容')).toBeInTheDocument()
})

it.each([
  { label: '左上', expectedStyle: { top: '6%', textAlign: 'left' } },
  { label: '上中', expectedStyle: { top: '6%', textAlign: 'center' } },
  { label: '右上', expectedStyle: { top: '6%', textAlign: 'right' } },
  { label: '左下', expectedStyle: { bottom: '6%', textAlign: 'left' } },
  { label: '下中', expectedStyle: { bottom: '6%', textAlign: 'center' } },
  { label: '右下', expectedStyle: { bottom: '6%', textAlign: 'right' } },
])('moves the signature to $label', async ({ label, expectedStyle }) => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByLabelText('署名文字'), '摄影 / 林野')
  await user.click(screen.getByRole('button', { name: label }))

  expect(screen.getByTestId('preview-signature')).toHaveTextContent('摄影 / 林野')
  expect(screen.getByTestId('preview-signature')).toHaveStyle(expectedStyle)
})

it('allows export when only the signature has content', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.clear(screen.getByLabelText('标题内容'))
  await user.clear(screen.getByLabelText('正文内容'))
  await user.type(screen.getByLabelText('署名文字'), '摄影 / 林野')

  expect(screen.getByRole('button', { name: '下载 PNG' })).toBeEnabled()
})

it('keeps the signature font independent from the body font', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByLabelText('署名文字'), '摄影 / 林野')
  await user.selectOptions(screen.getByLabelText('署名字体'), 'huiwen-mincho')
  await user.selectOptions(screen.getByLabelText('正文字体'), 'source-serif')

  expect(screen.getByTestId('preview-signature').getAttribute('style')).toContain('Huiwen Mincho')
  expect(screen.getByTestId('preview-body').getAttribute('style')).toContain('Noto Serif SC')
})

it('controls signature size independently from body size', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByLabelText('署名文字'), '摄影 / 林野')
  fireEvent.change(screen.getByRole('slider', { name: '署名字号' }), {
    target: { value: '42' },
  })
  fireEvent.change(screen.getByRole('slider', { name: '正文字号' }), {
    target: { value: '64' },
  })

  expect(screen.getByTestId('preview-signature')).toHaveStyle({ fontSize: '42px' })
})

it('keeps a selected signature anchor when the body becomes multiline', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByLabelText('署名文字'), '摄影 / 林野')
  await user.click(screen.getByRole('button', { name: '右上' }))
  await user.clear(screen.getByLabelText('正文内容'))
  await user.type(screen.getByLabelText('正文内容'), '第一行{enter}第二行{enter}第三行')

  expect(screen.getByTestId('preview-signature')).toHaveStyle({
    top: '6%',
    textAlign: 'right',
  })
})

it('uploads, keeps, and removes a cover background image', async () => {
  const user = userEvent.setup()
  render(<App />)
  const file = new File(['image'], 'poster.jpg', { type: 'image/jpeg' })

  expect(screen.queryByRole('slider', { name: '背景图左右位置' })).not.toBeInTheDocument()
  await user.upload(screen.getByLabelText('上传背景图'), file)
  expect(screen.getByTestId('preview-background-image')).toHaveAttribute('src', 'blob:poster')
  expect(screen.getByTestId('preview-background-image')).toHaveClass('preview-background-image')

  fireEvent.change(screen.getByRole('slider', { name: '背景图左右位置' }), {
    target: { value: '20' },
  })
  fireEvent.change(screen.getByRole('slider', { name: '背景图上下位置' }), {
    target: { value: '75' },
  })
  expect(screen.getByTestId('preview-background-image')).toHaveStyle({
    objectPosition: '20% 75%',
  })

  await user.click(screen.getByRole('button', { name: /方图 1:1/ }))
  expect(screen.getByTestId('preview-background-image')).toHaveAttribute('src', 'blob:poster')

  await user.click(screen.getByRole('button', { name: '移除背景图' }))
  expect(screen.queryByTestId('preview-background-image')).not.toBeInTheDocument()
  expect(screen.queryByRole('slider', { name: '背景图左右位置' })).not.toBeInTheDocument()
})
