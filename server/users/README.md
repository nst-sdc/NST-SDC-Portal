# Users API Documentation

This document lists the available API endpoints in the `users` app.

## Base URL
### Server Start Command
```bash
.venv/bin/python manage.py runserver
```
All paths below are relative to the server base URL (e.g., `http://127.0.0.1:8000`).

## Endpoints

### 1. System Status

Check if the API is running and reachable.

- **URL:** `/api/test/`
- **Method:** `GET`
- **Permissions:** Public (No authentication required)
- **Response:**
  ```json
  {
    "message": "API is working successfully!",
    "status": "active"
  }
  ```

### 2. User Profile

Get the detailed profile of the currently logged-in user.

- **URL:** `/api/user/profile/`
- **Method:** `GET`
- **Permissions:** Authenticated (Requires valid session or token)
- **Response:** JSON object containing user details (username, email, points, student_id, etc.)

### 3. User Management (CRUD)

Full Create, Read, Update, Delete access for user accounts.

- **URL:** `/api/users/`
- **Permissions:** `IsAdminUser` (Admin only)
- **Methods:**

  - `GET`: List all users.
  - `POST`: Create a new user.

- **URL:** `/api/users/<id>/`
- **Permissions:** `IsAdminUser` (Admin only)
- **Methods:**
  - `GET`: Retrieve details of a specific user.
  - `PUT`: Update a user (full update).
  - `PATCH`: Update a user (partial update).
  - `DELETE`: Delete a user.
