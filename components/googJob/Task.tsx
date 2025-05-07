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
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:bg-gray-50"
        {...props}
      >
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Task.displayName = "Task";
export default Task;
