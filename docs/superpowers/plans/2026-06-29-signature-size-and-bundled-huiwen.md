# Signature Size and Bundled Huiwen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an independent 12–64 px signature-size slider and make Huiwen Mincho render consistently on deployed GitHub Pages by bundling the authorized font as WOFF2.

**Architecture:** Extend the persisted `EditorState` with one numeric `signatureFontSize` field, migrate legacy saved state from the old body-relative formula, and feed the value directly into the existing slider and preview components. Convert the installed Huiwen OTF into a full-glyph WOFF2 asset and add it as the final source after local font lookups in the existing `@font-face` rule.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, CSS, fontTools/Brotli conversion, GitHub Pages.

---

## File map

- Modify `src/types.ts`: add the persisted signature size field.
- Modify `src/state/editorState.ts`: default, validation, legacy migration, and clamping.
- Modify `src/state/editorState.test.ts`: persistence and migration coverage.
- Modify `src/components/EditorPanel.tsx`: render the reusable signature-size slider.
- Modify `src/components/PreviewCanvas.tsx`: render the selected size without deriving it from body size.
- Modify `src/App.test.tsx`: cover independent slider behavior in the complete app.
- Modify `src/styles.css`: keep the added control compact at desktop and mobile sizes.
- Modify `src/fonts.css`: load the bundled Huiwen resource after local sources.
- Create `public/fonts/huiwen-mincho.woff2`: full-glyph web font converted from the user-authorized installed OTF.

### Task 1: Persist and migrate independent signature size

**Files:**
- Modify: `src/types.ts`
- Modify: `src/state/editorState.ts`
- Test: `src/state/editorState.test.ts`

- [ ] **Step 1: Write failing persistence and migration tests**

Add tests that prove the default/current value is restored, old data derives the same visual size it used before, and out-of-range values are clamped:

```ts
it('migrates a legacy signature size from the saved body size', () => {
  const legacy = { ...DEFAULT_EDITOR_STATE } as Record<string, unknown>
  delete legacy.signatureFontSize
  legacy.bodyStyle = { ...DEFAULT_EDITOR_STATE.bodyStyle, fontSize: 40 }

  expect(parseStoredState(JSON.stringify(legacy))).toMatchObject({
    signatureFontSize: 29,
  })
})

it('restores an independent signature size', () => {
  const saved = { ...DEFAULT_EDITOR_STATE, signatureFontSize: 36 }
  expect(parseStoredState(JSON.stringify(saved))).toEqual(saved)
})

it('clamps a saved signature size to the slider range', () => {
  const saved = { ...DEFAULT_EDITOR_STATE, signatureFontSize: 90 }
  expect(parseStoredState(JSON.stringify(saved))).toMatchObject({ signatureFontSize: 64 })
})
```

- [ ] **Step 2: Run the targeted tests and verify RED**

Run: `npm test -- --run src/state/editorState.test.ts`

Expected: FAIL because `signatureFontSize` is not part of the state and no migration is performed.

- [ ] **Step 3: Add the type, default, validation, and migration**

Add `signatureFontSize: number` to `EditorState`, set its default to `20`, validate that it is finite and within the broad saved-state numeric bounds, and migrate missing values before `isEditorState` runs:

```ts
const legacyBodyFontSize =
  'bodyStyle' in value &&
  value.bodyStyle &&
  typeof value.bodyStyle === 'object' &&
  'fontSize' in value.bodyStyle &&
  typeof value.bodyStyle.fontSize === 'number' &&
  Number.isFinite(value.bodyStyle.fontSize)
    ? clamp(value.bodyStyle.fontSize, 12, 80)
    : DEFAULT_EDITOR_STATE.bodyStyle.fontSize

...(!('signatureFontSize' in value)
  ? { signatureFontSize: Math.round(Math.max(14, legacyBodyFontSize * 0.72)) }
  : {}),
```

After validation, normalize the returned value with `clamp(candidate.signatureFontSize, 12, 64)`.

- [ ] **Step 4: Run the targeted tests and verify GREEN**

Run: `npm test -- --run src/state/editorState.test.ts`

Expected: all state tests PASS.

- [ ] **Step 5: Commit the state slice**

```bash
git add src/types.ts src/state/editorState.ts src/state/editorState.test.ts
git commit -m "feat: persist independent signature size"
```

### Task 2: Add the signature size slider and independent preview rendering

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/components/EditorPanel.tsx`
- Modify: `src/components/PreviewCanvas.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write a failing app behavior test**

Add a test that changes both sliders and proves the signature retains its own value:

```ts
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
```

- [ ] **Step 2: Run the app test and verify RED**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because the accessible `署名字号` slider does not exist.

- [ ] **Step 3: Add the slider and use the independent value**

Import `FontSizeSlider` in `EditorPanel.tsx` and place it directly below `.signature-row`:

