export interface TaskType {
  id: string;
  title: string;
  description?: string;
}

export interface ColumnType {
  id: string;
  title: string;
  tasks: TaskType[];
} 