# 📊 Financial Dashboard API

A robust, highly scalable backend REST API for managing company financial records. This application features strict Role-Based Access Control (RBAC), secure JWT authentication using HTTP-only cookies, and high-performance MongoDB aggregations for real-time dashboard analytics.

🔗 **Live API:** [Deployed on Render](https://zorvyn-assignment-s4lg.onrender.com)
📚 **API Docs (Swagger):** Once the server is running, visit [`/api-docs`](https://zorvyn-assignment-s4lg.onrender.com/api-docs/)

---

## ✨ Key Features

- **Secure Authentication:** JWT (JSON Web Tokens) delivered via HTTP-only cookies to prevent XSS attacks.
- **Role-Based Access Control (RBAC):** Clean middleware separation for `viewer`, `analyst`, and `admin` roles, dynamically dictating what data each user can access or mutate.
- **Advanced Data Aggregations:** MongoDB `$facet`, `$year`, and `$month` operators to calculate multi-dimensional dashboard metrics in a single optimized query.
- **Defensive Programming:** Strict data validation using **Zod v4** and comprehensive protection against IDOR vulnerabilities.
- **Centralized Error Handling:** Global Express error handler ensuring the client always receives clean, predictable JSON responses.
- **Interactive API Documentation:** Swagger UI integrated at `/api-docs` for exploring and testing all endpoints.

---

## 🏗️ Architectural & Business Logic Decisions

1. **The "Company Dashboard" Model:**
   - `Viewers` are restricted to viewing only their own personal financial data.
   - `Analysts` and `Admins` are granted access to company-wide aggregate data, with the ability to filter down to specific `userId`s if needed.

2. **IDOR Protection & Admin Bypass:**
   - For `PUT` and `DELETE` record operations, users are strictly locked to modifying only their own records. `Admins` bypass this check, allowing them to manage records across the entire organization.

3. **Strict Registration Validation (Preventing Privilege Escalation):**
   - The public `/auth/register` endpoint uses Zod's `.strict()` method — if a malicious user attempts to pass a `"role": "admin"` field, the request is instantly rejected.
   - A separate, protected `/auth/employees` endpoint exists exclusively for Admins to create elevated accounts.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express.js v5** | Web Framework |
| **TypeScript** | Language |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **Zod v4** | Request Validation |
| **JWT & bcrypt** | Authentication |
| **Swagger UI** | API Documentation |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas URI)

### 1. Clone & Install

```bash
git clone https://github.com/Samyaka13/Zorvyn_Assignment.git
cd Zorvyn_Assignment
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/financial-db
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_super_secret_access_token
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token
REFRESH_TOKEN_EXPIRY=10d
```

### 3. Run the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

The server will start at `http://localhost:8000`. Visit `http://localhost:8000/api-docs` for the Swagger documentation.

---

## 📂 Project Structure

```
src/
├── controllers/       # Route logic and database interactions
│   ├── auth.controller.ts
│   ├── dashboard.controller.ts
│   └── record.controller.ts
├── db/                # Database connection setup
├── middlewares/       # Express middlewares (Auth, Roles, Error Handling)
├── models/            # Mongoose schemas (User, FinancialRecord)
├── routes/            # API route definitions
├── types/             # TypeScript type declarations
├── utils/             # Helper classes (ApiError, ApiResponse, asyncHandler)
├── validators/        # Zod schemas for strict request validation
├── app.ts             # Express app configuration & Swagger setup
└── index.ts           # Server entry point & DB connection
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user (default: `viewer`) | ❌ |
| `POST` | `/api/v1/auth/login` | Login & receive HTTP-only cookies | ❌ |
| `GET` | `/api/v1/auth/me` | Get current user profile | ✅ |
| `POST` | `/api/v1/auth/logout` | Logout & clear cookies | ✅ |
| `POST` | `/api/v1/auth/employees` | Create employee (admin only) | ✅ Admin |

### Financial Records

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/records` | Create a financial record | ✅ |
| `GET` | `/api/v1/records` | Get all records (filtered by role) | ✅ |
| `PUT` | `/api/v1/records/:id` | Update a record | ✅ Owner/Admin |
| `DELETE` | `/api/v1/records/:id` | Delete a record | ✅ Owner/Admin |

### Dashboard

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/dashboard/summary` | Get financial summary | ✅ |
| `GET` | `/api/v1/dashboard/trends` | Get monthly income/expense trends | ✅ |

---

## 👥 Roles & Permissions

| Permission | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View own records | ✅ | ✅ | ✅ |
| View all records | ❌ | ✅ | ✅ |
| Create records | ✅ | ✅ | ✅ |
| Edit/Delete own records | ✅ | ✅ | ✅ |
| Edit/Delete any record | ❌ | ❌ | ✅ |
| View company-wide dashboard | ❌ | ✅ | ✅ |
| Create employee accounts | ❌ | ❌ | ✅ |
