using System.Net;
using System.Text.Json;
using TodoApi.Models.DTOs;

namespace TodoApi.Middleware;

/// <summary>
/// Global exception handling middleware.
/// Catches unhandled exceptions and returns consistent error responses.
/// </summary>
public class ExceptionMiddleware
{
  private readonly RequestDelegate _next;
  private readonly ILogger<ExceptionMiddleware> _logger;
  private readonly IHostEnvironment _environment;

  public ExceptionMiddleware(
    RequestDelegate next,
    ILogger<ExceptionMiddleware> logger,
    IHostEnvironment environment)
  {
    _next = next;
    _logger = logger;
    _environment = environment;
  }

  public async Task InvokeAsync(HttpContext context)
  {
    try
    {
      await _next(context);
    }
    catch (UnauthorizedAccessException ex)
    {
      _logger.LogWarning(ex, "Unauthorized access attempt");
      await HandleExceptionAsync(context, HttpStatusCode.Unauthorized, "Unauthorized access");
    }
    catch (ArgumentException ex)
    {
      _logger.LogWarning(ex, "Invalid argument provided");
      await HandleExceptionAsync(context, HttpStatusCode.BadRequest, ex.Message);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "An unhandled exception occurred");

      var message = _environment.IsDevelopment()
        ? ex.Message
        : "An unexpected error occurred. Please try again later.";

      await HandleExceptionAsync(context, HttpStatusCode.InternalServerError, message);
    }
  }

  private static async Task HandleExceptionAsync(
    HttpContext context,
    HttpStatusCode statusCode,
    string message)
  {
    context.Response.ContentType = "application/json";
    context.Response.StatusCode = (int)statusCode;

    var response = new ErrorResponse { Message = message };

    var options = new JsonSerializerOptions
    {
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
  }
}

/// <summary>
/// Extension method for registering the exception middleware.
/// </summary>
public static class ExceptionMiddlewareExtensions
{
  public static IApplicationBuilder UseExceptionMiddleware(this IApplicationBuilder app)
  {
    return app.UseMiddleware<ExceptionMiddleware>();
  }
}
