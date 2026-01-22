namespace TodoApi.Models;

/// <summary>
/// Strongly-typed configuration for JWT authentication settings.
/// Bound from appsettings.json "JwtSettings" section.
/// </summary>
public class JwtSettings
{
  /// <summary>
  /// Configuration section name in appsettings.json.
  /// </summary>
  public const string SectionName = "JwtSettings";

  /// <summary>
  /// Secret key used for signing JWT tokens.
  /// Must be at least 32 characters for HS256.
  /// </summary>
  public string SecretKey { get; set; } = string.Empty;

  /// <summary>
  /// Token issuer (typically the API URL or name).
  /// </summary>
  public string Issuer { get; set; } = "TodoApi";

  /// <summary>
  /// Token audience (typically the frontend app).
  /// </summary>
  public string Audience { get; set; } = "TodoFrontend";

  /// <summary>
  /// Token expiration time in minutes.
  /// </summary>
  public int ExpirationMinutes { get; set; } = 60;
}
