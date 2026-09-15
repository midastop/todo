export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  priority?: Priority;
}

export type Filter = "all" | "active" | "completed";

export type Priority = "high" | "medium" | "low";

export type SortBy = "none" | "dueDate" | "priority";
