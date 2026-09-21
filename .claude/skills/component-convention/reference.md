# 컴포넌트 컨벤션 상세 규칙

SKILL.md의 핵심 규칙을 풀어 쓴 문서다. 모든 규칙은 저장소의 `components/`, `lib/`, `app/` 코드에서 뽑았고, 코드가 규칙과 다른 곳은 마지막 "알려진 예외"에 모았다.

## 1. 프로젝트 구조

`src/` 없이 저장소 루트에 둔다.

```
app/
  layout.tsx       # max-w-md 모바일형 컨테이너로 페이지를 감쌈
  page.tsx         # "use client". 모든 앱 상태와 변경 함수를 가진 루트
components/        # 모든 컴포넌트. 하위 폴더 없음
  Header.tsx       # 제목 + 남은 할일 개수 (표시 전용)
  TodoStats.tsx    # 전체/진행중/완료 개수와 완료율 (표시 전용)
  TodoInput.tsx    # 할일 입력, 우선순위·마감일 선택 (화면 전용 상태 있음)
  FilterBar.tsx    # 전체/진행중/완료 선택
  SortBar.tsx      # 기본순/마감일순/우선순위순 선택
  TodoList.tsx     # 목록
  TodoItem.tsx     # 목록 항목
  Checkbox.tsx     # 직접 만든 체크박스 컨트롤
lib/
  types.ts         # Todo, Filter, Priority, SortBy
  utils.ts         # fd, sortByDueDate, sortByPriority, countRemaining
  mock-data.ts     # 초기 할일
```

- 한 파일에 컴포넌트 하나. 파일명과 컴포넌트명을 같게 한다(`TodoStats.tsx` → `TodoStats`).
- 컴포넌트 트리: `Home(page.tsx)` → `Header`, `TodoStats`, `TodoInput`, `FilterBar`, `SortBar`, `TodoList` → `TodoItem` → `Checkbox`

## 2. 파일 모양과 export

파일은 항상 이 순서로 쓴다.

1. `"use client";` (필요할 때만, 5절)
2. import
3. `interface Props`
4. 모듈 상수(옵션 목록, 스타일 매핑 등)
5. `export default function 컴포넌트명({ ...props }: Props)`

- 항상 `export default function`. `const X = () => ...`나 `export function X`는 쓰지 않는다.
- props는 매개변수에서 바로 구조 분해한다.

## 3. props 타입

```tsx
interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
```

- 이름은 컴포넌트명을 붙이지 않고 `Props`로 통일한다.
- 콜백은 객체 전체가 아니라 필요한 값만 넘긴다(`(id: string) => void`).
- 값 없이 알리기만 하는 콜백은 `() => void`(예: `Checkbox`의 `onChange`).
- 선택형 값은 도메인 타입 그대로 쓴다(`current: Filter`, `onChange: (filter: Filter) => void`).

## 4. 도메인 타입, 옵션 목록, 스타일 매핑

- `Todo`, `Filter`, `Priority`, `SortBy`는 `@/lib/types`에서 import하고 컴포넌트 파일에서 다시 선언하지 않는다.
- 화면에 나열할 선택지는 컴포넌트 밖 모듈 상수로 둔다. 값 타입은 도메인 타입으로 지정한다.

  ```tsx
  const filters: { label: string; value: Filter }[] = [
    { label: "전체", value: "all" },
    { label: "진행중", value: "active" },
    { label: "완료", value: "completed" },
  ];
  ```

- 도메인 값마다 라벨·스타일을 붙일 때는 `Record<도메인타입, ...>`을 쓴다. 값이 추가됐는데 매핑을 빠뜨리면 타입 오류로 알려 준다(`TodoItem`의 `priorityStyle`).
- 우선순위 라벨 "높음/보통/낮음"은 현재 `TodoInput`과 `TodoItem`에 따로 있다. `Priority` 값을 바꾸면 `lib/types.ts`, `lib/utils.ts`의 `PRIORITY_ORDER`, 이 두 컴포넌트를 함께 고친다.

## 5. "use client" 판단

넣는 경우: 훅(`useState`, `useEffect` 등)을 쓰거나, JSX 요소에 이벤트 핸들러(`onClick`, `onChange`, `onKeyDown` 등)를 직접 붙일 때.
넣지 않는 경우: props만 받아 그리는 컴포넌트.

| 컴포넌트           | 훅         | 직접 붙인 이벤트 핸들러            | "use client"           |
| ------------------ | ---------- | ---------------------------------- | ---------------------- |
| Header             | 없음       | 없음                               | 없음                   |
| TodoStats          | 없음       | 없음                               | 없음                   |
| Checkbox           | 없음       | `onClick`                          | 있음                   |
| FilterBar, SortBar | 없음       | `onClick`                          | 있음                   |
| TodoItem           | 없음       | `onClick`(삭제)                    | 있음                   |
| TodoInput          | `useState` | `onChange`, `onKeyDown`, `onClick` | 있음                   |
| TodoList           | 없음       | 없음(콜백 전달만)                  | 있음 → 예외, 없어도 됨 |

