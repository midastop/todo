"use client";

import { Priority, Todo } from "@/lib/types";
import { fd } from "@/lib/utils";
import Checkbox from "./Checkbox";

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityStyle: Record<Priority, { label: string; className: string }> = {
  high: { label: "높음", className: "bg-red-50 text-red-500" },
  medium: { label: "보통", className: "bg-amber-50 text-amber-600" },
  low: { label: "낮음", className: "bg-blue-50 text-blue-500" },
};

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <li className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors duration-200 hover:bg-orange-50/40">
      <Checkbox checked={todo.completed} onChange={() => onToggle(todo.id)} />
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className={`transition-colors duration-200 ${
              todo.completed ? "text-gray-400 line-through" : "text-gray-800"
            }`}
          >
            {todo.text}
          </p>
          {todo.priority && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle[todo.priority].className}`}
            >
              {priorityStyle[todo.priority].label}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{fd(todo.createdAt)}</span>
        {todo.dueDate && (
          <span className="ml-2 text-xs text-gray-400">
            마감 {fd(todo.dueDate)}
          </span>
        )}
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="rounded-md px-2 py-1 text-sm text-gray-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-500"
      >
        삭제
      </button>
    </li>
  );
}
