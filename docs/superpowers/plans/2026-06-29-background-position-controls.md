# Background Position Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add compact horizontal and vertical focal-position sliders for uploaded background images.

**Architecture:** Store `positionX` and `positionY` with the existing session-only `BackgroundImageValue`, default each newly uploaded image to 50, and update the whole image value through the existing callback. A focused control component emits integer positions, while the preview maps them directly to CSS `object-position` so PNG export reuses the same rendering.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Testing Library.

---

### Task 1: Add position data to prepared background images

**Files:**
- Modify: `src/types.ts`
- Modify: `src/background/prepareBackgroundImage.ts`
- Test: `src/background/prepareBackgroundImage.test.ts`
- Modify: `src/hooks/useSessionBackgroundImage.test.tsx`

- [ ] **Step 1: Write the failing default-position assertion**

Change the valid-image expectation to:

```ts
await expect(prepareBackgroundImage(file, deps)).resolves.toEqual({
  url: 'blob:poster',
  name: '海报.jpg',
  positionX: 50,
  positionY: 50,
})
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `npm test -- --run src/background/prepareBackgroundImage.test.ts`

Expected: FAIL because prepared images do not contain position values.

- [ ] **Step 3: Extend the value and default new uploads**

Extend `BackgroundImageValue`:

```ts
export type BackgroundImageValue = {
  url: string
  name: string
  positionX: number
  positionY: number
}
```

Return `positionX: 50` and `positionY: 50` after image decoding. Update hook test fixtures to include both fields while preserving the URL-revocation assertions.

- [ ] **Step 4: Run background preparation and hook tests**

Run: `npm test -- --run src/background/prepareBackgroundImage.test.ts src/hooks/useSessionBackgroundImage.test.tsx`

Expected: all selected tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/background/prepareBackgroundImage.ts src/background/prepareBackgroundImage.test.ts src/hooks/useSessionBackgroundImage.test.tsx
git commit -m "feat: track background image position"
```

### Task 2: Build the compact two-axis controls

**Files:**
- Create: `src/components/BackgroundPositionControls.tsx`
- Create: `src/components/BackgroundPositionControls.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write the failing component test**

Create a test that renders positions 50/50, changes each range, and expects complete coordinates:

```tsx
it('updates horizontal and vertical background positions', () => {
  const onChange = vi.fn()
  render(
    <BackgroundPositionControls positionX={50} positionY={50} onChange={onChange} />,
  )

  fireEvent.change(screen.getByRole('slider', { name: '背景图左右位置' }), {
    target: { value: '25' },
  })
  fireEvent.change(screen.getByRole('slider', { name: '背景图上下位置' }), {
    target: { value: '80' },
  })

  expect(onChange).toHaveBeenNthCalledWith(1, 25, 50)
  expect(onChange).toHaveBeenNthCalledWith(2, 50, 80)
})
```

- [ ] **Step 2: Run the component test and verify RED**

Run: `npm test -- --run src/components/BackgroundPositionControls.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the component**

Create a semantic group labelled `图片位置` with two 0–100 range inputs. Each control displays `左右` or `上下`, an accessible label, and a percentage output. Emit the changed axis together with the unchanged current axis.

- [ ] **Step 4: Add compact responsive styles**

Render both sliders in one two-column row using `.background-position-controls`; each slider uses a compact label/track/output grid. Keep the same two-column layout at 360px and mobile widths, with no horizontal overflow.

- [ ] **Step 5: Run the component test and verify GREEN**

Run: `npm test -- --run src/components/BackgroundPositionControls.test.tsx`

Expected: the component test PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/BackgroundPositionControls.tsx src/components/BackgroundPositionControls.test.tsx src/styles.css
git commit -m "feat: add background position controls"
```

### Task 3: Connect position controls to preview and app behavior

**Files:**
- Modify: `src/components/EditorPanel.tsx`
- Modify: `src/components/PreviewCanvas.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Update the upload mock and write the failing app test**

Return `positionX: 50, positionY: 50` from the existing upload mock, then add a test that uploads, changes both controls, and verifies:

```ts
fireEvent.change(screen.getByRole('slider', { name: '背景图左右位置' }), {
  target: { value: '20' },
})
fireEvent.change(screen.getByRole('slider', { name: '背景图上下位置' }), {
  target: { value: '75' },
})

expect(screen.getByTestId('preview-background-image')).toHaveStyle({
  objectPosition: '20% 75%',
})
```

Also assert that the two position sliders disappear after removing the image.

- [ ] **Step 2: Run the app test and verify RED**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because the position sliders are absent.

- [ ] **Step 3: Wire the controls and preview**

Render `BackgroundPositionControls` inside the background section only when `backgroundImage` exists. Its callback calls:

```ts
onBackgroundImageChange({ ...backgroundImage, positionX, positionY })
```

Set the preview image style to:

```ts
objectPosition: `${backgroundImage.positionX}% ${backgroundImage.positionY}%`,
```

- [ ] **Step 4: Run app and full tests**

Run: `npm test -- --run src/App.test.tsx && npm test -- --run`

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/EditorPanel.tsx src/components/PreviewCanvas.tsx src/App.test.tsx
git commit -m "feat: position uploaded backgrounds"
```

### Task 4: Browser QA and deployment

**Files:**
- Verify only; modify implementation files only if QA exposes a defect.

- [ ] **Step 1: Build for Pages**

Run: `npm run build -- --mode pages`

Expected: TypeScript and Vite build successfully.

- [ ] **Step 2: Browser-check desktop and mobile**

Verify upload reveals two position sliders, both update the preview, the background remains `cover`, the desktop panel stays compact, mobile has no horizontal overflow, and console logs contain no relevant errors.

- [ ] **Step 3: Verify both export paths**

Trigger PNG export once without a background and once after uploading a generated test image. Both must leave the exporting state without showing `生成失败，请重试`; the background export must start a PNG download.

- [ ] **Step 4: Push and monitor Pages**

```bash
git push origin main
gh run watch --exit-status
```

Expected: the Pages workflow completes successfully.

- [ ] **Step 5: Verify public deployment**

Open `https://sange0613.github.io/zijian-text-layout/`, confirm the new controls are present after upload, position changes render, and background-image export succeeds.