- `app/page.tsx`가 `"use client"`라서 지금은 하위 컴포넌트가 모두 브라우저에서도 실행된다. 그래도 파일마다 위 기준을 지켜서, 나중에 서버 컴포넌트에서 가져다 써도 동작하게 둔다.

## 6. 상태와 데이터 흐름

- 앱 상태(`todos`, `filter`, `sortBy`)와 변경 함수(`addTodo`, `toggleTodo`, `deleteTodo`)는 `app/page.tsx`만 가진다. 전역 store나 context는 없다.
- 필터·정렬 결과처럼 계산으로 얻을 수 있는 값은 state에 저장하지 않고 렌더할 때 계산한다.
- 컴포넌트는 값을 props로 받고 변경은 `on*` 콜백으로 올린다.
- 컴포넌트 안 `useState`는 화면 전용 상태에만 쓴다(`TodoInput`의 입력값, 선택 중인 우선순위·마감일, 오류 문구).
- 이전 상태를 기준으로 바꿀 때는 함수형 업데이트를 쓴다(`setPriority((current) => ...)`, `setTodos((prev) => [...])`).
- 입력 처리 관례(`TodoInput`)
  - 앞뒤 공백을 `trim()`하고 비었으면 오류 문구를 보여 준 뒤 멈춘다.
  - 선택 필드의 빈 값은 `|| undefined`로 바꿔 넘긴다.
  - 추가에 성공하면 입력 상태를 모두 초기화한다.
  - Enter로 제출할 때는 한글 조합 중인 입력을 무시한다(`!e.nativeEvent.isComposing`).

## 7. 네이밍

| 대상                    | 규칙                   | 예                                          |
| ----------------------- | ---------------------- | ------------------------------------------- |
| 파일·컴포넌트           | PascalCase             | `TodoStats.tsx`, `TodoStats`                |
| props 타입              | `Props`                | `interface Props`                           |
| 콜백 prop               | `on` + 동작            | `onAdd`, `onToggle`, `onDelete`, `onChange` |
| 선택형 컴포넌트 props   | `current` + `onChange` | `FilterBar`, `SortBar`                      |
| 내부 이벤트 핸들러      | `handle` + 동작        | `handleAdd`                                 |
| page.tsx 상태 변경 함수 | 동사 + 대상            | `addTodo`, `toggleTodo`, `deleteTodo`       |
| 옵션 목록 상수          | 복수형 명사            | `filters`, `sorts`, `priorities`            |
| 스타일 매핑 상수        | 대상 + `Style`         | `priorityStyle`                             |

## 8. import 순서와 경로 별칭

1. React와 외부 라이브러리(`import { useState } from "react";`)
2. `@/lib/types`, `@/lib/utils`
3. `@/components/...`

- `@/*`는 저장소 루트를 가리킨다. 상대 경로(`./Checkbox`, `../lib/types`)는 쓰지 않는다.
- 타입만 가져올 때도 지금 코드처럼 `import { Todo } from "@/lib/types";` 형태로 쓴다.

## 9. 스타일

Tailwind 유틸 클래스만 JSX에 쓴다. `.css`나 `.module.css`는 만들지 않는다(`app/globals.css`는 Tailwind import와 body 폰트뿐). 강조색은 테마 토큰이 아니라 값으로 하드코딩되어 있으므로 새 컴포넌트도 같은 값을 쓴다.

