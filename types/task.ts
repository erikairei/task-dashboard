export interface Task {
  id: string;
  user_id: string;
  mail_id: string;
  subject: string;
  body_summary?: string;
  customer_name?: string;
  case_number?: string;
  requester?: string;
  action_required?: string;
  priority: 1 | 2 | 3;
  deadline?: string | null;
  status: "pending" | "in_progress" | "done";
  is_confirmed: boolean;
  seconds_remaining?: number;
  created_at: string;
  updated_at: string;
}

export interface TaskDetail extends Task {
  customer_info?: Record<string, unknown>;
  case_info?: Record<string, unknown>;
  required_docs?: string[];
  history_items?: { date: string; content: string }[];
}
