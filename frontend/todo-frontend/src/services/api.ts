import axios, { AxiosError, AxiosInstance } from "axios";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Task,
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskQueryParams,
  ErrorResponse,
  ApiResult,
} from "./types";
import { STORAGE_KEYS } from "./constants";

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Axios instance configured for the Todo API.
 * Includes base URL and interceptors for auth and error handling.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ============================================================================
// Request Interceptor - Add JWT Token
// ============================================================================

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================================
// Response Interceptor - Handle Errors
// ============================================================================

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// Error Handling Helper
// ============================================================================

/**
 * Extracts a user-friendly error message from an Axios error.
 *
 * @param error - The error to process
 * @returns User-friendly error message
 */
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  return "An unexpected error occurred. Please try again.";
}

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
  /**
   * Registers a new user account.
   */
  async register(data: RegisterRequest): Promise<ApiResult<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/register", data);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: getErrorMessage(error) };
    }
  },

  /**
   * Authenticates a user and returns a JWT token.
   */
  async login(data: LoginRequest): Promise<ApiResult<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", data);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: getErrorMessage(error) };
    }
  },
};

// ============================================================================
// Tasks API
// ============================================================================

export const tasksApi = {
  /**
   * Gets all tasks for the authenticated user.
   * Supports filtering and sorting via query params.
   */
  async getTasks(params?: TaskQueryParams): Promise<ApiResult<TaskListResponse>> {
    try {
      const response = await apiClient.get<TaskListResponse>("/tasks", { params });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: getErrorMessage(error) };
    }
  },

  /**
   * Gets a specific task by ID.
   */
  async getTask(id: number): Promise<ApiResult<Task>> {
    try {
      const response = await apiClient.get<Task>(`/tasks/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: getErrorMessage(error) };
    }
  },

  /**
   * Creates a new task.
   */
  async createTask(data: CreateTaskRequest): Promise<ApiResult<Task>> {
    try {
      const response = await apiClient.post<Task>("/tasks", data);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: getErrorMessage(error) };
    }
  },

  /**
   * Updates an existing task.
   */
  async updateTask(id: number, data: UpdateTaskRequest): Promise<ApiResult<Task>> {
    try {
      const response = await apiClient.put<Task>(`/tasks/${id}`, data);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: getErrorMessage(error) };
    }
  },

  /**
   * Deletes a task.
   */
  async deleteTask(id: number): Promise<ApiResult<void>> {
    try {
      await apiClient.delete(`/tasks/${id}`);
      return { data: undefined, error: null };
    } catch (error) {
      return { data: null, error: getErrorMessage(error) };
    }
  },

  /**
   * Toggles the completion status of a task.
   */
  async toggleTask(id: number): Promise<ApiResult<Task>> {
    try {
      const response = await apiClient.patch<Task>(`/tasks/${id}/toggle`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: getErrorMessage(error) };
    }
  },
};

export default apiClient;