| 용도                      | 클래스                                                                                                                                                                     | 사용처                        |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 섹션 구분                 | `border-b border-gray-200 p-4`                                                                                                                                             | Header, TodoStats             |
| 목록 항목 구분            | `border-b border-gray-100 px-4 py-3`                                                                                                                                       | TodoItem                      |
| 버튼 그룹 줄              | `flex gap-2 px-4 pb-2`                                                                                                                                                     | FilterBar, SortBar            |
| 본문 / 보조 / 메타 텍스트 | `text-gray-800` / `text-gray-500` / `text-xs text-gray-400`                                                                                                                | TodoItem, Header              |
| 강조 숫자·값              | `font-bold text-gray-900`, 강조할 값은 `text-[#D97757]`                                                                                                                    | TodoStats, Header             |
| 주요 버튼                 | `rounded-lg bg-[#D97757] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#c96647] active:scale-95`                                                          | TodoInput "추가"              |
| pill 버튼 공통            | `rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200 active:scale-95`                                                                                    | FilterBar, SortBar            |
| pill 선택됨               | `border-[#D97757] bg-[#D97757]/10 text-[#D97757]`                                                                                                                          | FilterBar, SortBar, TodoInput |
| pill 선택 안 됨           | `border-gray-200 text-gray-600 hover:border-[#D97757] hover:text-[#D97757]`                                                                                                | FilterBar, SortBar, TodoInput |
| 입력창                    | `rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none transition-all duration-200 focus:border-[#D97757] focus:bg-white focus:ring-2 focus:ring-[#D97757]/20` | TodoInput                     |
| 우선순위 배지             | 높음 `bg-red-50 text-red-500` / 보통 `bg-amber-50 text-amber-600` / 낮음 `bg-blue-50 text-blue-500`                                                                        | TodoItem                      |
| 삭제·위험                 | `text-gray-400 hover:bg-red-50 hover:text-red-500`                                                                                                                         | TodoItem "삭제"               |
| 오류 문구                 | `text-sm text-red-500`                                                                                                                                                     | TodoInput                     |
| 완료된 항목               | `text-gray-400 line-through`                                                                                                                                               | TodoItem                      |
| 목록 항목 hover           | `hover:bg-orange-50/40`                                                                                                                                                    | TodoItem                      |

- 조건부 클래스는 템플릿 리터럴 안에서 삼항으로 조합한다.

  ```tsx
  className={`rounded-full border px-3.5 py-1.5 text-sm ${
    current === f.value
      ? "border-[#D97757] bg-[#D97757]/10 text-[#D97757]"
      : "border-gray-200 text-gray-600"
  }`}
  ```

- 실행 중에 바뀌는 수치(진행률 폭 등)처럼 클래스로 표현할 수 없는 값만 `style`로 지정한다(`TodoStats`의 `style={{ width: ... }}`).

## 10. 접근성

- `<button>`에는 항상 `type="button"`을 붙인다. 지금은 `<form>`이 없지만 나중에 감싸면 submit 버튼이 되기 때문이다.
- 기본 요소가 아닌 컨트롤을 직접 만들면 `role`과 상태 속성을 붙인다.
  - 체크박스: `role="checkbox"` + `aria-checked` (`Checkbox`)
  - 진행 막대: `role="progressbar"` + `aria-label`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` (`TodoStats`)
- 새로 만들 때 권장하는 것(기존 코드에는 아직 없음)
  - 선택형 pill 버튼: `aria-pressed={current === value}`
  - placeholder만 있는 입력창·날짜 입력: `aria-label`
  - 목록마다 반복되는 버튼(삭제 등): 대상이 드러나는 `aria-label`(예: `` `${todo.text} 삭제` ``)

## 11. 텍스트와 포맷

- UI 문구와 주석은 한국어. 주석은 코드만 봐서는 알 수 없는 "왜"를 적는다.
- 들여쓰기 2칸.
- Prettier(`.prettierrc`): 큰따옴표, 세미콜론, trailing comma `all`, printWidth 80.
- 날짜는 `YYYY-MM-DD` 문자열로 다루고 표시는 `fd()`로 한다. 컴포넌트에서 `new Date()`로 날짜를 새로 계산하지 않는다(시간대에 따라 하루가 밀림).

## 12. 알려진 예외 (따라 하지 말 것)

기존 코드 중 위 규칙과 다른 곳이다. 새 코드에서는 규칙을 따르고, 이 파일을 고칠 일이 있으면 함께 맞춘다. 고치고 나면 이 목록에서 지운다.

| 위치                                                 | 규칙과 다른 점                                                                                 | 규칙                        |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------- |
| `components/Header.tsx`                              | props 타입을 인라인(`{ todos }: { todos: Todo[] }`)으로 씀                                     | 3절 `interface Props`       |
| `components/TodoItem.tsx`                            | `import Checkbox from "./Checkbox"` 상대 경로                                                  | 8절 `@/components/Checkbox` |
| `components/FilterBar.tsx`, `components/SortBar.tsx` | 버튼에 `type="button"` 없음                                                                    | 10절                        |
| `components/TodoInput.tsx`                           | "추가" 버튼에 `type="button"` 없음. Enter 처리에 `isComposing` 확인 없음                       | 10절, 6절                   |
| `components/TodoItem.tsx`                            | "삭제" 버튼에 `type="button"` 없음                                                             | 10절                        |
| `components/TodoList.tsx`                            | 훅·이벤트 핸들러가 없는데 `"use client"`가 있음                                                | 5절                         |
| `app/page.tsx`                                       | `setTodos([newTodo, ...todos])` 등 함수형 업데이트를 쓰지 않음. import가 components → lib 순서 | 6절, 8절                    |
