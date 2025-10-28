import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDragIndicator } from "react-icons/md";

interface SortableTaskProps {
  id: string;
  title: string;
  description?: string;
}

export default function SortableTask({
  id,
  title,
  description,
}: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md`}
      {...attributes}
    >
      {!isDragging && (
        <div
          {...listeners}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          className="absolute right-2 top-2 flex h-10 w-6 items-center justify-center rounded-2xl hover:bg-gray-300/50"
        >
          <MdDragIndicator />
        </div>
      )}
      <h3 className="mb-1 font-medium text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
