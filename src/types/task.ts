export type TaskStatus = 'todo' | 'progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface TaskEvolution {
  id: string;
  content: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  area?: string;
  evolutions: TaskEvolution[];
  results: string;
  tests: string;
  attachments: TaskAttachment[];
  research: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}