import { expect, it } from 'vitest'
import { DEFAULT_EDITOR_STATE } from './editorState'
import { createSavedLayoutRecord, importSavedLayoutRecords } from './savedLayoutRecords'

it('imports an exported file while preserving text, typography and favorites', () => {
  const record = {
    ...createSavedLayoutRecord({
      ...DEFAULT_EDITOR_STATE,
      title: '导入后的标题',
      signatureFontSize: 2000,
    }, '我的排版'),
    favorite: true,
  }
  const raw = JSON.stringify({ app: 'zijian-text-layout', version: 1, records: [record] })
  expect(importSavedLayoutRecords(raw, [])).toEqual({ records: [record], imported: 1, skipped: 0 })
  expect(importSavedLayoutRecords(raw, [record])).toEqual({ records: [record], imported: 0, skipped: 1 })
})

it('rejects malformed files and corrupt states without replacing existing records', () => {
  const record = createSavedLayoutRecord(DEFAULT_EDITOR_STATE)
  expect(() => importSavedLayoutRecords('broken', [record])).toThrow('文件格式不正确')
  expect(() => importSavedLayoutRecords(JSON.stringify([{ ...record, state: {} }]), [record])).toThrow('排版数据无效')
  expect(() => importSavedLayoutRecords(JSON.stringify({ app: 'other', records: [record] }), [])).toThrow('无法识别')
})

it('restores embedded photos and their crop, while rejecting nonportable image URLs', () => {
  const photo = { url: 'data:image/jpeg;base64,aGVsbG8=', name: '封面.jpg', positionX: 18, positionY: 72, opacity: 70, blur: 4 }
  const record = createSavedLayoutRecord({ ...DEFAULT_EDITOR_STATE, signatureOffset: { x: 23, y: 84 } }, '带图模板', photo)
  const [restored] = importSavedLayoutRecords(JSON.stringify([record]), []).records
  expect(restored).toEqual(record)
  expect(() => importSavedLayoutRecords(JSON.stringify([{ ...record, photo: { ...photo, url: 'https://example.com/photo.jpg' } }]), [])).toThrow('照片无效')
})

it('refuses to discard existing records when an import exceeds capacity', () => {
  const current = Array.from({ length: 20 }, (_, index) => ({
    ...createSavedLayoutRecord(DEFAULT_EDITOR_STATE), id: `existing-${index}`,
  }))
  const incoming = createSavedLayoutRecord(DEFAULT_EDITOR_STATE)
  expect(() => importSavedLayoutRecords(JSON.stringify([incoming]), current)).toThrow('空间不足')
  expect(current).toHaveLength(20)
})
