# Windows Desktop App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package the existing text-layout tool as Windows 10/11 x64 installer and portable executables and publish them in a GitHub Release.

**Architecture:** Reuse the existing React/Vite frontend unchanged inside a hardened Electron `BrowserWindow`. Add a desktop Vite mode with relative assets, electron-builder targets for NSIS and portable executables, and a Windows GitHub Actions workflow that produces release artifacts on a native Windows runner.

**Tech Stack:** React 19, Vite 7, Electron 43.0.0, electron-builder 26.15.3, Node test runner, GitHub Actions.

---

## File map

- Create `electron/main.cjs`: Electron application lifecycle and local frontend loading.
- Create `electron/window-options.cjs`: focused, testable window/security configuration.
- Create `electron/desktop-config.node.cjs`: package, window, and workflow contract tests kept outside Vitest's file glob.
- Modify `vite.config.ts`: relative asset base for desktop mode.
- Modify `package.json` and `package-lock.json`: desktop entry, scripts, dependencies, version, and builder targets.
- Create `.github/workflows/build-windows.yml`: native Windows build and artifact upload.
- Modify `.gitignore`: exclude local Electron release output.

### Task 1: Define the desktop packaging contract with a failing test

**Files:**
- Create: `electron/desktop-config.node.cjs`

- [ ] **Step 1: Write the failing configuration test**

Use `node:test`, `node:assert/strict`, `fs`, and `path` to read project files without importing Electron. Assert:

```js
assert.equal(packageJson.version, '0.2.0')
assert.equal(packageJson.main, 'electron/main.cjs')
assert.equal(packageJson.scripts['build:desktop'], 'tsc -b && vite build --mode desktop')
assert.equal(
  packageJson.scripts['package:win'],
  'npm run build:desktop && electron-builder --win nsis portable --x64 --publish never',
)
assert.equal(packageJson.build.appId, 'com.zijian.textlayout')
assert.deepEqual(packageJson.build.win.target, ['nsis', 'portable'])
assert.match(packageJson.build.nsis.artifactName, /Setup/)
assert.match(packageJson.build.portable.artifactName, /Portable/)
assert.equal(existsSync(path.join(root, 'electron/main.cjs')), true)
assert.equal(existsSync(path.join(root, '.github/workflows/build-windows.yml')), true)
```

Read `electron/window-options.cjs` as text only after confirming it exists, and assert it contains `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test electron/desktop-config.node.cjs`

Expected: FAIL because the project is still version 0.1.0 and has no Electron entry or Windows workflow.

- [ ] **Step 3: Commit the failing test**

```bash
git add electron/desktop-config.node.cjs
git commit -m "test: define Windows desktop packaging contract"
```

### Task 2: Add the hardened Electron shell and desktop build mode

**Files:**
- Create: `electron/window-options.cjs`
- Create: `electron/main.cjs`
- Modify: `vite.config.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install pinned desktop development dependencies**

Run:

```bash
npm install --save-dev electron@43.0.0 electron-builder@26.15.3
```

Expected: `package.json` and lockfile contain the pinned versions and npm reports no install failure.

- [ ] **Step 2: Add window configuration**

Create `electron/window-options.cjs` exporting:

```js
module.exports = {
  WINDOW_OPTIONS: {
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 680,
    show: false,
    backgroundColor: '#ffffff',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  },
}
```

- [ ] **Step 3: Add the Electron lifecycle**

Create `electron/main.cjs` that creates one window from `WINDOW_OPTIONS`, calls `loadFile(path.join(__dirname, '../dist/index.html'))`, shows on `ready-to-show`, denies new in-app windows, opens valid `http:`/`https:` targets with `shell.openExternal`, recreates a window on `activate`, and quits on `window-all-closed` for non-macOS platforms.

- [ ] **Step 4: Add desktop build mode**

Change Vite base selection to:

```ts
base:
  mode === 'pages'
    ? '/zijian-text-layout/'
    : mode === 'desktop'
      ? './'
      : '/',
