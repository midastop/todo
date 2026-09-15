"use client";

import { useState } from "react";
import Header from "@/components/Header";
import TodoStats from "@/components/TodoStats";
import TodoInput from "@/components/TodoInput";
import FilterBar from "@/components/FilterBar";
import SortBar from "@/components/SortBar";
import TodoList from "@/components/TodoList";
import { mockTodos } from "@/lib/mock-data";
import { Filter, Priority, SortBy, Todo } from "@/lib/types";
import { sortByDueDate, sortByPriority } from "@/lib/utils";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(mockTodos);
  const [filter, setFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("none");

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const sortedTodos =
    sortBy === "dueDate"
      ? sortByDueDate(filteredTodos)
      : sortBy === "priority"
        ? sortByPriority(filteredTodos)
        : filteredTodos;

  const addTodo = (text: string, dueDate?: string, priority?: Priority) => {
    const newTodo: Todo = {
      id: String(Date.now()),
      text,
      completed: false,
      createdAt: new Date().toISOString().slice(0, 10),
      dueDate,
      priority,
    };
    setTodos([newTodo, ...todos]);
    console.log("할일 추가됨:", text);
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <>
      <Header todos={todos} />
      <TodoStats todos={todos} />
      <TodoInput onAdd={addTodo} />
      <FilterBar current={filter} onChange={setFilter} />
      <SortBar current={sortBy} onChange={setSortBy} />
      <TodoList
        todos={sortedTodos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
    </>
  );
}
