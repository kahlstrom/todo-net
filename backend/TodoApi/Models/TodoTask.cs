using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TodoApi.Models;

/// <summary>
/// Represents a task/todo item owned by a user.
/// Named TodoTask to avoid conflict with System.Threading.Tasks.Task.
/// </summary>
public class TodoTask
{
  /// <summary>
  /// Unique identifier for the task.
  /// </summary>
  public int Id { get; set; }

  /// <summary>
  /// Foreign key to the owning user.
  /// </summary>
  [Required]
  public int UserId { get; set; }

  /// <summary>
  /// Navigation property to the owning user.
  /// </summary>
  [ForeignKey(nameof(UserId))]
  public User? User { get; set; }

  /// <summary>
  /// Brief title/summary of the task.
  /// </summary>
  [Required]
  [MaxLength(200)]
  public string Title { get; set; } = string.Empty;

  /// <summary>
  /// Detailed description of the task (optional).
  /// </summary>
  [MaxLength(2000)]
  public string? Description { get; set; }

  /// <summary>
  /// Optional due date for the task.
  /// </summary>
  public DateTime? DueDate { get; set; }

  /// <summary>
  /// Priority level: 1 = Low, 2 = Medium, 3 = High.
  /// Defaults to Medium.
  /// </summary>
  [Range(1, 3)]
  public int Priority { get; set; } = 2;

  /// <summary>
  /// Whether the task has been completed.
  /// </summary>
  public bool IsCompleted { get; set; } = false;

  /// <summary>
  /// Timestamp when the task was created.
  /// </summary>
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  /// <summary>
  /// Timestamp when the task was last updated.
  /// </summary>
  public DateTime? UpdatedAt { get; set; }
}
