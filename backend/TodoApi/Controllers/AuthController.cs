using Microsoft.AspNetCore.Mvc;
using TodoApi.Models.DTOs;
using TodoApi.Services;

namespace TodoApi.Controllers;

/// <summary>
/// Controller handling user authentication endpoints.
/// Provides registration and login functionality.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
  private readonly IAuthService _authService;

  public AuthController(IAuthService authService)
  {
    _authService = authService;
  }

  /// <summary>
  /// Registers a new user account.
  /// </summary>
  /// <param name="request">Registration details including email and password</param>
  /// <returns>JWT token and user info on success</returns>
  /// <response code="201">User created successfully</response>
  /// <response code="400">Invalid request or validation errors</response>
  /// <response code="409">Email already registered</response>
  [HttpPost("register")]
  [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
  [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
  public async Task<IActionResult> Register([FromBody] RegisterRequest request)
  {
    var result = await _authService.RegisterAsync(request);

    if (result == null)
    {
      // Service returns null if email already exists or registration fails
      return Conflict(new ErrorResponse 
      { 
        Message = "An account with this email already exists" 
      });
    }

    return CreatedAtAction(
      nameof(Register), 
      new { id = result.User.Id }, 
      result
    );
  }

  /// <summary>
  /// Authenticates a user and returns a JWT token.
  /// </summary>
  /// <param name="request">Login credentials</param>
  /// <returns>JWT token and user info on success</returns>
  /// <response code="200">Login successful</response>
  /// <response code="401">Invalid credentials</response>
  [HttpPost("login")]
  [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
  public async Task<IActionResult> Login([FromBody] LoginRequest request)
  {
    var result = await _authService.LoginAsync(request);

    if (result == null)
    {
      // Generic message to avoid revealing whether email exists
      return Unauthorized(new ErrorResponse 
      { 
        Message = "Invalid email or password" 
      });
    }

    return Ok(result);
  }
}
