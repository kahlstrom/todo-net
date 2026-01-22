using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Models.DTOs;

namespace TodoApi.Services;

/// <summary>
/// Service handling user authentication operations including
/// registration, login, and JWT token generation.
/// </summary>
public interface IAuthService
{
  /// <summary>
  /// Registers a new user with the provided credentials.
  /// </summary>
  /// <param name="request">Registration details</param>
  /// <returns>Authentication response with JWT token, or null if registration fails</returns>
  Task<AuthResponse?> RegisterAsync(RegisterRequest request);

  /// <summary>
  /// Authenticates a user with email and password.
  /// </summary>
  /// <param name="request">Login credentials</param>
  /// <returns>Authentication response with JWT token, or null if login fails</returns>
  Task<AuthResponse?> LoginAsync(LoginRequest request);

  /// <summary>
  /// Checks if an email is already registered.
  /// </summary>
  /// <param name="email">Email to check</param>
  /// <returns>True if email exists, false otherwise</returns>
  Task<bool> EmailExistsAsync(string email);
}

/// <summary>
/// Implementation of authentication service using BCrypt for password
/// hashing and JWT for token-based authentication.
/// </summary>
public class AuthService : IAuthService
{
  private readonly AppDbContext _context;
  private readonly JwtSettings _jwtSettings;
  private readonly ILogger<AuthService> _logger;

  public AuthService(
    AppDbContext context,
    IOptions<JwtSettings> jwtSettings,
    ILogger<AuthService> logger)
  {
    _context = context;
    _jwtSettings = jwtSettings.Value;
    _logger = logger;
  }

  public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
  {
    try
    {
      // Check if email already exists
      if (await EmailExistsAsync(request.Email))
      {
        _logger.LogWarning("Registration failed: Email {Email} already exists", request.Email);
        return null;
      }

      // Create new user with hashed password
      var user = new User
      {
        Email = request.Email.ToLowerInvariant().Trim(),
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
        CreatedAt = DateTime.UtcNow
      };

      _context.Users.Add(user);
      await _context.SaveChangesAsync();

      _logger.LogInformation("User registered successfully: {Email}", user.Email);

      // Generate and return authentication response
      return GenerateAuthResponse(user);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error during user registration for {Email}", request.Email);
      throw;
    }
  }

  public async Task<AuthResponse?> LoginAsync(LoginRequest request)
  {
    try
    {
      // Find user by email (case-insensitive)
      var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant().Trim());

      if (user == null)
      {
        _logger.LogWarning("Login failed: User not found for {Email}", request.Email);
        return null;
      }

      // Verify password
      if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
      {
        _logger.LogWarning("Login failed: Invalid password for {Email}", request.Email);
        return null;
      }

      _logger.LogInformation("User logged in successfully: {Email}", user.Email);

      // Generate and return authentication response
      return GenerateAuthResponse(user);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error during login for {Email}", request.Email);
      throw;
    }
  }

  public async Task<bool> EmailExistsAsync(string email)
  {
    return await _context.Users
      .AnyAsync(u => u.Email == email.ToLowerInvariant().Trim());
  }

  /// <summary>
  /// Generates a JWT token and auth response for the specified user.
  /// </summary>
  private AuthResponse GenerateAuthResponse(User user)
  {
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);

    var claims = new[]
    {
      new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
      new Claim(ClaimTypes.Email, user.Email),
      new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
      new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
    };

    var token = new JwtSecurityToken(
      issuer: _jwtSettings.Issuer,
      audience: _jwtSettings.Audience,
      claims: claims,
      expires: expiresAt,
      signingCredentials: credentials
    );

    return new AuthResponse
    {
      Token = new JwtSecurityTokenHandler().WriteToken(token),
      ExpiresAt = expiresAt,
      User = new UserInfo
      {
        Id = user.Id,
        Email = user.Email
      }
    };
  }
}
