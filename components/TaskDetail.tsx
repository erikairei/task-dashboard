'use client';
import { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { formatDeadline, getDeadlineStatus } from '@/lib/deadline';

interface Props {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}
onStatusChange: (taskId: string, status: "pending" | "in_progress" | "done") => Promise<void>;
onConfirm: (taskId: string) => Promise<void>;
const statusOptions = [
  { value: 'pending', label: '未対応' },
  { value: 'in_progress', label: '対応中' },
  { value: 'completed', label: '完了' },
  { value: 'cancelled', label: 'キャンセル' },
];

const priorityOptions = [
  { value: 'urgent', label: '緊急' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

export default function TaskDetail({ task, onClose, onUpdate }: Props) {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.ai_priority);
  const [notes, setNotes] = useState(task.notes ?? '');
  const [saving, setSaving] = useState(false);
  const deadline = getDeadlineStatus(task.deadline);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(task.id, { status, ai_priority: priority, notes });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 leading-snug pr-4">{task.subject}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>
          <div className="text-sm text-gray-500 mb-1">差出人: {task.sender_name ?? task.sender_email}</div>
          <div className="text-sm text-gray-500 mb-4">受信日: {new Date(task.received_at).toLocaleString('ja-JP')}</div>
          {task.deadline && (
            <div className={`text-sm font-medium mb-4 ${deadline.color}`}>
              期限: {formatDeadline(task.deadline)}（{deadline.label}）
            </div>
          )}
          {task.ai_summary && (
            <div className="bg-indigo-50 rounded-lg p-3 mb-4">
              <div className="text-xs text-indigo-500 font-medium mb-1">AI要約</div>
              <p className="text-sm text-gray-700">{task.ai_summary}</p>
            </div>
          )}
          {task.body_text && (
            <details className="mb-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">メール本文を表示</summary>
              <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-3 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {task.body_text}
              </div>
            </details>
          )}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">ステータス</label>
              <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="w-full border rounded px-2 py-1.5 text-sm">
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">優先度</label>
              <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className="w-full border rounded px-2 py-1.5 text-sm">
                {priorityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">メモ</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full border rounded px-2 py-1.5 text-sm resize-none" placeholder="対応メモを入力..." />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">キャンセル</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
