# 컴포넌트 예시

저장소의 실제 컴포넌트를 종류별로 모았다. 새 컴포넌트를 만들 때 가장 비슷한 예시를 골라 같은 모양으로 쓴다.

- 코드는 실제 파일에서 가져왔다. 실제 파일이 규칙과 다른 곳(reference.md "알려진 예외")은 **규칙대로 고친 형태**로 싣고, 각 예시 위에 무엇이 다른지 적었다.
- 규칙 설명은 reference.md에 있다.

## 새 컴포넌트 뼈대

### 표시 전용 (훅·이벤트 핸들러 없음)

```tsx
import { Todo } from "@/lib/types";

interface Props {
  todos: Todo[];
}

export default function ComponentName({ todos }: Props) {
  return <section className="border-b border-gray-200 p-4">...</section>;
}
```

### 상호작용 (이벤트 핸들러나 훅 있음)

```tsx
"use client";

import { Filter } from "@/lib/types";

interface Props {
  current: Filter;
  onChange: (filter: Filter) => void;
}

export default function ComponentName({ current, onChange }: Props) {
  return (
    <button type="button" onClick={() => onChange("all")}>
      ...
    </button>
  );
}
```

## 예시 1. 표시 전용 컴포넌트: `components/TodoStats.tsx`

실제 파일과 같다.

볼 점:
- 훅·이벤트 핸들러가 없어서 `"use client"`가 없다.
- 이미 있는 `countRemaining`을 가져다 쓰고, 파생 값은 렌더할 때 계산한다.
- 0으로 나누는 경우를 처리하고, 직접 만든 진행 막대에 `role="progressbar"`와 `aria-*`를 붙였다.
- 클래스로 표현할 수 없는 폭만 `style`로 지정했다.

```tsx
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
```

## 예시 2. 하나를 고르는 컴포넌트: `components/FilterBar.tsx`

실제 파일과 다른 점: 버튼에 `type="button"`을 추가했다.

볼 점:
- 선택지는 컴포넌트 밖 상수 배열로 두고, 값 타입을 `Filter`로 지정했다.
- props는 `current` + `onChange` 쌍이다. 상태는 부모(`page.tsx`)가 가진다.
- 선택 여부에 따라 클래스를 템플릿 리터럴 안의 삼항으로 바꾼다.
- `SortBar.tsx`도 같은 모양이다(`sorts`, `SortBy`).

```tsx
"use client";

import { Filter } from "@/lib/types";

interface Props {
  current: Filter;
  onChange: (filter: Filter) => void;
}

const filters: { label: string; value: Filter }[] = [
  { label: "전체", value: "all" },
  { label: "진행중", value: "active" },
  { label: "완료", value: "completed" },
];

export default function FilterBar({ current, onChange }: Props) {
  return (
    <div className="flex gap-2 px-4 pb-2">
      {filters.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onChange(f.value)}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200 active:scale-95 ${
            current === f.value
              ? "border-[#D97757] bg-[#D97757]/10 text-[#D97757]"
              : "border-gray-200 text-gray-600 hover:border-[#D97757] hover:text-[#D97757]"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
```

## 예시 3. 직접 만든 컨트롤: `components/Checkbox.tsx`

실제 파일과 같다.

볼 점:
- 기본 `<input type="checkbox">` 대신 버튼으로 만들었기 때문에 `role="checkbox"`와 `aria-checked`로 상태를 알린다.
- 값 없이 알리기만 하는 콜백이라 `onChange: () => void`다. 어떤 할일인지는 부모(`TodoItem`)가 묶어서 넘긴다.

```tsx
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
```

## 예시 4. 목록 항목 + 스타일 매핑: `components/TodoItem.tsx`

실제 파일과 다른 점: `Checkbox` import를 `@/components/Checkbox`로, "삭제" 버튼에 `type="button"`을 추가했다.

볼 점:
- 우선순위별 라벨·색은 `Record<Priority, ...>`로 매핑해서, `Priority` 값이 늘면 타입 오류로 알 수 있다.
- 콜백은 `onToggle(todo.id)`처럼 필요한 값만 넘긴다.
- 선택 필드(`priority`, `dueDate`)는 있을 때만 그린다.
- 날짜 표시는 `fd()`를 쓴다.

```tsx
"use client";

import { Priority, Todo } from "@/lib/types";
import { fd } from "@/lib/utils";
import Checkbox from "@/components/Checkbox";

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
        type="button"
        onClick={() => onDelete(todo.id)}
        className="rounded-md px-2 py-1 text-sm text-gray-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-500"
      >
        삭제
      </button>
    </li>
  );
}
```

## 예시 5. 화면 전용 상태를 가진 입력: `components/TodoInput.tsx`

실제 파일과 다른 점: "추가" 버튼에 `type="button"`을 추가했고, Enter 처리에서 한글 조합 중인 입력을 무시하도록 `!e.nativeEvent.isComposing`을 넣었다.

볼 점:
- `useState`를 쓰므로 `"use client"`.
- 상태는 입력 중인 값과 오류 문구뿐이고, 실제 추가는 `onAdd`로 부모에 올린다.
- 내부 처리 함수는 `handleAdd`. 검증 → 콜백 호출 → 입력 초기화 순서.
- 선택 필드의 빈 값은 `|| undefined`로 바꿔 넘긴다.
- 이전 값 기준 토글은 함수형 업데이트(`setPriority((current) => ...)`)를 쓴다.

```tsx
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) handleAdd();
          }}
        />
        <button
          type="button"
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
```

## 예시 6. 부모에 연결하기: `app/page.tsx` (발췌)

새 컴포넌트는 `page.tsx`에서 import하고, 필요한 값과 콜백을 props로 넘긴다.

실제 파일과 다른 점: `deleteTodo`를 함수형 업데이트로 바꿨다(새 변경 함수는 이 형태로 쓴다).

```tsx
import TodoStats from "@/components/TodoStats";
import TodoList from "@/components/TodoList";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(mockTodos);

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <Header todos={todos} />
      <TodoStats todos={todos} />
      {/* ... */}
      <TodoList
        todos={sortedTodos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
    </>
  );
}
```

- 필터 전 전체 목록이 필요한 컴포넌트(`Header`, `TodoStats`)에는 `todos`를, 화면에 보일 목록이 필요한 컴포넌트(`TodoList`)에는 `sortedTodos`를 넘긴다.
