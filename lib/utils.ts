import { Priority, Todo } from "@/lib/types";

// 날짜 문자열을 보기 좋게 바꿔주는 함수
export function fd(d: string) {
  let result = "";
  const x = new Date(d);
  const y = x.getFullYear();
  let m = x.getMonth() + 1;
  let dd = x.getDate();
  if (m < 10) {
    result = result + y + "년 " + "0" + m + "월 ";
  } else {
    result = result + y + "년 " + m + "월 ";
  }
  if (dd < 10) {
    result = result + "0" + dd + "일";
  } else {
    result = result + dd + "일";
  }
  return result;
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
