# CLAUDE.md

이 파일은 이 저장소에서 코드 작업을 할 때 Claude Code(claude.ai/code)에게 제공하는 가이드입니다.

프로젝트 개요는 @README.md 를 참조합니다.

## 명령어

- `npm run dev` — Next.js 개발 서버 실행 (http://localhost:3000)
- `npm run build` — 프로덕션 빌드
- `npm run start` — 프로덕션 빌드 실행
- `npm run lint` — ESLint 실행 (`eslint.config.mjs`의 flat config, `eslint-config-next`의 core-web-vitals + typescript 규칙)
- `npx tsc --noEmit` — 타입체크 (별도 스크립트 없음, TypeScript `strict` 모드)
- `npx prettier --write .` — 포맷팅 (`.prettierrc`: 큰따옴표, 세미콜론, trailing comma `all`, printWidth 80). format 스크립트는 없습니다.
- 테스트 러너는 설정되어 있지 않습니다.

## 아키텍처

Next.js App Router 기반(Next 16, React 19, TypeScript, Tailwind CSS v4)의 한국어 "할일" 앱으로, 페이지는 `app/page.tsx` 하나뿐인 단일 페이지 애플리케이션입니다. UI 텍스트와 주석은 한국어로 작성합니다.

- **상태는 모두 `app/page.tsx`(`Home`)에 있습니다.** `todos`, `filter`, `sortBy` 세 개의 `useState`와 `addTodo`/`toggleTodo`/`deleteTodo` 핸들러를 소유하고 props로 내려줍니다. 전역 store, context, 영속성 계층은 없어 새로고침 시 `lib/mock-data.ts`의 `mockTodos`로 초기화됩니다.
- **필터·정렬 결과는 state로 저장하지 않고 렌더 시 계산합니다.** `todos` → `filter` 적용 → `sortBy`에 따라 `sortByDueDate`/`sortByPriority`(`lib/utils.ts`, 원본을 복사해 정렬하며 값이 없는 항목은 뒤로 보냄) 적용 → `TodoList`에 전달. `Header`는 필터와 무관하게 전체 `todos`를 받아 남은 개수를 셉니다.
- 컴포넌트 트리: `Home` → `Header`, `TodoInput`, `FilterBar`, `SortBar`, `TodoList` → `TodoItem` → `Checkbox`. `FilterBar`/`SortBar`는 같은 형태의 pill 버튼 그룹(`current` + `onChange`)입니다.
- 공용 타입은 `lib/types.ts`(`Todo`, `Filter`, `Priority`, `SortBy`)에 있습니다. `Todo`의 `dueDate`/`priority`는 선택 필드이고, 날짜(`createdAt`, `dueDate`)는 `YYYY-MM-DD` 문자열로 저장해 `fd()`로 "YYYY년 MM월 DD일" 형식으로 표시합니다. 새 할일의 `id`는 `String(Date.now())`입니다.
- **우선순위 관련 정의가 여러 파일에 흩어져 있습니다.** `Priority` 값을 추가·변경할 때는 `lib/types.ts`(타입), `lib/utils.ts`(`PRIORITY_ORDER`), `components/TodoInput.tsx`(선택 버튼 라벨), `components/TodoItem.tsx`(`priorityStyle` 뱃지 라벨·색상)를 함께 수정해야 합니다. 필터/정렬 옵션 라벨은 각각 `FilterBar`/`SortBar` 안의 로컬 배열에 있습니다.
- 레이아웃(`app/layout.tsx`)은 `max-w-md` 폭의 모바일형 컨테이너로 모든 페이지 내용을 감쌉니다.
- 경로 별칭 `@/*`는 프로젝트 루트를 가리킵니다. 예: `@/lib/types`, `@/components/Header`.
- 스타일링은 JSX 내 인라인 Tailwind 유틸리티 클래스만 사용합니다(`app/globals.css`는 Tailwind import와 body 폰트뿐). 강조 색상 `#D97757`(hover `#c96647`)은 테마 토큰이 아니라 여러 컴포넌트에 하드코딩되어 있습니다.
- `components/`는 하위 폴더 없는 flat 구조이며 모두 default export입니다. `Header`를 제외한 컴포넌트는 `"use client"`를 선언합니다.

## 코딩 컨벤션

- 들여쓰기는 2칸
- 컴포넌트는 components 폴더로 분리, 타입은 lib/types.ts 파일로 분리
- 컴포넌트 작성 규칙은 `components/CLAUDE.MD` 참고 (함수형 컴포넌트, props 타입은 상단에 `interface Props`로 분리)
