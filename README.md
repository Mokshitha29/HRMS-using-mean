# HRMS - Human Resource Management System (MEAN Stack)

A complete, beginner-friendly, and functional Human Resource Management System (HRMS) built from scratch using the **MEAN Stack** (MongoDB, Express.js, Angular, and Node.js) with Bootstrap 5.

## 🚀 Deployment

- **Frontend:** [HRMS Live Application](https://hrms-frontend-seven-mu.vercel.app)
- **Backend:** [HRMS REST API](https://hrms-backend-jab9.onrender.com)
- **Database:** MongoDB Atlas
---

## 1. Project Overview

The **HRMS** web application provides an intuitive and centralized portal for managing core human resource functions:
- **Employee Lifecycle**: Personnel onboarding, directory search, profile viewing, updates, and records maintenance.
- **Attendance Logging**: Daily check-in/check-out tracking with status tags (Present, Absent, Half Day, Leave).
- **Leave Management**: Employee leave requests and administrative approval/rejection workflows.
- **Payroll Disbursement**: Monthly compensation computation with net salary calculations (`Basic + Allowances - Deductions`) and disbursement status tracking.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `ADMIN`, `HR`, and `EMPLOYEE`.

---

## 2. Key Features

- **Authentication & JWT Security**: Secure signup and login using hashed passwords (`bcryptjs`) and JSON Web Tokens (JWT).
- **HTTP Interceptor**: Automatic `Authorization: Bearer <token>` injection into all outgoing Angular requests.
- **Role-Based Authorization**:
  - **ADMIN**: Unrestricted management across employees, attendance, leaves, payroll, and metrics.
  - **HR**: Manage staff records, log attendance, approve/reject leaves, and generate payroll.
  - **EMPLOYEE**: Self-service portal to view personal profile, track attendance, apply for leaves, and inspect monthly payroll slips.
- **Interactive Dashboard**: Real-time statistical metric cards (Active Employees, Present Today, Pending Leaves, Approved Leaves, Payroll Records) and recent activities.
- **Reactive Forms & Validation**: Strict form validation for emails, phone numbers, numeric limits, and required inputs.
- **Dynamic Search & Filtering**: Multi-criteria filters by employee name/ID, department, month, and status.

---

## 3. Technology Stack

- **Frontend**:
  - **Angular** (v17+) - Standalone component architecture
  - **TypeScript** - Strongly-typed application code
  - **HTML5 & CSS3** - Responsive, semantic layouts
  - **Bootstrap 5** & **Bootstrap Icons** - Clean UI styling, tables, modals, badges, and cards
  - **RxJS** - Reactive streams and state handling
- **Backend**:
  - **Node.js** - Server runtime environment
  - **Express.js** - RESTful API routing and middleware
  - **JSON Web Token (`jsonwebtoken`)** - Stateless token authentication
  - **bcryptjs** - Cryptographic salt-hashing for passwords
  - **cors** & **dotenv** - Cross-origin sharing and environment management
- **Database**:
  - **MongoDB** - Document-based NoSQL database
  - **Mongoose** - Object Data Modeling (ODM) with schemas and validations

---

## 4. Project Structure

```
hrms/
│
├── client/                                    # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── navbar/                    # Top navigation & user profile badge
│   │   │   │   ├── sidebar/                   # Responsive navigation bar
│   │   │   │   └── footer/                    # Global footer
│   │   │   ├── pages/
│   │   │   │   ├── login/                     # Sign in with demo account shortcuts
│   │   │   │   ├── register/                  # User account creation
│   │   │   │   ├── dashboard/                 # Metrics and recent activity feed
│   │   │   │   ├── employees/                 # List, Add, Edit, and View profile
│   │   │   │   ├── attendance/                # Daily attendance tracking & filter
│   │   │   │   ├── leaves/                    # Applications & approval workflow
│   │   │   │   └── payroll/                   # Salary calculation & payment status
│   │   │   ├── services/                      # API client services
│   │   │   ├── guards/                        # AuthGuard & RoleGuard
│   │   │   ├── interceptors/                  # JWT Bearer HttpInterceptor
│   │   │   └── models/                        # TypeScript interfaces
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── main.ts
│   ├── angular.json
│   ├── tsconfig.json
│   └── package.json
│
├── server/                                    # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                              # Mongoose connection logic
│   ├── models/                                # Mongoose data schemas
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   └── Payroll.js
│   ├── controllers/                           # Business logic
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── payrollController.js
│   │   └── dashboardController.js
│   ├── routes/                                # Express route endpoints
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── payrollRoutes.js
│   │   └── dashboardRoutes.js
│   ├── middleware/                            # Auth & role verification
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── scripts/
│   │   └── seed.js                            # Sample database seeder
│   ├── .env                                   # Config file (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example
│   ├── package.json
│   └── server.js                              # Express app entrypoint
│
└── README.md
```

---

## 5. MongoDB Setup

You can connect to either a local MongoDB instance or a free MongoDB Atlas cloud cluster:

### Option A: Local MongoDB
1. Ensure the MongoDB service is running on your machine:
   ```bash
   mongod
   ```
2. Your connection string will be:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/hrms_db
   ```

### Option B: MongoDB Atlas (Cloud)
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist your IP address (`0.0.0.0/0` for development).
3. Copy your connection string into `server/.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hrms_db?retryWrites=true&w=majority
   ```

---

## 6. Environment Variables

In `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hrms_db
JWT_SECRET=hrms_secret_jwt_key_super_secure_2024
JWT_EXPIRE=24h
NODE_ENV=development
```

---

## 7. Installation & Setup

### Step 1: Backend Setup
```bash
cd server
npm install
```

### Step 2: Seed the Database (Recommended)
Populate sample users, employees, attendance logs, leaves, and payroll records:
```bash
npm run seed
```

### Step 3: Frontend Setup
```bash
cd ../client
npm install
```

---

## 8. Running the Project

### Start Backend API Server:
```bash
cd server
npm run dev
# Or: npm start
```
*Backend runs on:* `http://localhost:5000`

### Start Frontend Angular App:
```bash
cd client
npm start
# Or: ng serve
```
*Frontend runs on:* `http://localhost:4200`

Open your web browser and navigate to: **`http://localhost:4200`**

---

## 9. Sample Login Credentials

| Role | Email | Password | Linked Profile |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@hrms.com` | `Admin@123` | Full Administrative Privileges |
| **HR** | `hr@hrms.com` | `Hr@123` | John Doe (HR Specialist) |
| **HR 2** | `hr2@hrms.com` | `Hr@123` | General HR Staff |
| **EMPLOYEE 1**| `employee1@hrms.com` | `Emp@123` | Sarah Connor (Engineering) |
| **EMPLOYEE 2**| `employee2@hrms.com` | `Emp@123` | Emily Watson (DevOps) |

*(Note: The login page includes 1-click demo credential autofill buttons for convenience!)*

---

## 10. REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

### Employees (`/api/employees`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | Authenticated | List all employees (search & filters) |
| `GET` | `/api/employees/:id` | Authenticated | Get single employee details |
| `POST` | `/api/employees` | ADMIN, HR | Create new employee |
| `PUT` | `/api/employees/:id` | ADMIN, HR | Update employee information |
| `DELETE`| `/api/employees/:id` | ADMIN, HR | Delete employee and related records |

### Attendance (`/api/attendance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance` | Authenticated | List records (Employee sees own, Admin/HR sees all) |
| `GET` | `/api/attendance/:id` | Authenticated | Get single attendance record |
| `POST` | `/api/attendance` | Authenticated | Log attendance record |
| `PUT` | `/api/attendance/:id` | ADMIN, HR | Update attendance details |
| `DELETE`| `/api/attendance/:id` | ADMIN, HR | Delete attendance record |

### Leave Management (`/api/leaves`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leaves` | Authenticated | List leaves (Employee sees own, Admin/HR sees all) |
| `GET` | `/api/leaves/:id` | Authenticated | Get leave request details |
| `POST` | `/api/leaves` | Authenticated | Submit leave application |
| `PUT` | `/api/leaves/:id` | ADMIN, HR | Approve or reject leave request |
| `DELETE`| `/api/leaves/:id` | Authenticated | Delete leave request |

### Payroll (`/api/payroll`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payroll` | Authenticated | List payrolls (Employee sees own, Admin/HR sees all) |
| `GET` | `/api/payroll/:id` | Authenticated | Get single payroll record |
| `POST` | `/api/payroll` | ADMIN, HR | Generate monthly payroll |
| `PUT` | `/api/payroll/:id` | ADMIN, HR | Update salary/allowances/deductions |
| `PUT` | `/api/payroll/:id/pay` | ADMIN, HR | Mark payroll status as Paid |
| `DELETE`| `/api/payroll/:id` | ADMIN, HR | Delete payroll record |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Authenticated | Real-time counts and recent activities |

---

## 11. Communication Architecture: Angular → Express → MongoDB

```
[ Angular Frontend ] (Port 4200)
       │
       │ HTTP Request + Authorization: Bearer <JWT>
       ▼
[ Express.js REST API ] (Port 5000)
       │
       ├── Middleware (CORS, express.json)
       ├── authMiddleware (Verifies JWT via jsonwebtoken)
       ├── roleMiddleware (Checks user role permissions)
       └── Controllers (Business logic & calculations)
       │
       ▼
[ Mongoose ODM ]
       │
       │ Queries & Schema Validation
       ▼
[ MongoDB Database ] (Port 27017 / Atlas Cloud)
       └── Collections: users, employees, attendances, leaves, payrolls
```

1. **Angular Components** trigger user actions via Angular Reactive Forms.
2. **Angular Services** invoke `HttpClient`, sending HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
3. **`auth.interceptor.ts`** intercepts requests and attaches the token: `Authorization: Bearer <JWT>`.
4. **Express routes** pass requests through `protect` (JWT validation) and `authorize` (role checks).
5. **Controllers** validate input data, compute business metrics (such as net salary), and invoke Mongoose models.
6. **Mongoose** interacts with MongoDB, running schema validations and returning JSON documents back to Angular.

---

## 12. Screenshots Section Placeholder

| Screen | Description |
| :--- | :--- |
| *Dashboard* | Summary counters, daily activities, and staff directory |
| *Employee Table* | Real-time search, department filtering, and modal confirmations |
| *Attendance* | Filterable attendance register with badge statuses |
| *Leave Approval* | Administrative approval/rejection buttons for leave requests |
| *Payroll Slips* | Net salary computation and one-click 'Mark as Paid' |

---

## 13. Future Enhancements

- PDF salary slip download and email dispatch.
- Biometric hardware integration for automated check-in.
- Performance review and KPI tracking module.
- Company calendar view for holidays and approved leaves.
