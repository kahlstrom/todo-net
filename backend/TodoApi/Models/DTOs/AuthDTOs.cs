using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models.DTOs;

/// <summary>
/// Request payload for user registration.
/// </summary>
public class RegisterRequest
{
  /// <summary>
  /// User's email address (must be unique).
  /// </summary>
  [Required(ErrorMessage = "Email is required")]
  [EmailAddress(ErrorMessage = "Invalid email format")]
  [MaxLength(255)]
  public string Email { get; set; } = string.Empty;

  /// <summary>
  /// User's password (minimum 8 characters).
  /// </summary>
  [Required(ErrorMessage = "Password is required")]
  [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
  [MaxLength(100)]
  public string Password { get; set; } = string.Empty;

  /// <summary>
  /// Password confirmation (must match Password).
  /// </summary>
  [Required(ErrorMessage = "Password confirmation is required")]
  [Compare(nameof(Password), ErrorMessage = "Passwords do not match")]
  public string ConfirmPassword { get; set; } = string.Empty;
}

/// <summary>
/// Request payload for user login.
/// </summary>
public class LoginRequest
{
  /// <summary>
  /// User's email address.
  /// </summary>
  [Required(ErrorMessage = "Email is required")]
  [EmailAddress(ErrorMessage = "Invalid email format")]
  public string Email { get; set; } = string.Empty;

  /// <summary>
  /// User's password.
  /// </summary>
  [Required(ErrorMessage = "Password is required")]
  public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Response payload for successful authentication.
/// </summary>
public class AuthResponse
{
  /// <summary>
  /// JWT token for authenticating subsequent requests.
  /// </summary>
  public string Token { get; set; } = string.Empty;

  /// <summary>
  /// Token expiration time (UTC).
  /// </summary>
  public DateTime ExpiresAt { get; set; }

  /// <summary>
  /// Basic user information.
  /// </summary>
  public UserInfo User { get; set; } = new();
}

/// <summary>
/// Basic user information returned in auth responses.
/// </summary>
public class UserInfo
{
  public int Id { get; set; }
  public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Standard error response format.
/// </summary>
public class ErrorResponse
{
  public string Message { get; set; } = string.Empty;
  public Dictionary<string, string[]>? Errors { get; set; }
}
