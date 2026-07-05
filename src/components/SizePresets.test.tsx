import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { SizePresets } from './SizePresets'

it('applies a custom canvas width and height', async () => {
  const user = userEvent.setup()
  const onCustomSizeChange = vi.fn()
  render(
    <SizePresets
      value="redbook"
      customWidth={1080}
      customHeight={1080}
      onChange={vi.fn()}
      onCustomSizeChange={onCustomSizeChange}
    />,
  )

  await user.clear(screen.getByLabelText('自定义宽度'))
  await user.type(screen.getByLabelText('自定义宽度'), '1600')
  await user.clear(screen.getByLabelText('自定义高度'))
  await user.type(screen.getByLabelText('自定义高度'), '900')
  await user.click(screen.getByRole('button', { name: '应用自定义尺寸' }))

  expect(onCustomSizeChange).toHaveBeenCalledWith(1600, 900)
})

it('clamps custom dimensions when submitted with Enter', async () => {
  const user = userEvent.setup()
  const onCustomSizeChange = vi.fn()
  render(
    <SizePresets
      value="redbook"
      customWidth={1080}
      customHeight={1080}
      onChange={vi.fn()}
      onCustomSizeChange={onCustomSizeChange}
    />,
  )

  await user.clear(screen.getByLabelText('自定义宽度'))
  await user.type(screen.getByLabelText('自定义宽度'), '9999')
  await user.clear(screen.getByLabelText('自定义高度'))
  await user.type(screen.getByLabelText('自定义高度'), '100{enter}')

  expect(onCustomSizeChange).toHaveBeenCalledWith(4096, 320)
})