```tsx
<FontSizeSlider
  label="署名字号"
  value={state.signatureFontSize}
  min={12}
  max={64}
  onChange={(signatureFontSize) => onChange({ signatureFontSize })}
/>
```

Replace the body-relative preview formula with:

```ts
fontSize: state.signatureFontSize,
```

- [ ] **Step 4: Compact the content section without hiding controls**

Add a `signature-size-slider` wrapper/class only if needed for spacing, reduce the正文 textarea from three rows to two, and keep the existing mobile breakpoints. At desktop width, the panel must fit without vertical scrolling at a 1440×900 viewport; at narrow width the slider must remain full-width and readable.

- [ ] **Step 5: Run the app and component tests and verify GREEN**

Run: `npm test -- --run src/App.test.tsx src/components/FontSizeSlider.test.tsx`

Expected: all selected tests PASS.

- [ ] **Step 6: Commit the UI slice**

```bash
git add src/App.test.tsx src/components/EditorPanel.tsx src/components/PreviewCanvas.tsx src/styles.css
git commit -m "feat: add signature size slider"
```

### Task 3: Bundle Huiwen Mincho for deployed browsers

**Files:**
- Create: `public/fonts/huiwen-mincho.woff2`
- Modify: `src/fonts.css`

- [ ] **Step 1: Install conversion tooling outside the repository**

Run:

```bash
python3 -m pip install --target /tmp/zijian-fonttools fonttools brotli
```

Expected: fontTools and Brotli install successfully under `/tmp`; no project dependency changes.

- [ ] **Step 2: Convert the authorized OTF without glyph subsetting**

Run:

```bash
PYTHONPATH=/tmp/zijian-fonttools python3 -m fontTools.subset \
  "$HOME/Library/Fonts/中文 - Huiwen.otf" \
  --output-file=public/fonts/huiwen-mincho.woff2 \
  --flavor=woff2 \
  --glyphs='*' \
  --layout-features='*' \
  --no-subset-tables+=DSIG
```

Expected: `public/fonts/huiwen-mincho.woff2` is created and is smaller than the 23MB OTF while retaining all original glyphs.

- [ ] **Step 3: Add the deployed resource to the existing font face**

Change `src/fonts.css` to keep local lookup first and use the site resource everywhere else:

```css
@font-face {
  font-family: 'Huiwen Mincho';
  src:
    local('Huiwen-mincho'),
    local('汇文明朝体'),
    url('/fonts/huiwen-mincho.woff2') format('woff2');
  font-display: swap;
  font-style: normal;
  font-weight: 400;
}
```

- [ ] **Step 4: Verify the font file and Pages build URL**

Run:

```bash
PYTHONPATH=/tmp/zijian-fonttools python3 -c "from fontTools.ttLib import TTFont; f=TTFont('public/fonts/huiwen-mincho.woff2'); print(f['name'].getDebugName(1), len(f.getBestCmap()))"
npm run build -- --mode pages
rg "huiwen-mincho.woff2" dist/assets/*.css
test -s dist/fonts/huiwen-mincho.woff2
```

Expected: the metadata prints `Huiwen-mincho` with a non-zero CMap count, built CSS contains `/zijian-text-layout/fonts/huiwen-mincho.woff2`, and the built font exists.

- [ ] **Step 5: Commit the web font slice**

```bash
git add public/fonts/huiwen-mincho.woff2 src/fonts.css
git commit -m "fix: bundle Huiwen font for web"
```

### Task 4: Full verification, browser QA, and deployment

**Files:**
- Verify only; modify implementation files only if a test or visual check exposes a defect.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test -- --run`

Expected: all tests PASS with no unhandled errors.

- [ ] **Step 2: Run the production Pages build**

Run: `npm run build -- --mode pages`

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 3: Verify in the in-app browser**

Start the local Vite server, then use the in-app browser to verify at 1440×900 and a mobile width:

- the left panel is compact and all controls are reachable;
- `署名字号` displays 20 px initially and moves from 12 to 64;
- changing正文 size does not change the signature size;
- selecting汇文明朝体 changes title/body/signature rendering;
- the browser requests the WOFF2 successfully when the local font is unavailable or the built asset URL responds with HTTP 200.

- [ ] **Step 4: Commit any QA-only adjustments**

If QA required changes, run:

```bash
git add src
git commit -m "fix: refine signature controls"
```

Otherwise, make no empty commit.

- [ ] **Step 5: Push and monitor deployment**

Run:

```bash
git push origin main
gh run list --workflow deploy.yml --limit 1
gh run watch --exit-status
```

Expected: push succeeds and the Pages deployment workflow completes successfully.

- [ ] **Step 6: Verify the public site**

Open `https://sange0613.github.io/zijian-text-layout/`, confirm the new slider behavior, and confirm `https://sange0613.github.io/zijian-text-layout/fonts/huiwen-mincho.woff2` returns HTTP 200.
