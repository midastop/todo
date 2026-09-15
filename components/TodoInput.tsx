"use client";

import { useState } from "react";
import { Priority } from "@/lib/types";

interface Props {
  onAdd: (text: string, dueDate?: string, priority?: Priority) => void;
}

const priorities: { label: string; value: Priority }[] = [
  { label: "높음", value: "high" },
  { label: "보통", value: "medium" },
  { label: "낮음", value: "low" },
];

export default function TodoInput({ onAdd }: Props) {
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("할일을 입력해주세요.");
      return;
    }
    onAdd(trimmed, dueDate || undefined, priority || undefined);
    setText("");
    setDueDate("");
    setPriority("");
    setError("");
  };

  return (
    <div className="p-4">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#D97757] focus:bg-white focus:ring-2 focus:ring-[#D97757]/20"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError("");
          }}
          placeholder="할일을 입력하세요"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="rounded-lg bg-[#D97757] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#c96647] active:scale-95"
        >
          추가
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex gap-1">
          {priorities.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() =>
                setPriority((current) => (current === p.value ? "" : p.value))
              }
              className={`rounded-full border px-3 py-1 text-sm transition-all duration-200 active:scale-95 ${
                priority === p.value
                  ? "border-[#D97757] bg-[#D97757]/10 text-[#D97757]"
                  : "border-gray-200 text-gray-600 hover:border-[#D97757] hover:text-[#D97757]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          type="date"
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600 outline-none transition-all duration-200 focus:border-[#D97757] focus:bg-white focus:ring-2 focus:ring-[#D97757]/20"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
