import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTaskProps {
  id: string;
  title: string;
  description?: string;
}

export default function SortableTask({ id, title, description }: SortableTaskProps) {
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
      className={`
        bg-white p-3 rounded-md shadow-sm cursor-move
        hover:shadow-md transition-shadow
        border border-gray-200
      `}
      {...attributes}
      {...listeners}
    >
      <h3 className="font-medium text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
} 