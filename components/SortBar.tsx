"use client";

import { SortBy } from "@/lib/types";

interface Props {
  current: SortBy;
  onChange: (sortBy: SortBy) => void;
}

const sorts: { label: string; value: SortBy }[] = [
  { label: "기본순", value: "none" },
  { label: "마감일순", value: "dueDate" },
  { label: "우선순위순", value: "priority" },
];

export default function SortBar({ current, onChange }: Props) {
  return (
    <div className="flex gap-2 px-4 pb-2">
      {sorts.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200 active:scale-95 ${
            current === s.value
              ? "border-[#D97757] bg-[#D97757]/10 text-[#D97757]"
              : "border-gray-200 text-gray-600 hover:border-[#D97757] hover:text-[#D97757]"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
