import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { FontSizeSlider } from './FontSizeSlider'

it('updates and displays the selected font size', () => {
  const onChange = vi.fn()
  render(
    <FontSizeSlider
      label="标题字号"
      value={64}
      min={24}
      max={160}
      onChange={onChange}
    />,
  )

  fireEvent.change(screen.getByRole('slider', { name: '标题字号' }), {
    target: { value: '88' },
  })

  expect(onChange).toHaveBeenCalledWith(88)
  expect(screen.getByRole('spinbutton', { name: '标题字号精确值' })).toHaveValue(64)
})

it('uses a finer range for small text and supports exact values up to 2000', () => {
  const onChange = vi.fn()
  const props = { label: '署名字号', min: 8, max: 2000, onChange }
  const { rerender } = render(<FontSizeSlider {...props} value={42} />)
  const slider = screen.getByRole('slider')
  const exact = screen.getByRole('spinbutton')
  expect(slider).toHaveAttribute('max', '200')
  fireEvent.change(exact, { target: { value: '43' } })
  expect(onChange).toHaveBeenLastCalledWith(43)
  fireEvent.change(exact, { target: { value: '2000' } })
  expect(onChange).toHaveBeenLastCalledWith(2000)
  rerender(<FontSizeSlider {...props} value={2000} />)
  fireEvent.blur(exact)
  expect(slider).toHaveAttribute('max', '2000')
  expect(exact).toHaveValue(2000)
})
