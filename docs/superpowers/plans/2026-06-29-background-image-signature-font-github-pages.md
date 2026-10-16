# Background Image, Signature Font, and GitHub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add session-only automatically cropped background images, an independent signature font with local Huiwen Mincho support, and publish the verified app to GitHub Pages.

**Architecture:** Persist only `signatureFontId` in `EditorState`; keep uploaded image object URLs in a focused session hook so large files never enter local storage. A background-image utility validates size/type and decodes before state replacement, while `PreviewCanvas` renders the decoded image beneath text with CSS `cover`. GitHub Actions builds with a Pages-specific Vite mode and deploys `dist` from public repository `sange1022/zijian-text-layout`.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Testing Library, Vite 7, GitHub Actions, GitHub Pages

---

## File map

- Modify `src/types.ts`: persist `signatureFontId` and define the session background-image value.
- Modify `src/data/presets.ts`: add Huiwen Mincho to the shared font list.
- Modify `src/fonts.css`: load Huiwen Mincho only from locally installed font names.
- Modify `src/state/editorState.ts`: default and migrate the independent signature font.
- Modify `src/state/editorState.test.ts`: cover the fourth font and legacy migration.
- Create `src/background/prepareBackgroundImage.ts`: validate, decode, and return safe object URLs.
- Create `src/background/prepareBackgroundImage.test.ts`: cover valid, oversized, invalid, and decode-failure files.
- Create `src/hooks/useSessionBackgroundImage.ts`: own replacement/removal/unmount URL revocation.
- Create `src/hooks/useSessionBackgroundImage.test.tsx`: verify URL lifetime.
- Create `src/components/BackgroundImageField.tsx`: accessible upload/remove/error UI.
- Create `src/components/BackgroundImageField.test.tsx`: cover successful selection, errors, and removal.
- Modify `src/components/EditorPanel.tsx`: add signature font and background-image controls.
- Modify `src/components/PreviewCanvas.tsx`: render the image below text and use the independent signature font.
- Modify `src/App.tsx`: connect the session image hook to editor and preview.
- Modify `src/App.test.tsx`: verify font independence, fixed positions, image layer, and removal.
- Modify `src/styles.css`: compact three-column signature row, header-level image action, and cover layer.
- Modify `vite.config.ts`: add the Pages-only repository base path.
- Create `.github/workflows/deploy-pages.yml`: test, build, upload, and deploy on `main`.

### Task 1: Add Huiwen Mincho and persist the independent signature font

**Files:**
- Modify: `src/types.ts`
- Modify: `src/data/presets.ts`
- Modify: `src/fonts.css`
- Modify: `src/state/editorState.ts`
- Test: `src/state/editorState.test.ts`

- [ ] **Step 1: Write failing preset and migration tests**

Update the approved-font assertion and add legacy/current signature-font cases:

```ts
expect(FONT_PRESETS.map((font) => font.label)).toEqual([
  '思源宋体',
  '思源黑体',
  '得意黑',
  '汇文明朝体',
])

it('uses the saved body font when migrating a legacy signature font', () => {
  const legacy = { ...DEFAULT_EDITOR_STATE } as Record<string, unknown>
  delete legacy.signatureFontId

  expect(parseStoredState(JSON.stringify(legacy))).toEqual({
    ...legacy,
    signatureFontId: DEFAULT_EDITOR_STATE.bodyStyle.fontId,
  })
})

it('restores an independent signature font', () => {
  const saved = { ...DEFAULT_EDITOR_STATE, signatureFontId: 'huiwen-mincho' }
  expect(parseStoredState(JSON.stringify(saved))).toEqual(saved)
})
```

- [ ] **Step 2: Run the state test and verify failure**

Run: `npm test -- --run src/state/editorState.test.ts`

Expected: FAIL because only three fonts exist and `signatureFontId` is not modeled.

- [ ] **Step 3: Implement the font preset, state, validation, and migration**

Add to `EditorState`:

```ts
signatureFontId: string
```

Add this fourth entry to `FONT_PRESETS`:

```ts
{
  id: 'huiwen-mincho',
  label: '汇文明朝体',
  family: 'Huiwen Mincho',
  fallback: 'Songti SC, STSong, serif',
  usage: '复古 · 海报',
},
```

Add a local-only face to `src/fonts.css`:

```css
@font-face {
  font-family: 'Huiwen Mincho';
  src: local('Huiwen-mincho'), local('汇文明朝体');
  font-display: swap;
  font-style: normal;
  font-weight: 400;
}
```

Set `DEFAULT_EDITOR_STATE.signatureFontId` to `'source-sans'`. In `isEditorState`, require a string present in `FONT_BY_ID`. In `parseStoredState`, add the field before validation when absent:

