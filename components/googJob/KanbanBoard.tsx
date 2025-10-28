import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import Column from "./Column";
import Task from "./Task";
import { ColumnType, TaskType } from "./types";
import SortableColumn from "./SortableColumn";

interface KanbanBoardProps {
  data: {
    id: string;
    title: string;
    description: string;
  }[];
}

export default function KanbanBoard({ data }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [columns, setColumns] = useState<ColumnType[]>([
    {
      id: "no-group",
      title: "NO GROUP",
      tasks: data,
    },
  ]);

  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);

  const handleAddColumn = () => {
    const newId = `group-${columns.length + 1}`;
    setColumns([
      ...columns,
      {
        id: newId,
        title: `GROUP ${columns.length + 1}`,
        tasks: [],
      },
    ]);
  };

  const handleAddTask = (columnId: string) => {
    setColumns(
      columns.map((col) => {
        if (col.id === columnId) {
          const newTask = {
            id: `candidate-${new Date().getTime()}`,
            title: "New Candidate",
            description: "Click to edit this candidate",
          };
          return {
            ...col,
            tasks: [...col.tasks, newTask],
          };
        }
        return col;
      }),
    );
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumns((prevColumns) => {
      // หา column ที่จะลบ
      const columnToDelete = prevColumns.find((col) => col.id === columnId);
      if (!columnToDelete) return prevColumns;

      // หา no-group column
      const noGroupColumn = prevColumns.find((col) => col.id === "no-group");
      if (!noGroupColumn) return prevColumns;

      // สร้าง columns ใหม่โดยย้าย tasks ไปยัง no-group
      return prevColumns
        .map((col) => {
          if (col.id === "no-group") {
            // เพิ่ม tasks จาก column ที่จะลบไปยัง no-group
            return {
              ...col,
              tasks: [...col.tasks, ...columnToDelete.tasks],
            };
          }
          return col;
        })
        .filter((col) => col.id !== columnId); // ลบ column ที่ต้องการ
    });
  };

  function handleDragStart(event: any) {
    const { active } = event;
    const activeId = active.id;

    const draggedColumn = columns.find((col) => col.id === activeId);
    if (draggedColumn) {
      setActiveColumn(draggedColumn);
    } else {
      const activeTask = columns
        .flatMap((col) => col.tasks)
        .find((task) => task.id === activeId);
      setActiveTask(activeTask || null);
    }
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // จัดการ drag & drop columns
    if (columns.find((col) => col.id === active.id)) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over.id);

      if (oldIndex !== newIndex) {
        setColumns(arrayMove(columns, oldIndex, newIndex));
      }
      setActiveColumn(null);
      return;
    }

    // จัดการ drag & drop tasks
    const activeId = active.id;
    const overId = over.id;

    setColumns((prevColumns) => {
      const activeColumnIndex = prevColumns.findIndex((col) =>
        col.tasks.some((task) => task.id === activeId),
      );

      let overColumnIndex;
      // ตรวจสอบว่าปล่อยลงบน column หรือ task
      const isOverColumn = overId.toString().includes("droppable");

      if (isOverColumn) {
        // กรณีปล่อยลงบน column
        const columnId = overId.toString().replace("-droppable", "");
        overColumnIndex = prevColumns.findIndex((col) => col.id === columnId);
      } else {
        // กรณีปล่อยลงบน task
        overColumnIndex = prevColumns.findIndex((col) =>
          col.tasks.some((task) => task.id === overId),
        );
      }

      if (activeColumnIndex === -1 || overColumnIndex === -1)
        return prevColumns;

      // สร้าง columns ใหม่
      const newColumns = [...prevColumns];

      // หา task ที่กำลังลาก
      const draggedTask = newColumns[activeColumnIndex].tasks.find(
        (task) => task.id === activeId,
      );

      if (!draggedTask) return prevColumns;

      // ลบ task จาก column เดิม
      newColumns[activeColumnIndex].tasks = newColumns[
        activeColumnIndex
      ].tasks.filter((task) => task.id !== activeId);

      if (isOverColumn) {
        // ถ้าปล่อยลงบน column ให้ใส่ต่อท้าย
        newColumns[overColumnIndex].tasks.push(draggedTask);
      } else {
        // ถ้าปล่อยลงบน task ให้แทรกที่ตำแหน่งนั้น
        const overTaskIndex = newColumns[overColumnIndex].tasks.findIndex(
          (task) => task.id === overId,
        );
        newColumns[overColumnIndex].tasks.splice(overTaskIndex, 0, draggedTask);
      }

      return newColumns;
    });

    setActiveTask(null);
  }

  const handleEditColumnTitle = (columnId: string, newTitle: string) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? { ...col, title: newTitle } : col,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Group Board</h1>
        <button
          onClick={handleAddColumn}
          className="rounded-2xl bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Add Group
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map((col) => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-4 overflow-x-scroll pb-4">
            {columns.map((column) => (
              <SortableColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={column.tasks}
                onAddTask={() => handleAddTask(column.id)}
                onDelete={() => handleDeleteColumn(column.id)}
                onEditTitle={(newTitle) =>
                  handleEditColumnTitle(column.id, newTitle)
                }
                type="column"
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeColumn ? (
            <Column
              id={activeColumn.id}
              title={activeColumn.title}
              tasks={activeColumn.tasks}
              onAddTask={() => {}}
            />
          ) : activeTask ? (
            <Task
              id={activeTask.id}
              title={activeTask.title}
              description={activeTask.description}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
