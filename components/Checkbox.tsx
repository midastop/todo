"use client";

interface Props {
  checked: boolean;
  onChange: () => void;
}

export default function Checkbox({ checked, onChange }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 active:scale-90 ${
        checked
          ? "border-[#D97757] bg-[#D97757]"
          : "border-gray-300 bg-white hover:border-[#D97757]"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-3 w-3 text-white transition-opacity duration-200 ${
          checked ? "opacity-100" : "opacity-0"
        }`}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>
  );
}
