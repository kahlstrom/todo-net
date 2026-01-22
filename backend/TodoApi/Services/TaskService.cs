using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Models.DTOs;

namespace TodoApi.Services;

/// <summary>
/// Service handling task/todo CRUD operations and business logic.
/// </summary>
public interface ITaskService
{
  /// <summary>
  /// Gets all tasks for a user with optional filtering and sorting.
  /// </summary>
  Task<TaskListResponse> GetTasksAsync(int userId, TaskQueryParams queryParams);

  /// <summary>
  /// Gets a specific task by ID for a user.
  /// </summary>
  Task<TaskResponse?> GetTaskByIdAsync(int userId, int taskId);

  /// <summary>
  /// Creates a new task for a user.
  /// </summary>
  Task<TaskResponse> CreateTaskAsync(int userId, CreateTaskRequest request);

  /// <summary>
  /// Updates an existing task.
  /// </summary>
  Task<TaskResponse?> UpdateTaskAsync(int userId, int taskId, UpdateTaskRequest request);

  /// <summary>
  /// Deletes a task.
  /// </summary>
  Task<bool> DeleteTaskAsync(int userId, int taskId);

  /// <summary>
  /// Toggles task completion status.
  /// </summary>
  Task<TaskResponse?> ToggleCompletionAsync(int userId, int taskId);
}

/// <summary>
/// Implementation of task service with EF Core data access.
/// </summary>
public class TaskService : ITaskService
{
  private readonly AppDbContext _context;
  private readonly ILogger<TaskService> _logger;

  public TaskService(AppDbContext context, ILogger<TaskService> logger)
  {
    _context = context;
    _logger = logger;
  }

  public async Task<TaskListResponse> GetTasksAsync(int userId, TaskQueryParams queryParams)
  {
    // Start with user's tasks
    var query = _context.Tasks
      .Where(t => t.UserId == userId)
      .AsQueryable();

    // Apply filters
    query = ApplyFilters(query, queryParams);

    // Get counts before sorting/limiting
    var totalCount = await query.CountAsync();
    var completedCount = await query.CountAsync(t => t.IsCompleted);
    var pendingCount = totalCount - completedCount;

    // Apply sorting
    query = ApplySorting(query, queryParams);

    // Execute query and map to response
    var tasks = await query
      .Select(t => MapToResponse(t))
      .ToListAsync();

    return new TaskListResponse
    {
      Tasks = tasks,
      TotalCount = totalCount,
      CompletedCount = completedCount,
      PendingCount = pendingCount
    };
  }

  public async Task<TaskResponse?> GetTaskByIdAsync(int userId, int taskId)
  {
    var task = await GetUserTaskAsync(userId, taskId);
    return task == null ? null : MapToResponse(task);
  }

  public async Task<TaskResponse> CreateTaskAsync(int userId, CreateTaskRequest request)
  {
    var task = new TodoTask
    {
      UserId = userId,
      Title = request.Title.Trim(),
      Description = request.Description?.Trim(),
      DueDate = request.DueDate,
      Priority = request.Priority,
      IsCompleted = false,
      CreatedAt = DateTime.UtcNow
    };

    _context.Tasks.Add(task);
    await _context.SaveChangesAsync();

    _logger.LogInformation("Task created: {TaskId} for user {UserId}", task.Id, userId);

    return MapToResponse(task);
  }

  public async Task<TaskResponse?> UpdateTaskAsync(int userId, int taskId, UpdateTaskRequest request)
  {
    var task = await GetUserTaskAsync(userId, taskId);
    if (task == null)
    {
      return null;
    }

    // Update only provided fields (partial update pattern)
    if (request.Title != null)
    {
      task.Title = request.Title.Trim();
    }

    if (request.Description != null)
    {
      task.Description = request.Description.Trim();
    }

    if (request.DueDate.HasValue)
    {
      task.DueDate = request.DueDate.Value;
    }

    if (request.Priority.HasValue)
    {
      task.Priority = request.Priority.Value;
    }

    if (request.IsCompleted.HasValue)
    {
      task.IsCompleted = request.IsCompleted.Value;
    }

    task.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    _logger.LogInformation("Task updated: {TaskId} for user {UserId}", taskId, userId);

    return MapToResponse(task);
  }

