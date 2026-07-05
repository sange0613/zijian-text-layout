# Custom Canvas Size Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persisted 320–4096px custom canvas width and height below the existing five size presets, with identical preview and PNG export dimensions.

**Architecture:** Extend `EditorState` with custom dimensions and migrate legacy saved data. Centralize preset/custom resolution in a pure `getCanvasSize` function shared by preview and export, while `SizePresets` owns only temporary input drafts and submits complete dimensions to `EditorPanel`.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, CSS.

---

### Task 1: Persist custom canvas dimensions

**Files:**
- Modify: `src/types.ts`
- Modify: `src/state/editorState.ts`
- Test: `src/state/editorState.test.ts`

- [ ] **Step 1: Write failing migration and restoration tests**

Add tests proving legacy state receives 1080 × 1080, valid custom state restores, and oversized saved values clamp to 4096:

```ts
it('adds default custom dimensions to legacy state', () => {
  const legacy = { ...DEFAULT_EDITOR_STATE } as Record<string, unknown>
  delete legacy.customWidth
  delete legacy.customHeight
  expect(parseStoredState(JSON.stringify(legacy))).toMatchObject({
    customWidth: 1080,
    customHeight: 1080,
  })
})

it('restores and clamps custom canvas dimensions', () => {
  const saved = {
    ...DEFAULT_EDITOR_STATE,
    sizeId: 'custom',
    customWidth: 5000,
    customHeight: 720,
  }
  expect(parseStoredState(JSON.stringify(saved))).toMatchObject({
    sizeId: 'custom',
    customWidth: 4096,
    customHeight: 720,
  })
})
```

- [ ] **Step 2: Run state tests and verify RED**

Run: `npm test -- --run src/state/editorState.test.ts`

Expected: FAIL because custom fields and custom size ID are not recognized.

- [ ] **Step 3: Add fields, migration, validation, and normalization**

Add `customWidth: number` and `customHeight: number` to `EditorState`, default both to 1080, allow `sizeId === 'custom'`, migrate missing fields, accept finite saved dimensions from 1–10000, and clamp returned values to 320–4096.

- [ ] **Step 4: Run state tests and verify GREEN**

Run: `npm test -- --run src/state/editorState.test.ts`

Expected: all state tests PASS.

- [ ] **Step 5: Commit state changes**

```bash
git add src/types.ts src/state/editorState.ts src/state/editorState.test.ts
git commit -m "feat: persist custom canvas dimensions"
```

### Task 2: Centralize canvas size resolution

**Files:**
- Create: `src/canvas/getCanvasSize.ts`
- Create: `src/canvas/getCanvasSize.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/PreviewCanvas.tsx`

- [ ] **Step 1: Write the failing resolver tests**

Test a preset and custom state:

```ts
expect(getCanvasSize({ ...DEFAULT_EDITOR_STATE, sizeId: 'square' })).toMatchObject({
  label: '方图 1:1',
  width: 1080,
  height: 1080,
})
expect(
  getCanvasSize({
    ...DEFAULT_EDITOR_STATE,
    sizeId: 'custom',
    customWidth: 1600,
    customHeight: 900,
  }),
).toEqual({
  id: 'custom',
  label: '自定义',
  detail: '1600 × 900',
  width: 1600,
  height: 900,
})
```

- [ ] **Step 2: Run resolver tests and verify RED**

Run: `npm test -- --run src/canvas/getCanvasSize.test.ts`

Expected: FAIL because `getCanvasSize` does not exist.

- [ ] **Step 3: Implement and connect the resolver**

Create `getCanvasSize(state: EditorState): SizePreset`. Return a constructed custom preset when `sizeId` is `custom`; otherwise return `SIZE_BY_ID.get(state.sizeId)!`. Replace direct `SIZE_BY_ID` lookups in `App.tsx` and `PreviewCanvas.tsx` with this function.

- [ ] **Step 4: Run resolver and app tests**

Run: `npm test -- --run src/canvas/getCanvasSize.test.ts src/App.test.tsx`

Expected: all selected tests PASS.

- [ ] **Step 5: Commit resolver changes**

```bash
git add src/canvas src/App.tsx src/components/PreviewCanvas.tsx
git commit -m "refactor: centralize canvas size resolution"
```

### Task 3: Add compact custom size controls

**Files:**
- Modify: `src/components/SizePresets.tsx`
- Create: `src/components/SizePresets.test.tsx`
- Modify: `src/components/EditorPanel.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing component behavior tests**

Render `SizePresets` with 1080 × 1080, replace both draft inputs, click `应用`, and expect `onCustomSizeChange(1600, 900)`. Add a second test using 9999 and 100 to expect clamped `4096, 320`.

- [ ] **Step 2: Run component tests and verify RED**

Run: `npm test -- --run src/components/SizePresets.test.tsx`

Expected: FAIL because custom inputs and callback props do not exist.

- [ ] **Step 3: Implement the form**

Extend props with `customWidth`, `customHeight`, and `onCustomSizeChange(width, height)`. Use local string drafts initialized from props, a `<form aria-label="自定义画布大小">`, number inputs labelled `自定义宽度` and `自定义高度`, and an `应用` submit button. On submit, parse integers, fall back to current values for invalid drafts, clamp each to 320–4096, update drafts, and invoke the callback.

- [ ] **Step 4: Connect state and add application test**

In `EditorPanel`, pass state values and update all three fields at once:

```ts
onCustomSizeChange={(customWidth, customHeight) =>
  onChange({ sizeId: 'custom', customWidth, customHeight })
}
```

Add an app test that applies 1600 × 900, verifies `data-size="1600x900"` and visible meta text `自定义 · 1600 × 900`, then clicks the square preset and verifies `1080x1080`.

- [ ] **Step 5: Add compact styles**

Style `.custom-size-form` as one grid row with label, two 66px number inputs separated by ×, and a compact apply button. At narrow mobile widths keep the row within the panel without horizontal overflow.

- [ ] **Step 6: Run UI and full tests**

Run:

```bash
npm test -- --run src/components/SizePresets.test.tsx src/App.test.tsx
npm test -- --run
```

Expected: all tests PASS.

- [ ] **Step 7: Commit UI changes**

```bash
git add src/components/SizePresets.tsx src/components/SizePresets.test.tsx src/components/EditorPanel.tsx src/App.test.tsx src/styles.css
git commit -m "feat: add custom canvas size controls"
```

### Task 4: Browser and build verification

**Files:**
- Verify only; modify implementation files only if verification reveals a defect.

- [ ] **Step 1: Run both builds**

Run:

```bash
npm run build -- --mode pages
npm run build:desktop
```

Expected: both builds succeed.

- [ ] **Step 2: Verify rendered behavior**

At 1440 × 900 and 390 × 844, verify the custom row is readable, applying 1600 × 900 updates the preview and meta text, a preset switches back, no horizontal overflow appears, and console logs have no relevant warnings or errors.

- [ ] **Step 3: Rebuild local Windows executables**

Run the existing `package:win` command with the configured Electron mirror. Expected: Setup and Portable executables are regenerated and begin with the `MZ` header.

- [ ] **Step 4: Final verification**

Run full frontend tests, desktop configuration tests, `git diff --check`, and inspect working-tree status. If publishing is still desired for the web app, push `main` and monitor Pages; do not create a Windows Release.
