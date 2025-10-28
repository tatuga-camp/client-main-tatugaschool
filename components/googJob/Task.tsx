import React, { forwardRef } from "react";

interface TaskProps {
  id: string;
  title: string;
  description?: string;
  style?: React.CSSProperties;
}

const Task = forwardRef<HTMLDivElement, TaskProps>(
  ({ id, title, description, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className="cursor-grab rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50 active:cursor-grabbing"
        {...props}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Task.displayName = "Task";
export default Task;
