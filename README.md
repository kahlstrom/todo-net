# TodoNet

A modern, full-stack task management application built with .NET Core Web API and React.


## Features

- **User Authentication**: Secure JWT-based authentication with BCrypt password hashing
- **Task Management**: Full CRUD operations for tasks
- **Filtering & Sorting**: Filter by status, priority, due date; sort by multiple fields
- **Modern UI**: Dark theme with glass morphism effects, smooth animations
- **Type Safety**: End-to-end TypeScript on frontend, strongly-typed C# on backend

---

## Quick Start

### Prerequisites

- [.NET 8+ SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- npm (comes with Node.js)

### Backend Setup

```bash
# Navigate to backend
cd backend/TodoApi

# Restore dependencies
dotnet restore

# Apply database migrations (creates SQLite database)
dotnet ef database update

# Run the API (starts on http://localhost:5000)
dotnet run
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend/todo-frontend

# Install dependencies
npm install

# Start development server (starts on http://localhost:3000)
npm start
```

### Verify Setup

1. Backend health: Open http://localhost:5000/api/auth in browser (should return 404 - that's expected, means API is running)
2. Frontend: Open http://localhost:3000 - you should see the login page
3. Register a new account and start managing tasks!

---

## Project Structure

```
todo-net/
├── backend/
│   └── TodoApi/
│       ├── Controllers/       # API endpoints (AuthController, TasksController)
│       ├── Data/              # EF Core DbContext
│       ├── Middleware/        # Custom middleware (exception handling)
│       ├── Models/            # Entities and DTOs
│       ├── Services/          # Business logic (AuthService, TaskService)
│       └── Program.cs         # Application entry point & configuration
│
├── frontend/
│   └── todo-frontend/
│       ├── public/            # Static assets
│       └── src/
│           ├── components/    # React components (UI, forms, task list)
│           ├── context/       # Auth context provider
│           ├── hooks/         # Custom hooks (useAuthSubmit)
│           ├── lib/           # Utilities (cn, date formatting)
│           ├── pages/         # Page components (Login, Register, Home)
│           └── services/      # API client and types
│
└── README.md
```

---

## Architecture & Design Decisions

### Backend

| Decision | Rationale |
|----------|-----------|
| **SQLite** | Zero-config local database. Easy to swap for PostgreSQL/SQL Server in production. |
| **JWT Authentication** | Stateless auth scales horizontally. Tokens include user ID in claims for easy extraction. |
| **BCrypt Hashing** | Industry-standard password hashing with built-in salt generation. |
| **Service Layer Pattern** | Separates business logic from controllers. Makes testing easier and keeps controllers thin. |
| **Global Exception Middleware** | Consistent error responses across all endpoints. Prevents sensitive error details from leaking. |
| **Options Pattern for Config** | Strongly-typed configuration (JwtSettings) instead of magic strings. |

### Frontend

| Decision | Rationale |
|----------|-----------|
| **React 19 + TypeScript** | Type safety catches errors at compile time. Modern React with hooks for clean component logic. |
| **Context API for Auth** | Simple global state for auth. No need for Redux complexity in this app size. |
| **Axios with Interceptors** | Automatic JWT injection, centralized error handling, 401 redirect. |
| **Custom Hooks** | `useAuthSubmit` reduces duplication between Login/Register pages. |
| **Tailwind CSS** | Rapid styling with utility classes. Custom theme variables for consistency. |
| **Radix UI Primitives** | Accessible, unstyled components (Dialog) that we style ourselves. |

---

## Assumptions

1. **Single User Per Session**: The app assumes one user per browser session. No multi-account switching.

2. **Development Environment**: Default configuration targets local development (localhost URLs, SQLite, no HTTPS requirement).

3. **Token Storage**: JWTs stored in localStorage for simplicity. This is acceptable for this app scope but we would likely use httpOnly cookies in an app with larger scope.

4. **No Email Verification**: Users can register with any email. In production, email verification would be essential.

5. **No OAuth Login Options**: For most apps, users prefer to login with OAuth services like Google Login. Setting up
such OAuth patterns did not make sense for an app of this scope.

5. **No Password Reset**: Forgot password flow not implemented. Users would need admin intervention.

6. **Client-Side Validation**: Form validation happens client-side first, with server-side validation as backup. Assumes honest users for most cases.

7. **Priority Values**: Fixed 1-3 priority scale (Low/Medium/High). Not configurable per user.

---

## Scalability Considerations

### Current Limitations

- **SQLite**: Single-writer limitation, file-based storage
- **In-Memory Token Validation**: No token revocation/blacklist
- **No Caching**: Every request hits the database
- **No Pagination**: Task list returns all tasks

### Scaling Path

| Component | Current | Scaled Solution |
|-----------|---------|-----------------|
| **Database** | SQLite | PostgreSQL or SQL Server with read replicas |
| **Caching** | None | Redis for session/token caching |
| **Task List** | All tasks | Cursor-based pagination |
| **Auth** | JWT only | Add refresh tokens, token blacklist in Redis |
| **API** | Single instance | Multiple instances behind load balancer |
| **Static Assets** | Served by React dev server | CDN (CloudFront, Cloudflare) |

### Horizontal Scaling Readiness

The app is **stateless** by design:
- No server-side sessions
- JWT contains all auth info
- Database is the only shared state

This means you can run multiple API instances behind a load balancer today.

---

## Future Improvements

### High Priority

- [ ] **Refresh Tokens**: Current JWTs expire and require re-login. Add refresh token flow.
- [ ] **Pagination**: Implement cursor-based pagination for task lists.
- [ ] **Email Verification**: Verify email addresses on registration.
- [ ] **Password Reset**: Self-service password reset via email.

### Medium Priority

- [ ] **Task Categories/Tags**: Allow users to organize tasks into categories.
- [ ] **Due Date Reminders**: Email or browser notifications for upcoming tasks.
- [ ] **Recurring Tasks**: Tasks that repeat on a schedule.
- [ ] **Task Sharing**: Share tasks or lists with other users.
- [ ] **Search Improvements**: Full-text search with relevance ranking.

### Nice to Have

- [ ] **Dark/Light Theme Toggle**: Currently dark-only; add theme switching.
- [ ] **Keyboard Shortcuts**: Power user navigation (j/k for up/down, etc.).
- [ ] **Offline Support**: Service worker for offline task viewing/creation.
- [ ] **Mobile App**: React Native version sharing business logic.
- [ ] **Drag & Drop Reordering**: Manual task ordering within lists.
- [ ] **Activity Log**: History of task changes.

### Technical Debt

- [ ] **Unit Tests**: Add Jest tests for frontend, xUnit tests for backend.
- [ ] **E2E Tests**: Playwright or Cypress for critical user flows.
- [ ] **CI/CD Pipeline**: GitHub Actions for automated testing and deployment.
- [ ] **Docker Support**: Containerize for consistent deployments.
- [ ] **API Versioning**: Prepare for breaking changes with `/api/v1/` prefix.

---
