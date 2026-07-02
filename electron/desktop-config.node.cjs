const assert = require('node:assert/strict')
const { existsSync, readFileSync } = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const root = path.resolve(__dirname, '..')
const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))

test('defines Windows installer and portable packaging', () => {
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
})

test('uses a hardened Electron window', () => {
  const mainPath = path.join(root, 'electron/main.cjs')
  const optionsPath = path.join(root, 'electron/window-options.cjs')
  assert.equal(existsSync(mainPath), true)
  assert.equal(existsSync(optionsPath), true)

  const optionsSource = readFileSync(optionsPath, 'utf8')
  assert.match(optionsSource, /contextIsolation:\s*true/)
  assert.match(optionsSource, /nodeIntegration:\s*false/)
  assert.match(optionsSource, /sandbox:\s*true/)
})

test('builds executables on a native Windows runner', () => {
  const workflowPath = path.join(root, '.github/workflows/build-windows.yml')
  assert.equal(existsSync(workflowPath), true)

  const workflow = readFileSync(workflowPath, 'utf8')
  assert.match(workflow, /runs-on:\s*windows-latest/)
  assert.match(workflow, /npm run package:win/)
  assert.match(workflow, /release\/\*\.exe/)
})
