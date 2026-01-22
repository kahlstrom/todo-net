/**
 * Type definitions for API requests and responses.
 * Mirrors the backend DTOs for type safety.
 */

// ============================================================================
// Auth Types
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: UserInfo;
}

// ============================================================================
// Task Types
// ============================================================================

export interface Task {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: number;
  priorityLabel: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: number;
  isCompleted?: boolean;
}

export interface TaskQueryParams {
  isCompleted?: boolean;
  priority?: number;
  dueBefore?: string;
  dueAfter?: string;
  search?: string;
  sortBy?: "dueDate" | "priority" | "createdAt" | "title";
  sortDirection?: "asc" | "desc";
}

export interface TaskListResponse {
  tasks: Task[];
  totalCount: number;
  completedCount: number;
  pendingCount: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Generic API Response Type
// ============================================================================

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}
