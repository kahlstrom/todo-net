using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

namespace TodoApi.Data;

/// <summary>
/// Entity Framework Core database context for the Todo application.
/// Provides access to Users and Tasks tables.
/// </summary>
public class AppDbContext : DbContext
{
  public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
  {
  }

  /// <summary>
  /// Users table - stores application user accounts.
  /// </summary>
  public DbSet<User> Users { get; set; }

  /// <summary>
  /// Tasks table - stores todo items owned by users.
  /// </summary>
  public DbSet<TodoTask> Tasks { get; set; }

  /// <summary>
  /// Configures entity relationships and constraints.
  /// </summary>
  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    // User configuration
    modelBuilder.Entity<User>(entity =>
    {
      // Ensure email uniqueness
      entity.HasIndex(u => u.Email).IsUnique();

      // Configure one-to-many relationship with tasks
      entity.HasMany(u => u.Tasks)
            .WithOne(t => t.User)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    });

    // Task configuration
    modelBuilder.Entity<TodoTask>(entity =>
    {
      // Index on UserId for faster queries
      entity.HasIndex(t => t.UserId);

      // Index on DueDate for sorting/filtering
      entity.HasIndex(t => t.DueDate);

      // Composite index for common query pattern
      entity.HasIndex(t => new { t.UserId, t.IsCompleted });
    });
  }
}
