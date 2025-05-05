import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskType } from "./types";
import SortableTask from "./SortableTask";

interface ColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  onAddTask: () => void;
}

export default function Column({ id, title, tasks, onAddTask }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-200 p-4 rounded-lg w-80 flex flex-col"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">{title}</h2>
        {/* <button 
          onClick={onAddTask}
          className="inline-flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md text-sm font-medium shadow-sm border border-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button> */}
      </div>

      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <SortableTask key={task.id} {...task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
