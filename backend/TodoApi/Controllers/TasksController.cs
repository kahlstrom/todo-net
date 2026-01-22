using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Models.DTOs;
using TodoApi.Services;

namespace TodoApi.Controllers;

/// <summary>
/// Controller handling task/todo CRUD operations.
/// All endpoints require authentication.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class TasksController : ControllerBase
{
  private readonly ITaskService _taskService;

  public TasksController(ITaskService taskService)
  {
    _taskService = taskService;
  }

  /// <summary>
  /// Gets the current user's ID from the JWT claims.
  /// </summary>
  private int GetCurrentUserId()
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
    {
      throw new UnauthorizedAccessException("Invalid user token");
    }

    return userId;
  }

  /// <summary>
  /// Gets all tasks for the authenticated user.
  /// Supports filtering by completion status, priority, due date, and search term.
  /// Supports sorting by dueDate, priority, createdAt, or title.
  /// </summary>
  /// <param name="queryParams">Filter and sort parameters</param>
  /// <returns>List of tasks with metadata</returns>
  /// <response code="200">Tasks retrieved successfully</response>
  /// <response code="401">Not authenticated</response>
  [HttpGet]
  [ProducesResponseType(typeof(TaskListResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(StatusCodes.Status401Unauthorized)]
  public async Task<ActionResult<TaskListResponse>> GetTasks([FromQuery] TaskQueryParams queryParams)
  {
    var userId = GetCurrentUserId();
    var result = await _taskService.GetTasksAsync(userId, queryParams);
    return Ok(result);
  }

  /// <summary>
  /// Gets a specific task by ID.
  /// </summary>
  /// <param name="id">Task ID</param>
  /// <returns>The requested task</returns>
  /// <response code="200">Task found</response>
  /// <response code="404">Task not found</response>
  /// <response code="401">Not authenticated</response>
  [HttpGet("{id:int}")]
  [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
  [ProducesResponseType(StatusCodes.Status401Unauthorized)]
  public async Task<ActionResult<TaskResponse>> GetTask(int id)
  {
    var userId = GetCurrentUserId();
    var task = await _taskService.GetTaskByIdAsync(userId, id);

    if (task == null)
    {
      return NotFound(new ErrorResponse { Message = "Task not found" });
    }

    return Ok(task);
  }

  /// <summary>
  /// Creates a new task.
  /// </summary>
  /// <param name="request">Task details</param>
  /// <returns>The created task</returns>
  /// <response code="201">Task created successfully</response>
  /// <response code="400">Invalid request</response>
  /// <response code="401">Not authenticated</response>
  [HttpPost]
  [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status201Created)]
  [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(StatusCodes.Status401Unauthorized)]
  public async Task<ActionResult<TaskResponse>> CreateTask([FromBody] CreateTaskRequest request)
  {
    var userId = GetCurrentUserId();
    var task = await _taskService.CreateTaskAsync(userId, request);

    return CreatedAtAction(
      nameof(GetTask),
      new { id = task.Id },
      task
    );
  }

  /// <summary>
  /// Updates an existing task (partial update supported).
  /// </summary>
  /// <param name="id">Task ID</param>
  /// <param name="request">Fields to update</param>
  /// <returns>The updated task</returns>
  /// <response code="200">Task updated successfully</response>
  /// <response code="404">Task not found</response>
  /// <response code="400">Invalid request</response>
  /// <response code="401">Not authenticated</response>
  [HttpPut("{id:int}")]
  [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
  [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(StatusCodes.Status401Unauthorized)]
  public async Task<ActionResult<TaskResponse>> UpdateTask(int id, [FromBody] UpdateTaskRequest request)
  {
    var userId = GetCurrentUserId();
    var task = await _taskService.UpdateTaskAsync(userId, id, request);

    if (task == null)
    {
      return NotFound(new ErrorResponse { Message = "Task not found" });
    }

    return Ok(task);
  }

  /// <summary>
  /// Deletes a task.
  /// </summary>
  /// <param name="id">Task ID</param>
  /// <response code="204">Task deleted successfully</response>
  /// <response code="404">Task not found</response>
  /// <response code="401">Not authenticated</response>
  [HttpDelete("{id:int}")]
  [ProducesResponseType(StatusCodes.Status204NoContent)]
  [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
  [ProducesResponseType(StatusCodes.Status401Unauthorized)]
  public async Task<IActionResult> DeleteTask(int id)
  {
    var userId = GetCurrentUserId();
    var deleted = await _taskService.DeleteTaskAsync(userId, id);

    if (!deleted)
    {
      return NotFound(new ErrorResponse { Message = "Task not found" });
    }

    return NoContent();
  }

  /// <summary>
  /// Toggles the completion status of a task.
  /// </summary>
  /// <param name="id">Task ID</param>
  /// <returns>The updated task</returns>
  /// <response code="200">Task toggled successfully</response>
  /// <response code="404">Task not found</response>
  /// <response code="401">Not authenticated</response>
  [HttpPatch("{id:int}/toggle")]
  [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
  [ProducesResponseType(StatusCodes.Status401Unauthorized)]
  public async Task<ActionResult<TaskResponse>> ToggleCompletion(int id)
  {
    var userId = GetCurrentUserId();
    var task = await _taskService.ToggleCompletionAsync(userId, id);

    if (task == null)
    {
      return NotFound(new ErrorResponse { Message = "Task not found" });
    }

    return Ok(task);
  }
}
