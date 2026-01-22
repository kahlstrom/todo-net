import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/Dialog";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
import { Task, CreateTaskRequest, UpdateTaskRequest } from "../services/types";
import { formatDateForInput } from "../lib/utils";

// ============================================================================
// Types
// ============================================================================

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
  task?: Task | null;
  isLoading?: boolean;
}

interface FormData {
  title: string;
  description: string;
  dueDate: string;
  priority: number;
}

interface FormErrors {
  title?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Modal form for creating and editing tasks.
 */
export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  isLoading = false,
}) => {
  const isEditing = !!task;

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    dueDate: "",
    priority: 2,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when opening/closing or when task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title,
          description: task.description || "",
          dueDate: formatDateForInput(task.dueDate),
          priority: task.priority,
        });
      } else {
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          priority: 2,
        });
      }
      setErrors({});
    }
  }, [isOpen, task]);

  /**
   * Validates form data.
   */
  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    return newErrors;
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const data: CreateTaskRequest | UpdateTaskRequest = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      dueDate: formData.dueDate || undefined,
      priority: formData.priority,
    };

    await onSubmit(data);
  };

  /**
   * Updates form field value.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value, 10) : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="gradient-text">
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your task details below."
              : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title */}
          <Input
            name="title"
            label="Title"
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            disabled={isLoading}
            autoFocus
          />

          {/* Description */}
          <Textarea
            name="description"
            label="Description (optional)"
            placeholder="Add more details..."
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            rows={3}
          />

          {/* Due Date and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              name="dueDate"
              label="Due Date (optional)"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={isLoading}
            />

            <Select
              name="priority"
              label="Priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value={1}>Low</option>
              <option value={2}>Medium</option>
              <option value={3}>High</option>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
