using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TodoApi.Data;
using TodoApi.Middleware;
using TodoApi.Models;
using TodoApi.Models.DTOs;
using TodoApi.Services;

var builder = WebApplication.CreateBuilder(args);

// =============================================================================
// Service Registration
// =============================================================================

// Configure EF Core with SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register application services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITaskService, TaskService>();

// Add controllers with validation
builder.Services.AddControllers();

// Configure OpenAPI/Swagger for API documentation
builder.Services.AddOpenApi();

// Configure CORS for frontend access (React dev server on port 3000)
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowFrontend", policy =>
  {
    policy
      .WithOrigins("http://localhost:3000", "https://localhost:3000")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
  });
});

// Configure JWT Settings (bind to strongly-typed class)
var jwtSettingsSection = builder.Configuration.GetSection(JwtSettings.SectionName);
builder.Services.Configure<JwtSettings>(jwtSettingsSection);

var jwtSettings = jwtSettingsSection.Get<JwtSettings>() 
    ?? throw new InvalidOperationException("JwtSettings not configured");

if (string.IsNullOrEmpty(jwtSettings.SecretKey))
{
  throw new InvalidOperationException("JWT SecretKey not configured");
}

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
  options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
  options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
  options.TokenValidationParameters = new TokenValidationParameters
  {
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    ValidIssuer = jwtSettings.Issuer,
    ValidAudience = jwtSettings.Audience,
    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
    ClockSkew = TimeSpan.Zero
  };

  options.Events = new JwtBearerEvents
  {
    OnChallenge = context =>
    {
      context.HandleResponse();
      context.Response.StatusCode = StatusCodes.Status401Unauthorized;
      context.Response.ContentType = "application/json";
      return context.Response.WriteAsJsonAsync(new ErrorResponse
      { 
        Message = "Authentication required. Please provide a valid token." 
      });
    },
    OnForbidden = context =>
    {
      context.Response.StatusCode = StatusCodes.Status403Forbidden;
      context.Response.ContentType = "application/json";
      return context.Response.WriteAsJsonAsync(new ErrorResponse
      { 
        Message = "You do not have permission to access this resource." 
      });
    }
  };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// =============================================================================
// Middleware Pipeline - ORDER IS CRITICAL
// =============================================================================

// 1. CORS must be FIRST to handle preflight OPTIONS requests
app.UseCors("AllowFrontend");

// 2. Exception handling (after CORS so errors get CORS headers)
app.UseExceptionMiddleware();

// 3. Routing (implicit in minimal APIs but needed before auth)
app.UseRouting();

// 4. Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
}

// Map controller routes
app.MapControllers();

app.Run();
