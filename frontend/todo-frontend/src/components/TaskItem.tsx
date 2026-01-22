import React from "react";
import { Task } from "../services/types";
import { Button } from "./ui/Button";
import { cn, formatDate, isPastDue, getPriorityColor } from "../lib/utils";
import {
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  Calendar,
  Flag,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Individual task item with toggle, edit, and delete actions.
 */
export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  isToggling = false,
  isDeleting = false,
}) => {
  const isOverdue = !task.isCompleted && isPastDue(task.dueDate);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border p-4 transition-all duration-200",
        "bg-card/50 hover:bg-card border-border/50 hover:border-border",
        task.isCompleted && "opacity-60",
        isOverdue && "border-destructive/30 bg-destructive/5"
      )}
    >
      {/* Completion toggle */}
      <button
        onClick={() => onToggle(task.id)}
        disabled={isToggling}
        className={cn(
          "mt-0.5 flex-shrink-0 transition-all duration-200",
          task.isCompleted
            ? "text-primary"
            : "text-muted-foreground hover:text-primary"
        )}
        aria-label={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
      >
        {task.isCompleted ? (
          <CheckCircle2 className="h-6 w-6" />
        ) : (
          <Circle className="h-6 w-6" />
        )}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "font-medium text-foreground transition-all duration-200",
            task.isCompleted && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </h3>

        {task.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Metadata */}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
          {/* Due date */}
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(task.dueDate)}
              {isOverdue && " (Overdue)"}
            </span>
          )}

          {/* Priority */}
          <span
            className={cn(
              "flex items-center gap-1",
              getPriorityColor(task.priority)
            )}
          >
            <Flag className="h-3.5 w-3.5" />
            {task.priorityLabel}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Edit task"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          disabled={isDeleting}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
