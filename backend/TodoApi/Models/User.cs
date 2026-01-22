using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models;

/// <summary>
/// Represents an application user who can own and manage tasks.
/// </summary>
public class User
{
  /// <summary>
  /// Unique identifier for the user.
  /// </summary>
  public int Id { get; set; }

  /// <summary>
  /// User's email address, used for authentication.
  /// </summary>
  [Required]
  [EmailAddress]
  [MaxLength(255)]
  public string Email { get; set; } = string.Empty;

  /// <summary>
  /// BCrypt-hashed password for secure storage.
  /// </summary>
  [Required]
  public string PasswordHash { get; set; } = string.Empty;

  /// <summary>
  /// Timestamp when the user account was created.
  /// </summary>
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  /// <summary>
  /// Navigation property for the user's tasks.
  /// </summary>
  public ICollection<TodoTask> Tasks { get; set; } = new List<TodoTask>();
}
