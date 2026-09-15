import { Todo } from "@/lib/types";
import { countRemaining } from "@/lib/utils";

interface Props {
  todos: Todo[];
}

export default function TodoStats({ todos }: Props) {
  const total = todos.length;
  const remaining = countRemaining(todos);
  const completed = total - remaining;
  // 할일이 하나도 없을 때 0으로 나누지 않도록 0%로 처리
  const completionRate =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section className="border-b border-gray-200 p-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500">전체</p>
        </div>
        <div>
          <p className="text-lg font-bold text-[#D97757]">{remaining}</p>
          <p className="text-xs text-gray-500">진행중</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{completed}</p>
          <p className="text-xs text-gray-500">완료</p>
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>완료율</span>
          <span className="font-medium text-[#D97757]">{completionRate}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="완료율"
          aria-valuenow={completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 overflow-hidden rounded-full bg-gray-100"
        >
          {/* 진행률은 실행 중에 바뀌는 값이라 Tailwind 클래스로 표현할 수 없어 width만 style로 지정 */}
          <div
            className="h-full rounded-full bg-[#D97757] transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </section>
  );
}
