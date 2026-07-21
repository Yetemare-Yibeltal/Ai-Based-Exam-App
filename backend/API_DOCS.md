# HEROY API Documentation

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://heroy-api.railway.app/api`
- Swagger UI: `http://localhost:5000/api/docs`

## Authentication

All protected routes require a Bearer token in the Authorization header:

## Roles

- `student` — Can take quizzes, view scores, leaderboard
- `teacher` — Can create/submit questions, use AI generation
- `admin` — Full access to all resources

## Endpoints

### Auth

| Method | Route                     | Description      | Auth |
| ------ | ------------------------- | ---------------- | ---- |
| POST   | /api/auth/register        | Register student | No   |
| POST   | /api/auth/login           | Login            | No   |
| POST   | /api/auth/logout          | Logout           | Yes  |
| POST   | /api/auth/refresh-token   | Refresh token    | No   |
| POST   | /api/auth/verify-email    | Verify email OTP | No   |
| POST   | /api/auth/forgot-password | Send reset OTP   | No   |
| POST   | /api/auth/reset-password  | Reset password   | No   |
| GET    | /api/auth/me              | Get current user | Yes  |

### Student Quiz

| Method | Route                                | Description      | Auth |
| ------ | ------------------------------------ | ---------------- | ---- |
| GET    | /api/student/quiz/subjects           | Get all subjects | Yes  |
| GET    | /api/student/quiz/questions/:subject | Get questions    | Yes  |
| POST   | /api/student/quiz/start              | Start quiz       | Yes  |
| POST   | /api/student/quiz/submit             | Submit quiz      | Yes  |
| GET    | /api/student/quiz/history            | Quiz history     | Yes  |
| GET    | /api/student/quiz/stats/overview     | Quiz stats       | Yes  |

### Student Scores

| Method | Route                                 | Description     | Auth |
| ------ | ------------------------------------- | --------------- | ---- |
| GET    | /api/student/scores                   | Get all scores  | Yes  |
| GET    | /api/student/scores/:id               | Get score by ID | Yes  |
| GET    | /api/student/scores/summary           | Score summary   | Yes  |
| GET    | /api/student/scores/best              | Best scores     | Yes  |
| GET    | /api/student/scores/subject/:subject  | By subject      | Yes  |
| GET    | /api/student/scores/progress/:subject | Progress        | Yes  |
| DELETE | /api/student/scores/:id               | Delete score    | Yes  |

### Leaderboard

| Method | Route                             | Description        | Auth |
| ------ | --------------------------------- | ------------------ | ---- |
| GET    | /api/leaderboard                  | Global leaderboard | No   |
| GET    | /api/leaderboard/weekly           | Weekly             | No   |
| GET    | /api/leaderboard/monthly          | Monthly            | No   |
| GET    | /api/leaderboard/subject/:subject | By subject         | No   |
| GET    | /api/leaderboard/my-rank          | My rank            | Yes  |

### AI

| Method | Route                      | Description           | Auth         |
| ------ | -------------------------- | --------------------- | ------------ |
| GET    | /api/ai/study-tips         | AI study tips         | Yes(student) |
| GET    | /api/ai/weak-subjects      | Weak subject analysis | Yes(student) |
| POST   | /api/ai/explain-answer     | Explain answer        | Yes(student) |
| POST   | /api/ai/generate-questions | Generate questions    | Yes(teacher) |
| POST   | /api/ai/validate-question  | Validate question     | Yes(teacher) |

### Teacher

| Method | Route                              | Description         | Auth         |
| ------ | ---------------------------------- | ------------------- | ------------ |
| GET    | /api/teacher/questions             | My questions        | Yes(teacher) |
| POST   | /api/teacher/questions             | Create question     | Yes(teacher) |
| POST   | /api/teacher/questions/ai/generate | AI generate         | Yes(teacher) |
| PUT    | /api/teacher/questions/:id/submit  | Submit for approval | Yes(teacher) |

### Admin

| Method | Route                            | Description       | Auth       |
| ------ | -------------------------------- | ----------------- | ---------- |
| GET    | /api/admin/questions/pending     | Pending questions | Yes(admin) |
| PUT    | /api/admin/questions/:id/approve | Approve           | Yes(admin) |
| PUT    | /api/admin/questions/:id/reject  | Reject            | Yes(admin) |
| GET    | /api/admin/users/students        | All students      | Yes(admin) |
| GET    | /api/admin/analytics/overview    | Analytics         | Yes(admin) |
| GET    | /api/admin/reports/students      | Student report    | Yes(admin) |

## Response Format

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## Error Format

```json
{
  "success": false,
  "message": "Error message"
}
```

## Status Codes

- `200` Success
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict
- `422` Validation Error
- `429` Too Many Requests
- `500` Server Error