  public async Task<bool> DeleteTaskAsync(int userId, int taskId)
  {
    var task = await GetUserTaskAsync(userId, taskId);
    if (task == null)
    {
      return false;
    }

    _context.Tasks.Remove(task);
    await _context.SaveChangesAsync();

    _logger.LogInformation("Task deleted: {TaskId} for user {UserId}", taskId, userId);

    return true;
  }

  public async Task<TaskResponse?> ToggleCompletionAsync(int userId, int taskId)
  {
    var task = await GetUserTaskAsync(userId, taskId);
    if (task == null)
    {
      return null;
    }

    task.IsCompleted = !task.IsCompleted;
    task.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    _logger.LogInformation(
      "Task {TaskId} completion toggled to {IsCompleted} for user {UserId}",
      taskId, task.IsCompleted, userId);

    return MapToResponse(task);
  }

  /// <summary>
  /// Applies filter conditions to the query based on query parameters.
  /// </summary>
  private static IQueryable<TodoTask> ApplyFilters(
    IQueryable<TodoTask> query,
    TaskQueryParams queryParams)
  {
    if (queryParams.IsCompleted.HasValue)
    {
      query = query.Where(t => t.IsCompleted == queryParams.IsCompleted.Value);
    }

    if (queryParams.Priority.HasValue)
    {
      query = query.Where(t => t.Priority == queryParams.Priority.Value);
    }

    if (queryParams.DueBefore.HasValue)
    {
      query = query.Where(t => t.DueDate != null && t.DueDate <= queryParams.DueBefore.Value);
    }

    if (queryParams.DueAfter.HasValue)
    {
      query = query.Where(t => t.DueDate != null && t.DueDate >= queryParams.DueAfter.Value);
    }

    if (!string.IsNullOrWhiteSpace(queryParams.Search))
    {
      var searchTerm = queryParams.Search.ToLower();
      query = query.Where(t =>
        t.Title.ToLower().Contains(searchTerm) ||
        (t.Description != null && t.Description.ToLower().Contains(searchTerm)));
    }

    return query;
  }

  /// <summary>
  /// Applies sorting to the query based on query parameters.
  /// </summary>
  private static IQueryable<TodoTask> ApplySorting(
    IQueryable<TodoTask> query,
    TaskQueryParams queryParams)
  {
    var isDescending = queryParams.SortDirection.ToLower() == "desc";

    return queryParams.SortBy.ToLower() switch
    {
      "duedate" => isDescending
        ? query.OrderByDescending(t => t.DueDate)
        : query.OrderBy(t => t.DueDate),

      "priority" => isDescending
        ? query.OrderByDescending(t => t.Priority)
        : query.OrderBy(t => t.Priority),

      "title" => isDescending
        ? query.OrderByDescending(t => t.Title)
        : query.OrderBy(t => t.Title),

      // Default: createdAt
      _ => isDescending
        ? query.OrderByDescending(t => t.CreatedAt)
        : query.OrderBy(t => t.CreatedAt)
    };
  }

  /// <summary>
  /// Retrieves a task by ID, ensuring it belongs to the specified user.
  /// </summary>
  /// <param name="userId">The user's ID</param>
  /// <param name="taskId">The task's ID</param>
  /// <returns>The task entity, or null if not found or unauthorized</returns>
  private async Task<TodoTask?> GetUserTaskAsync(int userId, int taskId)
  {
    return await _context.Tasks
      .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
  }

  /// <summary>
  /// Maps a TodoTask entity to a TaskResponse DTO.
  /// </summary>
  private static TaskResponse MapToResponse(TodoTask task)
  {
    return new TaskResponse
    {
      Id = task.Id,
      Title = task.Title,
      Description = task.Description,
      DueDate = task.DueDate,
      Priority = task.Priority,
      IsCompleted = task.IsCompleted,
      CreatedAt = task.CreatedAt,
      UpdatedAt = task.UpdatedAt
    };
  }
}
