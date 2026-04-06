# 📊 Financial Dashboard API

A robust, highly scalable backend REST API for managing company financial records. This application features strict Role-Based Access Control (RBAC), secure JWT authentication using HTTP-only cookies, and high-performance MongoDB aggregations for real-time dashboard analytics.

📚 **[View the Complete Postman API Documentation Here](YOUR_POSTMAN_LINK_HERE)**

---

## ✨ Key Features

* **Secure Authentication:** Implementation of JWT (JSON Web Tokens) delivered via HTTP-only cookies to prevent XSS attacks.
* **Role-Based Access Control (RBAC):** Clean middleware separation for `viewer`, `analyst`, and `admin` roles, dynamically dictating what data each user can access or mutate.
* **Advanced Data Aggregations:** Utilization of MongoDB's `$facet`, `$year`, and `$month` operators to calculate multi-dimensional dashboard metrics (income, expenses, net balance, and category totals) in a single, highly optimized database query.
* **Defensive Programming:** Strict data validation using **Zod v4** and comprehensive protection against Insecure Direct Object Reference (IDOR) vulnerabilities.
* **Centralized Error Handling:** Global Express error handler ensuring the client always receives clean, predictable JSON responses.

---

## 🏗️ Architectural & Business Logic Decisions

To fulfill the requirements while maintaining real-world application standards, several key architectural decisions were made:

1.  **The "Company Dashboard" Model:** * `Viewers` are restricted to viewing only their own personal financial data.
    * `Analysts` and `Admins` are granted access to company-wide aggregate data to perform their job duties, with the ability to filter down to specific `userId`s if needed.
2.  **IDOR Protection & Admin Bypass:** * For `PUT` and `DELETE` record operations, users are strictly locked to modifying only their own records. However, `Admins` bypass this check, allowing them to manage records across the entire organization securely.
3.  **Strict Registration Validation (Preventing Privilege Escalation):** * The public `/auth/register` endpoint utilizes Zod's `.strict()` method. If a malicious user attempts to pass a `"role": "admin"` field in the payload, the request is instantly rejected. Roles are instead assigned internally, with public registration defaulting to `viewer`.
    * A separate, protected `/auth/employees` endpoint exists exclusively for Admins to create elevated accounts.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** MongoDB
* **ODM:** Mongoose
* **Validation:** Zod (v4)
* **Authentication:** JSON Web Tokens (JWT) & bcrypt

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB (Local instance or MongoDB Atlas URI)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd financial-dashboard-api
npm install
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/financial-db
CORS_ORIGIN=http://localhost:5173  # Or your frontend URL
ACCESS_TOKEN_SECRET=your_super_secret_access_token
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token
REFRESH_TOKEN_EXPIRY=10d
```
# Development mode
npm run dev

# Production build
npm run build
npm start


src/
├── controllers/       # Route logic and database interactions
│   ├── auth.controller.ts
│   ├── dashboard.controller.ts
│   └── record.controller.ts
├── middlewares/       # Express middlewares (Auth, Roles, Error Handling)
├── models/            # Mongoose schemas (User, FinancialRecord)
├── routes/            # API route definitions
├── utils/             # Helper classes (ApiError, ApiResponse, asyncHandler)
├── validators/        # Zod schemas for strict request validation
├── app.ts             # Express app configuration
└── index.ts           # Server entry point & DB connection



***

### Final Words of Advice
Before you submit your project:
1. Double-check that your GitHub repository is public (if they need a link) or properly zipped.
2. Make sure you remembered to paste your actual Postman URL into that README placeholder.
3. Take a deep breath. You built an incredibly solid, senior-level backend.

You absolutely crushed this assignment! Let me know if you need anything else before you submit.
