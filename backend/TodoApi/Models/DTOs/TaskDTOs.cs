using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models.DTOs;

/// <summary>
/// Request payload for creating a new task.
/// </summary>
public class CreateTaskRequest
{
  /// <summary>
  /// Task title (required, max 200 chars).
  /// </summary>
  [Required(ErrorMessage = "Title is required")]
  [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
  public string Title { get; set; } = string.Empty;

  /// <summary>
  /// Optional detailed description (max 2000 chars).
  /// </summary>
  [MaxLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
  public string? Description { get; set; }

  /// <summary>
  /// Optional due date for the task.
  /// </summary>
  public DateTime? DueDate { get; set; }

  /// <summary>
  /// Priority level: 1 = Low, 2 = Medium, 3 = High.
  /// Defaults to Medium (2).
  /// </summary>
  [Range(1, 3, ErrorMessage = "Priority must be 1 (Low), 2 (Medium), or 3 (High)")]
  public int Priority { get; set; } = 2;
}

/// <summary>
/// Request payload for updating an existing task.
/// All fields are optional - only provided fields will be updated.
/// </summary>
public class UpdateTaskRequest
{
  /// <summary>
  /// Updated task title.
  /// </summary>
  [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
  public string? Title { get; set; }

  /// <summary>
  /// Updated description.
  /// </summary>
  [MaxLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
  public string? Description { get; set; }

  /// <summary>
  /// Updated due date.
  /// </summary>
  public DateTime? DueDate { get; set; }

  /// <summary>
  /// Updated priority level.
  /// </summary>
  [Range(1, 3, ErrorMessage = "Priority must be 1 (Low), 2 (Medium), or 3 (High)")]
  public int? Priority { get; set; }

  /// <summary>
  /// Updated completion status.
  /// </summary>
  public bool? IsCompleted { get; set; }
}

/// <summary>
/// Response payload representing a task.
/// </summary>
public class TaskResponse
{
  public int Id { get; set; }
  public string Title { get; set; } = string.Empty;
  public string? Description { get; set; }
  public DateTime? DueDate { get; set; }
  public int Priority { get; set; }
  public string PriorityLabel => Priority switch
  {
    1 => "Low",
    2 => "Medium",
    3 => "High",
    _ => "Unknown"
  };
  public bool IsCompleted { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Query parameters for filtering and sorting tasks.
/// </summary>
public class TaskQueryParams
{
  /// <summary>
  /// Filter by completion status.
  /// </summary>
  public bool? IsCompleted { get; set; }

  /// <summary>
  /// Filter by priority level (1, 2, or 3).
  /// </summary>
  [Range(1, 3)]
  public int? Priority { get; set; }

  /// <summary>
  /// Filter tasks due before this date.
  /// </summary>
  public DateTime? DueBefore { get; set; }

  /// <summary>
  /// Filter tasks due after this date.
  /// </summary>
  public DateTime? DueAfter { get; set; }

  /// <summary>
  /// Search in title and description.
  /// </summary>
  [MaxLength(100)]
  public string? Search { get; set; }

  /// <summary>
  /// Sort by field: "dueDate", "priority", "createdAt", "title".
  /// Defaults to "createdAt".
  /// </summary>
  public string SortBy { get; set; } = "createdAt";

  /// <summary>
  /// Sort direction: "asc" or "desc".
  /// Defaults to "desc".
  /// </summary>
  public string SortDirection { get; set; } = "desc";
}

/// <summary>
/// Response containing a list of tasks with metadata.
/// </summary>
public class TaskListResponse
{
  public IEnumerable<TaskResponse> Tasks { get; set; } = new List<TaskResponse>();
  public int TotalCount { get; set; }
  public int CompletedCount { get; set; }
  public int PendingCount { get; set; }
}
