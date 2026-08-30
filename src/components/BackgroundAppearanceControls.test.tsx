import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { BackgroundAppearanceControls } from './BackgroundAppearanceControls'

it('updates background opacity and blur independently', () => {
  const onOpacityChange = vi.fn()
  const onBlurChange = vi.fn()

  render(
    <BackgroundAppearanceControls
      opacity={100}
      blur={0}
      onOpacityChange={onOpacityChange}
      onBlurChange={onBlurChange}
    />,
  )

  fireEvent.change(screen.getByRole('slider', { name: '背景图透明度' }), {
    target: { value: '55' },
  })
  fireEvent.change(screen.getByRole('slider', { name: '背景图模糊度' }), {
    target: { value: '12' },
  })

  expect(onOpacityChange).toHaveBeenCalledWith(55)
  expect(onBlurChange).toHaveBeenCalledWith(12)
})