```ts
...(!('signatureFontId' in value) &&
  'bodyStyle' in value &&
  value.bodyStyle &&
  typeof value.bodyStyle === 'object' &&
  'fontId' in value.bodyStyle &&
  typeof value.bodyStyle.fontId === 'string'
  ? { signatureFontId: value.bodyStyle.fontId }
  : {}),
```

- [ ] **Step 4: Run state tests and build**

Run: `npm test -- --run src/state/editorState.test.ts && npm run build`

Expected: all state tests PASS and TypeScript build exits 0.

- [ ] **Step 5: Commit the font state**

```bash
git add src/types.ts src/data/presets.ts src/fonts.css src/state/editorState.ts src/state/editorState.test.ts
git commit -m "feat: add independent signature font"
```

### Task 2: Validate and decode uploaded background images

**Files:**
- Create: `src/background/prepareBackgroundImage.ts`
- Create: `src/background/prepareBackgroundImage.test.ts`
- Modify: `src/types.ts`

- [ ] **Step 1: Write failing utility tests**

Create tests with injected browser boundaries:

```ts
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
    })
    expect(deps.decode).toHaveBeenCalledWith('blob:poster')
  })

  it('rejects files over 20MB before creating a URL', async () => {
    const deps = dependencies()
    const file = new File(['x'], 'large.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: MAX_BACKGROUND_IMAGE_BYTES + 1 })

    await expect(prepareBackgroundImage(file, deps)).rejects.toThrow('图片过大，请选择 20MB 以内的图片')
    expect(deps.createObjectURL).not.toHaveBeenCalled()
  })

  it('rejects non-images', async () => {
    const deps = dependencies()
    const file = new File(['text'], 'notes.txt', { type: 'text/plain' })

    await expect(prepareBackgroundImage(file, deps)).rejects.toThrow('图片无法读取，请更换文件')
  })

  it('revokes the new URL when decoding fails', async () => {
    const deps = dependencies()
    deps.decode.mockRejectedValue(new Error('decode failed'))
    const file = new File(['broken'], 'broken.png', { type: 'image/png' })

    await expect(prepareBackgroundImage(file, deps)).rejects.toThrow('图片无法读取，请更换文件')
    expect(deps.revokeObjectURL).toHaveBeenCalledWith('blob:poster')
  })
})
```

- [ ] **Step 2: Run the utility test and verify failure**

