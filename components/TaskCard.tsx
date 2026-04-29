'use client';
import { Task } from '@/types/task';
import { getDeadlineStatus, formatDeadline } from '@/lib/deadline';

const priorityConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  urgent: { label: '緊急', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-400' },
  high:   { label: '高',   bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-400' },
  medium: { label: '中',   bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-400' },
  low:    { label: '低',   bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending:     { label: '未対応', bg: 'bg-gray-100', text: 'text-gray-700' },
  in_progress: { label: '対応中', bg: 'bg-blue-100', text: 'text-blue-700' },
  completed:   { label: '完了',   bg: 'bg-green-100', text: 'text-green-700' },
  cancelled:   { label: 'キャンセル', bg: 'bg-gray-200', text: 'text-gray-500' },
};

interface Props {
  task: Task;
  onClick: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: Props) {
  const priority = priorityConfig[task.priority] ?? priorityConfig.medium;
  const status = statusConfig[task.status] ?? statusConfig.pending;
  const deadline = getDeadlineStatus(task.deadline ?? null);
  return (
    <div
      onClick={() => onClick(task)}
      className={`bg-white rounded-lg border-l-4 ${priority.border} shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
          {task.subject}
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.bg} ${priority.text} shrink-0`}>
          {priority.label}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-1">{task.sender_email}</p>
      {task.ai_summary && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{task.ai_summary}</p>
      )}
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
          {status.label}
        </span>
        {task.deadline && (
          <span className={`text-xs font-medium ${deadline.color}`}>
            期限: {formatDeadline(task.deadline)}（{deadline.label}）
          </span>
        )}
      </div>
      {task.ai_category && (
        <div className="mt-2">
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
            {task.ai_category}
          </span>
        </div>
      )}
    </div>
  );
}