```

Set package version `0.2.0`, `main: electron/main.cjs`, and scripts:

```json
"build:desktop": "tsc -b && vite build --mode desktop",
"package:win": "npm run build:desktop && electron-builder --win nsis portable --x64 --publish never",
"test:desktop": "node --test electron/desktop-config.node.cjs"
```

Add electron-builder configuration with output `release`, files `dist/**/*`, `electron/**/*`, and `package.json`, Windows targets `nsis` and `portable`, NSIS artifact `zijian-text-layout-Setup-${version}-${arch}.${ext}`, and portable artifact `zijian-text-layout-Portable-${version}-${arch}.${ext}`.

- [ ] **Step 5: Ignore local packaging output**

Add `release/` to `.gitignore`.

- [ ] **Step 6: Build desktop assets and inspect relative URLs**

Run:

```bash
npm run build:desktop
rg '(src|href)="\./assets/' dist/index.html
```

Expected: build succeeds and both built CSS and JS references begin with `./assets/`.

### Task 3: Add native Windows CI artifact generation

**Files:**
- Create: `.github/workflows/build-windows.yml`
- Test: `electron/desktop-config.node.cjs`

- [ ] **Step 1: Add the Windows workflow**

Create a `workflow_dispatch` workflow on `windows-latest` with read-only contents permission. Pin official actions to commits, then run:

```yaml
- run: npm ci
- run: npm test -- --run
- run: npm run test:desktop
- run: npm run package:win
```

Upload `release/*.exe` as artifact `zijian-text-layout-windows-0.2.0` with `actions/upload-artifact` pinned to `ea165f8d65b6e75b540449e92b4886f43607fa02`.

- [ ] **Step 2: Run the desktop contract test and verify GREEN**

Run: `npm run test:desktop`

Expected: all desktop configuration assertions PASS.

- [ ] **Step 3: Run all local tests and builds**

Run:

```bash
npm test -- --run
npm run build -- --mode pages
npm run build:desktop
```

Expected: all frontend tests pass and both web and desktop builds succeed.

- [ ] **Step 4: Commit the desktop implementation**

```bash
git add electron package.json package-lock.json vite.config.ts .gitignore .github/workflows/build-windows.yml
git commit -m "feat: add Windows desktop packaging"
```

### Task 4: Build on Windows and publish the release

**Files:**
- Verify and publish only.

- [ ] **Step 1: Push main and dispatch Windows build**

Run:

```bash
git push origin main
gh workflow run build-windows.yml --ref main
```

Expected: push succeeds and a new `Build Windows App` run is queued for the pushed commit.

- [ ] **Step 2: Monitor the native Windows run**

Run: `gh run watch <run-id> --exit-status`

Expected: dependency installation, 48+ frontend tests, desktop contract test, Electron package build, and artifact upload all succeed.

- [ ] **Step 3: Download and verify executables**

Run:

```bash
rm -rf /tmp/zijian-windows
gh run download <run-id> -n zijian-text-layout-windows-0.2.0 -D /tmp/zijian-windows
find /tmp/zijian-windows -name '*.exe' -maxdepth 1 -print
```

Expected: one Setup executable and one Portable executable. Verify each begins with the DOS/PE `MZ` header and has non-zero size.

- [ ] **Step 4: Create the public GitHub Release**

Run:

```bash
gh release create v0.2.0 /tmp/zijian-windows/*.exe \
  --title "字间排版工具 Windows v0.2.0" \
  --notes "Windows 10/11 64 位。包含安装版与免安装便携版；未购买代码签名证书，首次运行可能出现 SmartScreen 提示。"
```

Expected: the public release is created with both executable assets.

- [ ] **Step 5: Verify permanent download URLs**

Use `gh release view v0.2.0 --json url,assets` and HTTP HEAD requests for both assets. Expected: the release is public, both asset links respond successfully, and the release commit matches version 0.2.0.
