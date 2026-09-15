---
name: component-convention
description: '이 할일 앱에서 React 컴포넌트를 새로 만들거나 기존 컴포넌트를 고칠 때 사용. components/ 파일 위치, interface Props, "use client" 판단, on*/handle* 네이밍, @/ import, Tailwind 스타일(회색 + #D97757), 접근성 규칙을 지키게 한다.'
---

# 컴포넌트 작성 컨벤션

컴포넌트를 만들거나 고칠 때 아래 규칙을 지킨다.

- 규칙의 근거, 판단 기준, 스타일 클래스 목록, 알려진 예외: [reference.md](reference.md)
- 저장소의 실제 컴포넌트 예시와 새 컴포넌트 뼈대: [examples.md](examples.md)

## 핵심 규칙

1. **위치·이름**: `components/`에 하위 폴더 없이 `PascalCase.tsx`로 만든다. 한 파일에 컴포넌트 하나, 파일명과 컴포넌트명을 같게 한다.
2. **export**: `export default function 컴포넌트명(...)`으로 내보낸다. 화살표 함수 컴포넌트나 named export는 쓰지 않는다.
3. **props 타입**: import 아래에 `interface Props`로 선언한다. 인라인 타입(`{ todos }: { todos: Todo[] }`)은 쓰지 않는다.
4. **도메인 타입**: `Todo`, `Filter`, `Priority`, `SortBy`는 `@/lib/types`에서 import한다. 새 공용 타입은 `lib/types.ts`에 추가한다. 컴포넌트 파일에서 직접 선언하는 타입은 `Props`뿐이다.
5. **"use client"**: 훅(`useState` 등)을 쓰거나 JSX에 `onClick`·`onChange`·`onKeyDown` 같은 이벤트 핸들러를 붙이면 파일 첫 줄에 넣는다. props만 받아 그리는 컴포넌트에는 넣지 않는다.
6. **상태**: 할일 목록·필터·정렬 상태는 `app/page.tsx`만 가진다. 컴포넌트는 값을 props로 받고, 변경은 콜백으로 올린다. 컴포넌트 안의 `useState`는 입력 중인 값 같은 화면 전용 상태에만 쓴다.
7. **네이밍**: 콜백 prop은 `on` + 동작(`onAdd`, `onToggle`, `onDelete`), 내부 핸들러는 `handle` + 동작(`handleAdd`). 여러 값 중 하나를 고르는 컴포넌트는 `current` + `onChange` 쌍을 쓴다.
8. **import**: `react` → `@/lib/*` → `@/components/*` 순서로 쓰고, 항상 `@/` 별칭을 쓴다. 상대 경로(`./Checkbox`)는 쓰지 않는다.
9. **계산 로직**: 두 곳 이상에서 쓸 계산은 `lib/utils.ts`에 둔다. `countRemaining`, `fd`, `sortByDueDate`처럼 이미 있는 함수가 있으면 새로 만들지 않는다.
10. **스타일**: JSX에 Tailwind 유틸 클래스만 쓰고 CSS 파일은 만들지 않는다. 회색 팔레트와 강조색 `#D97757`(hover `#c96647`)을 쓴다. 조건부 클래스는 템플릿 리터럴 안의 삼항으로 조합한다.
11. **접근성**: `<button>`에는 항상 `type="button"`을 붙인다. 직접 만든 컨트롤에는 `role`·`aria-*`로 이름과 상태를 알린다(예: `Checkbox`의 `role="checkbox"`, `aria-checked`).
12. **텍스트·포맷**: UI 문구와 주석은 한국어. 들여쓰기 2칸, Prettier 설정(큰따옴표, 세미콜론, trailing comma `all`, 80자)을 따른다.

## 만든 뒤 확인

- `app/page.tsx`에서 쓴다면 필요한 값과 콜백을 props로 연결한다.
- `npm run lint`, `npx tsc --noEmit`, `npx prettier --check <바꾼 파일>`이 모두 통과하는지 확인한다.
- 기존 코드 중 규칙과 다른 곳은 따라 하지 않는다. 목록은 reference.md의 "알려진 예외" 섹션에 있다.
