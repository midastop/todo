interface Props {
  count: number;
}

export default function TodoBadge({ count }: Props) {
  // 남은 할일이 없으면 0 대신 "완료"를 보여준다
  const done = count === 0;

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        done ? "bg-gray-100 text-gray-500" : "bg-[#D97757]/10 text-[#D97757]"
      }`}
    >
      {done ? "완료" : count}
    </span>
  );
}
