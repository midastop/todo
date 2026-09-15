import { Todo } from "@/lib/types";
import { countRemaining } from "@/lib/utils";

export default function Header({ todos }: { todos: Todo[] }) {
  return (
    <header className="border-b border-gray-200 p-4">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <span className="inline-block h-5 w-1.5 rounded-full bg-[#D97757]" />
        오늘의 할일
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        남은 할일{" "}
        <span className="font-medium text-[#D97757]">
          {countRemaining(todos)}
        </span>
        개
      </p>
    </header>
  );
}
