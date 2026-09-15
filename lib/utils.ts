import { Priority, Todo } from "@/lib/types";

// "YYYY-MM-DD" 날짜 문자열을 "YYYY년 MM월 DD일"로 바꿔주는 함수
// Date로 파싱하면 UTC 자정으로 해석되어 시간대에 따라 하루가 밀리므로 문자열을 직접 나눈다
export function fd(d: string) {
  const [year, month, day] = d.split("-");
  return `${year}년 ${month}월 ${day}일`;
}

// 할일을 마감일이 이른 순서로 정렬 (마감일이 없는 항목은 뒤로)
export function sortByDueDate(todos: Todo[]) {
  return [...todos].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

// 할일을 우선순위(높음 > 보통 > 낮음) 순서로 정렬 (우선순위가 없는 항목은 뒤로)
export function sortByPriority(todos: Todo[]) {
  return [...todos].sort((a, b) => {
    if (!a.priority && !b.priority) return 0;
    if (!a.priority) return 1;
    if (!b.priority) return -1;
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });
}

export function countRemaining(todos: Todo[]) {
  return todos.filter((t) => !t.completed).length;
}
