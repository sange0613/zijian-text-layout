import { TEXT_LAYOUT_BY_ID } from '../data/textLayoutPresets'
import type { EditorState, SavedLayoutRecord } from '../types'

type SavedLayoutRecordsProps = {
  records: SavedLayoutRecord[]
  justSaved: boolean
  onSave: () => void
  onApply: (state: EditorState) => void
  onRemove: (id: string) => void
}

export function SavedLayoutRecords({
  records,
  justSaved,
  onSave,
  onApply,
  onRemove,
}: SavedLayoutRecordsProps) {
  return (
    <fieldset className="settings-section saved-layout-records">
      <legend>保存记录</legend>
      <div className="saved-records-heading">
        <span>保存在当前浏览器</span>
        <button className="save-record-button" type="button" onClick={onSave}>
          保存当前记录
        </button>
      </div>
      <div className="save-record-status" aria-live="polite">
        {justSaved ? '已保存' : ''}
      </div>
      {records.length ? (
        <ul className="saved-records-list">
          {records.map((record) => (
            <li key={record.id} className="saved-record-item">
              <button
                className="saved-record-apply"
                type="button"
                aria-label={`使用记录：${record.name}`}
                onClick={() => onApply(record.state)}
              >
                <strong>{record.name}</strong>
                <span>
                  {TEXT_LAYOUT_BY_ID.get(record.state.textLayoutId)?.label ?? '自定义排版'}
                </span>
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