Run: `npm test -- --run src/background/prepareBackgroundImage.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the utility and shared type**

Add to `src/types.ts`:

```ts
export type BackgroundImageValue = {
  url: string
  name: string
}
```

Create `prepareBackgroundImage.ts` with a 20MB constant, image MIME validation, object URL creation, decode-before-return, and revocation on decode failure. Use this default decoder:

```ts
function decodeImage(url: string) {
  const image = new Image()
  image.src = url
  return image.decode()
}
```

The exported function accepts optional dependencies matching the test object and throws exactly the two Chinese error messages asserted above.

- [ ] **Step 4: Run the utility tests**

Run: `npm test -- --run src/background/prepareBackgroundImage.test.ts`

Expected: four tests PASS.

- [ ] **Step 5: Commit upload validation**

```bash
git add src/types.ts src/background/prepareBackgroundImage.ts src/background/prepareBackgroundImage.test.ts
git commit -m "feat: validate background image uploads"
```

### Task 3: Own background-image object URLs for one session

**Files:**
- Create: `src/hooks/useSessionBackgroundImage.ts`
- Create: `src/hooks/useSessionBackgroundImage.test.tsx`

- [ ] **Step 1: Write the failing hook test**

```tsx
import { act, renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { useSessionBackgroundImage } from './useSessionBackgroundImage'

it('revokes replaced, removed, and unmounted object URLs', () => {
  const revokeObjectURL = vi.fn()
  const { result, unmount } = renderHook(() => useSessionBackgroundImage(revokeObjectURL))

  act(() => result.current.setBackgroundImage({ url: 'blob:first', name: 'first.jpg' }))
  act(() => result.current.setBackgroundImage({ url: 'blob:second', name: 'second.jpg' }))
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:first')

  act(() => result.current.setBackgroundImage(null))
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:second')

  act(() => result.current.setBackgroundImage({ url: 'blob:third', name: 'third.jpg' }))
  unmount()
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:third')
})
```

- [ ] **Step 2: Run the hook test and verify failure**

Run: `npm test -- --run src/hooks/useSessionBackgroundImage.test.tsx`

Expected: FAIL because the hook does not exist.

- [ ] **Step 3: Implement the hook**

Use `useRef`, `useState`, `useCallback`, and a mount-only cleanup effect. The setter must revoke the previous URL only when it differs from the new URL, update the ref, and then update state. Default the injected revoker to `URL.revokeObjectURL`.

Return this exact shape:

```ts
return { backgroundImage, setBackgroundImage }
```

- [ ] **Step 4: Run the hook test**

Run: `npm test -- --run src/hooks/useSessionBackgroundImage.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit URL ownership**

```bash
git add src/hooks/useSessionBackgroundImage.ts src/hooks/useSessionBackgroundImage.test.tsx
git commit -m "feat: manage session background images"
```

### Task 4: Add upload controls and preview layering

**Files:**
- Create: `src/components/BackgroundImageField.tsx`
- Create: `src/components/BackgroundImageField.test.tsx`
- Modify: `src/components/EditorPanel.tsx`
- Modify: `src/components/PreviewCanvas.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing component and app tests**

The component test injects a preparer, selects a file, checks the callback, then removes it:

```tsx
const prepare = vi.fn().mockResolvedValue({ url: 'blob:poster', name: 'poster.jpg' })
const onChange = vi.fn()
const { rerender } = render(
  <BackgroundImageField value={null} onChange={onChange} prepare={prepare} />,
)
const file = new File(['image'], 'poster.jpg', { type: 'image/jpeg' })
await user.upload(screen.getByLabelText('上传背景图'), file)
expect(onChange).toHaveBeenCalledWith({ url: 'blob:poster', name: 'poster.jpg' })

rerender(
  <BackgroundImageField
    value={{ url: 'blob:poster', name: 'poster.jpg' }}
    onChange={onChange}
    prepare={prepare}
  />,
)
await user.click(screen.getByRole('button', { name: '移除背景图' }))
expect(onChange).toHaveBeenLastCalledWith(null)
```

Add app tests that assert:

```tsx
await user.selectOptions(screen.getByLabelText('署名字体'), 'huiwen-mincho')
await user.selectOptions(screen.getByLabelText('正文字体'), 'source-serif')
expect(screen.getByTestId('preview-signature').getAttribute('style')).toContain('Huiwen Mincho')

expect(screen.getByTestId('preview-background-image')).toHaveAttribute('src', 'blob:poster')
expect(screen.getByTestId('preview-background-image')).toHaveClass('preview-background-image')
```

Keep the existing six-position table and, after entering a multi-line body, assert the selected signature still has the same top/bottom and alignment style.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm test -- --run src/components/BackgroundImageField.test.tsx src/App.test.tsx`

Expected: FAIL because the new component, signature selector, and image layer do not exist.

- [ ] **Step 3: Implement the upload component and data flow**

`BackgroundImageField` renders a visually compact file label, hidden `input type="file" accept="image/*"`, truncated filename, remove button, and `role="alert"` error. It calls `prepareBackgroundImage` by default and keeps the current value when preparation rejects.

`App` calls `useSessionBackgroundImage()` and passes `{ backgroundImage, onBackgroundImageChange: setBackgroundImage }` to `EditorPanel`, plus `backgroundImage` to `PreviewCanvas`.

`EditorPanel` adds a signature font `<select aria-label="署名字体">` using `FONT_PRESETS`, updates `signatureFontId`, and renders `BackgroundImageField` in the background section header.

`PreviewCanvas` resolves:

```ts
const signatureFont = FONT_BY_ID.get(state.signatureFontId)!
```

It renders this as the first child of `.preview-canvas` when an image exists:

```tsx
<img
  className="preview-background-image"
  data-testid="preview-background-image"
  src={backgroundImage.url}
  alt=""
  aria-hidden="true"
/>
```

The signature uses `signatureFont.family` and `signatureFont.fallback`, while its position, color, weight, and size rules remain unchanged.

- [ ] **Step 4: Add compact and cover CSS**

Use a three-column desktop signature row for text, font, and position. Keep the image action in a flex section heading. Add:

```css
.preview-background-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.preview-content,
.preview-signature { z-index: 1; }
```

At `max-width: 560px`, return the signature controls to one column. Errors may add temporary height; the normal desktop state must remain one page at 900px.

- [ ] **Step 5: Run focused and complete tests**

Run: `npm test -- --run src/components/BackgroundImageField.test.tsx src/App.test.tsx`

Expected: focused tests PASS.

Run: `npm test -- --run`

Expected: full suite PASS.

- [ ] **Step 6: Commit the UI feature**

```bash
git add src/components/BackgroundImageField.tsx src/components/BackgroundImageField.test.tsx src/components/EditorPanel.tsx src/components/PreviewCanvas.tsx src/App.tsx src/App.test.tsx src/styles.css
git commit -m "feat: add cropped poster backgrounds"
```

### Task 5: Configure a verified GitHub Pages build

**Files:**
- Modify: `vite.config.ts`
- Create: `.github/workflows/deploy-pages.yml`

- [ ] **Step 1: Add Pages mode to Vite**

Change the config export to receive `mode` and set:

```ts
base: mode === 'pages' ? '/zijian-text-layout/' : '/',
```

Keep the existing React plugin and Vitest configuration unchanged.

- [ ] **Step 2: Create the deployment workflow**

Create `.github/workflows/deploy-pages.yml` with push/manual triggers, `contents: read`, `pages: write`, and `id-token: write`. Use the current official actions pinned by immutable commit SHA:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7
      - name: Set up Node
        uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6
        with:
          node-version: lts/*
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Test
        run: npm test -- --run
      - name: Build
        run: npm run build -- --mode pages
      - name: Configure Pages
        uses: actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d # v6
      - name: Upload artifact
        uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5
        with:
          path: ./dist
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128 # v5
```

- [ ] **Step 3: Verify the Pages artifact locally**

Run: `npm run build -- --mode pages`

Expected: build exits 0.

Run: `rg -n '/zijian-text-layout/' dist/index.html dist/assets/*.css`

Expected: built script/style URLs and the Smiley Sans public font URL include `/zijian-text-layout/`.

- [ ] **Step 4: Commit deployment configuration**

```bash
git add vite.config.ts .github/workflows/deploy-pages.yml
git commit -m "ci: deploy app to GitHub Pages"
```

### Task 6: Browser QA before publication

**Files:**
- Verify: rendered app only

- [ ] **Step 1: Verify desktop behavior at 1440×900**

Use the in-app Browser at `http://127.0.0.1:5173/`. Confirm page identity, meaningful DOM, no error overlay, and no console errors. Check `editor-panel.scrollHeight === editor-panel.clientHeight` in the normal state.

- [ ] **Step 2: Exercise the complete target flow**

Upload a generated local test image under 20MB, verify `preview-background-image` is visible with computed `object-fit: cover`, switch from 3:4 to 1:1 and 16:9, and confirm the same image remains. Enter a multi-line body, choose each signature position, choose Huiwen Mincho for the signature, change the body font, and confirm the signature font and anchor remain unchanged. Remove the image and confirm the background color is visible.

- [ ] **Step 3: Verify mobile behavior at 390×844**

Confirm no horizontal overflow, upload/remove controls remain usable, and preview remains below the editor. Capture desktop and mobile screenshots outside the repository.

- [ ] **Step 4: Restore test state**

Clear the test signature and background image, select the default bottom-left position, and reset the browser viewport override.

### Task 7: Publish and verify GitHub Pages

**Files:**
- External: GitHub repository `sange1022/zijian-text-layout`

- [ ] **Step 1: Run final local verification**

Run: `npm test -- --run && npm run build -- --mode pages && git diff --check && git status --short`

Expected: all tests PASS, build exits 0, no whitespace errors, and the worktree is clean.

- [ ] **Step 2: Create or safely reuse the public repository**

Run: `gh repo view sange1022/zijian-text-layout --json nameWithOwner,visibility,defaultBranchRef`

If it does not exist, run:

```bash
gh repo create sange1022/zijian-text-layout --public --description "简洁的中文文字排版与海报图片生成工具"
git remote add origin https://github.com/sange0613/zijian-text-layout.git
```

If it already exists and is owned by `sange1022`, add or update `origin` to the same HTTPS URL without deleting remote content.

Before pushing to an existing repository, inspect its default-branch history. If it contains unrelated commits, stop instead of force-pushing or overwriting them.

- [ ] **Step 3: Push main and enable Actions-based Pages**

Run: `git push -u origin main`

Then run:

```bash
gh api --method POST repos/sange1022/zijian-text-layout/pages \
  -f build_type=workflow
```

If Pages already exists, use:

```bash
gh api --method PUT repos/sange1022/zijian-text-layout/pages \
  -f build_type=workflow
```

- [ ] **Step 4: Monitor the deployment**

Run: `gh run list --repo sange1022/zijian-text-layout --workflow deploy-pages.yml --limit 1`

Obtain the newest run ID, then run:

```bash
gh run watch RUN_ID --repo sange1022/zijian-text-layout --exit-status
```

Expected: workflow concludes `success`.

- [ ] **Step 5: Verify the public link**

Open `https://sange0613.github.io/zijian-text-layout/` in the in-app Browser. Confirm HTTP page identity, meaningful DOM, no framework overlay, no console errors, background upload/remove, signature font menu, six positions, and PNG button availability. Capture one public-site screenshot.

- [ ] **Step 6: Report the usable URL**

Return the repository URL and Pages URL, test/build counts, Browser QA result, and the expected Huiwen fallback behavior on devices without the local font.
