import React, { useState, useEffect, useCallback } from "react";
import { tasksApi } from "../services/api";
import { Task, TaskQueryParams, CreateTaskRequest, UpdateTaskRequest } from "../services/types";
import { TaskItem } from "./TaskItem";
import { TaskForm } from "./TaskForm";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import {
  Plus,
  Search,
  ListFilter,
  CheckCircle2,
  Circle,
  Loader2,
  ClipboardList,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
}

/** Valid filter status options */
type FilterStatus = "all" | "pending" | "completed";

/** Valid priority filter options */
type FilterPriority = "all" | "1" | "2" | "3";

/** Valid sort field options */
type SortByOption = "createdAt" | "dueDate" | "priority" | "title";

// ============================================================================
// Component
// ============================================================================

/**
 * Task list component with filtering, sorting, and CRUD operations.
 */
export const TaskList: React.FC = () => {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({ total: 0, completed: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [sortBy, setSortBy] = useState<SortByOption>("createdAt");

  // Action state (for individual task operations)
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /**
   * Fetches tasks with current filters.
   */
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params: TaskQueryParams = {
      sortBy: sortBy,
      sortDirection: "desc",
    };

    if (filterStatus !== "all") {
      params.isCompleted = filterStatus === "completed";
    }

    if (filterPriority !== "all") {
      params.priority = parseInt(filterPriority, 10);
    }

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    const result = await tasksApi.getTasks(params);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setTasks(result.data.tasks);
      setStats({
        total: result.data.totalCount,
        completed: result.data.completedCount,
        pending: result.data.pendingCount,
      });
    }

    setIsLoading(false);
  }, [searchQuery, filterStatus, filterPriority, sortBy]);

  // Fetch tasks on mount and when filters change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Opens the form for creating a new task.
   */
  const handleCreateClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  /**
   * Opens the form for editing an existing task.
   */
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  /**
   * Handles form submission for create/update.
   */
  const handleFormSubmit = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    setIsSubmitting(true);

    try {
      if (editingTask) {
        const result = await tasksApi.updateTask(editingTask.id, data);
        if (result.error) {
          setError(result.error);
          return;
        }
      } else {
        const result = await tasksApi.createTask(data as CreateTaskRequest);
        if (result.error) {
          setError(result.error);
          return;
        }
      }

      setIsFormOpen(false);
      setEditingTask(null);
      await fetchTasks();
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Toggles task completion status.
   */
  const handleToggle = async (id: number) => {
    setTogglingId(id);

    const result = await tasksApi.toggleTask(id);

    if (result.error) {
      setError(result.error);
    } else {
      await fetchTasks();
    }

    setTogglingId(null);
  };

  /**
   * Deletes a task.
   */
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setDeletingId(id);

    const result = await tasksApi.deleteTask(id);

    if (result.error) {
      setError(result.error);
    } else {
      await fetchTasks();
    }

    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Circle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListFilter className="h-5 w-5" />
              Tasks
            </CardTitle>
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filter Row */}
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </Select>

            {/* Priority Filter */}
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
              className="w-[140px]"
            >
              <option value="all">All Priority</option>
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
            </Select>

            {/* Sort By */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortByOption)}
              className="w-[160px]"
            >
              <option value="createdAt">Newest First</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Task List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <ClipboardList className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || filterStatus !== "all" || filterPriority !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first task to get started"}
              </p>
              {!searchQuery && filterStatus === "all" && filterPriority === "all" && (
                <Button className="mt-4" onClick={handleCreateClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TaskItem
                    task={task}
                    onToggle={handleToggle}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                    isToggling={togglingId === task.id}
                    isDeleting={deletingId === task.id}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        task={editingTask}
        isLoading={isSubmitting}
      />
    </div>
  );
};
