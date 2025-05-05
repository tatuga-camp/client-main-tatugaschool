import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SortableTask from "./SortableTask";
import { TaskType } from "./types";
import { useState } from "react";

interface SortableColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  onAddTask: () => void;
  onDelete: () => void;
  onEditTitle: (newTitle: string) => void;
  type: string;
}

export default function SortableColumn({
  id,
  title,
  tasks,
  onAddTask,
  onDelete,
  onEditTitle,
  type,
}: SortableColumnProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
  } = useSortable({ id });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `${id}-droppable`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEditTitle(newTitle);
    setIsEditModalOpen(false);
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className="bg-white p-4 rounded-lg shadow min-w-80"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="cursor-move flex-1" {...attributes} {...listeners}>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {id !== "no-group" && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-blue-500 hover:text-blue-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-12 12a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828l12-12z" />
                <path d="M15 7l-6.293 6.293a1 1 0 01-1.414 0L6 12l6.293-6.293a1 1 0 011.414 0L15 7z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Column Title</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="border rounded px-2 py-1 mb-4 w-full"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div
        ref={setDroppableRef}
        className="min-h-[200px] flex flex-col gap-2 p-2 rounded bg-gray-50"
      >
        {tasks.map((task) => (
          <SortableTask
            key={task.id}
            id={task.id}
            title={task.title}
            description={task.description}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-gray-400 text-center py-4">Drop tasks here</div>
        )}
      </div>
    </div>
  );
}
