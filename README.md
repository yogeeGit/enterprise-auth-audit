# Enterprise Asset & Audit Portal

A full-stack web application for managing enterprise assets with secure authentication, role-based access control, asset management, and audit logging.

Built using **React, Node.js, Express, and MySQL**.

## Features

### Authentication & Authorization
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Protected frontend routes.
- Role-Based Access Control (RBAC).
- Two user roles: Admin and Operator.
- Session persistence using sessionStorage.

### Asset Management
- View all registered assets.
- Create new assets (Admin only).
- Update asset status.
- Delete assets (Admin only).
- Search assets by name or serial number.
- Filter assets by status.
- Dashboard summary with asset counts.

### Audit Logging
- Records asset creation, status updates, and deletion.
- Associates audit entries with the authenticated user.
- Uses database transactions for asset operations and their audit records.

## User Roles

| Feature | Admin | Operator |
|---|:---:|:---:|
| View assets | Yes | Yes |
| Create assets | Yes | No |
| Update asset status | Yes | Yes |
| Delete assets | Yes | No |
| Access Admin page | Yes | No |

Public registration creates an Operator account by default. Admin privileges are assigned through a controlled database operation.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router |
| State Management | React Context API, Custom Hooks |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JSON Web Tokens (JWT) |
| Password Security | bcryptjs |
| API Communication | Fetch API, REST APIs |
| Development Tools | VS Code, Postman, MySQL Workbench, Git, GitHub |

## Project Structure

```text
enterprise-auth-audit/
│
├── config/
│   └── db.js
│
├── controllers/
│   └── assetController.js
│
├── middleware/
│   └── authMiddleware.js
│
├── routes/
│   ├── authRoutes.js
│   └── assetRoutes.js
│
├── client/
│   ├── src/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   └── package.json
│
├── .env
├── .gitignore
├── index.js
├── package.json
└── README.md
```

## Database Design

The application uses three relational MySQL tables:

### 1. users
Stores user account information.

- `id` – Primary key
- `email` – Unique email address
- `password_hash` – Hashed password
- `role` – Admin or Operator
- `created_at` – Account creation timestamp

### 2. assets
Stores enterprise asset information.

- `id` – Primary key
- `asset_name` – Asset name
- `serial_number` – Unique asset serial number
- `status` – Available, Assigned, Maintenance, or Retired
- `assigned_to_user_id` – Foreign key referencing users
- `created_at` – Creation timestamp
- `updated_at` – Last update timestamp

### 3. audit_logs
Stores asset operation history.

- `id` – Primary key
- `user_id` – Foreign key referencing users
- `action` – Description of the operation
- `timestamp` – Operation timestamp

**Relationships:**
- One user can be associated with multiple assets.
- One user can generate multiple audit log entries.
- Foreign keys maintain relational integrity.

## Getting Started

### Prerequisites

Install the following before running the application:

- Node.js and npm
- MySQL Server
- MySQL Workbench (recommended)
- Git

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd enterprise-auth-audit
```

### 2. Set up the database

Open MySQL Workbench and execute:

```sql
CREATE DATABASE enterprise_auth_audit;
```

Create the `users`, `assets`, and `audit_logs` tables using the schema defined in the Database Design section and the project's foreign key relationships.

### 3. Configure backend environment variables

Create a `.env` file in the project root:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=enterprise_auth_audit

JWT_SECRET=your_generated_jwt_secret
JWT_EXPIRES_IN=1h
```

Use your own database credentials and a securely generated JWT secret. Never commit `.env` files.

### 4. Install backend dependencies

From the project root:

```bash
npm install
```

Start the backend:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### 5. Configure frontend environment variables

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 6. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the Vite URL:

```text
http://localhost:5173
```

## API Endpoints

Base URL: `http://localhost:5000`

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user | Public |
| POST | `/api/auth/login` | Authenticate a user | Public |

### Asset Management

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/assets` | Retrieve all assets | Admin, Operator |
| POST | `/api/assets` | Create an asset | Admin |
| PATCH | `/api/assets/:id/status` | Update asset status | Admin, Operator |
| DELETE | `/api/assets/:id` | Delete an asset | Admin |

Protected endpoints require a valid JWT:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Security Implementation

- Passwords are hashed using bcrypt before storage.
- JWT tokens are verified through authentication middleware.
- Role-based middleware restricts sensitive operations.
- Parameterized SQL queries help prevent SQL injection.
- Input validation is implemented on the backend.
- Database transactions maintain consistency between asset operations and audit records.
- Environment variables are used for sensitive configuration.

## Testing

The application was manually tested for:

- User registration and login.
- Invalid login credentials.
- Admin and Operator permissions.
- Protected route access.
- Asset creation, status updates, and deletion.
- Search and status filtering.
- Dashboard count updates.
- Session persistence after refresh.
- Audit log creation.
- Unauthorized access attempts.

## Future Enhancements

- Asset assignment workflow.
- Asset creation history and creator tracking.
- Advanced audit log viewer.
- Exportable asset reports.
- Improved session security and token lifecycle management.

## Author

**Yogeshwaran**

Software Engineer

GitHub: [yogeeGit](https://github.com/yogeeGit)

---

*Enterprise Asset & Audit Portal — Full-Stack Development Project*
