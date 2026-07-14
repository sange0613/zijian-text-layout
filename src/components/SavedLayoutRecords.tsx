import { TEXT_LAYOUT_BY_ID } from '../data/textLayoutPresets'
import type { EditorState, SavedLayoutRecord } from '../types'

type SavedLayoutRecordsProps = {
  records: SavedLayoutRecord[]
  recordName: string
  justSaved: boolean
  onRecordNameChange: (name: string) => void
  onSave: () => void
  onExport: () => void
  onRename: (id: string, name: string) => void
  onApply: (state: EditorState) => void
  onRemove: (id: string) => void
}

export function SavedLayoutRecords({
  records,
  recordName,
  justSaved,
  onRecordNameChange,
  onSave,
  onExport,
  onRename,
  onApply,
  onRemove,
}: SavedLayoutRecordsProps) {
  return (
    <fieldset className="settings-section saved-layout-records">
      <legend>保存记录</legend>
      <div className="saved-records-heading">
        <span>保存在当前浏览器</span>
        <button
          className="export-records-button"
          type="button"
          disabled={!records.length}
          onClick={onExport}
        >
          导出记录
        </button>
      </div>
      <div className="saved-record-save-row">
        <label className="saved-record-name-field">
          <span>记录名</span>
          <input
            aria-label="保存记录名称"
            type="text"
            maxLength={24}
            placeholder="例如：爆款标题版"
            value={recordName}
            onChange={(event) => onRecordNameChange(event.target.value)}
          />
        </label>
        <button
          className="save-record-button"
          type="button"
          aria-label="保存当前记录"
          onClick={onSave}
        >
          保存
        </button>
      </div>
      <div className="save-record-status" aria-live="polite">
        {justSaved ? '已保存' : ''}
      </div>
      {records.length ? (
        <ul className="saved-records-list">
          {records.map((record) => (
            <li key={record.id} className="saved-record-item">
              <div className="saved-record-main">
                <input
                  aria-label={`记录名称：${record.name}`}
                  type="text"
                  maxLength={24}
                  value={record.name}
                  onChange={(event) => onRename(record.id, event.target.value)}
                  onBlur={(event) => onRename(record.id, event.target.value.trim() || '未命名记录')}
                />
                <span>
                  {TEXT_LAYOUT_BY_ID.get(record.state.textLayoutId)?.label ?? '自定义排版'}
                </span>
              </div>
              <button
                className="saved-record-apply"
                type="button"
                aria-label={`使用记录：${record.name}`}
                onClick={() => onApply(record.state)}
              >
                用
              </button>
              <button
                className="saved-record-remove"
                type="button"
                aria-label={`删除记录：${record.name}`}
                title="删除记录"
                onClick={() => onRemove(record.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="saved-records-empty">还没有保存记录</p>
      )}
    </fieldset>
  )
}
