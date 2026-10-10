# CareerPath – Student Career & Placement Tracker

**CareerPath** is a full-stack campus placement and recruitment tracking system built with **Spring Boot 3 (Java 17)**, **MySQL 8**, and **React (Vite)** with **Tailwind CSS**. It enables university placement cells to manage student profiles, corporate partner relationships, job postings, candidate eligibility checks, multi-round interview tracking, and final student placements.

---

## 🛠 Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.4, Spring Data JPA, Spring Security 6 with JWT (JJWT 0.12.5), Hibernate, Bean Validation, Lombok.
- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router 7, Axios, Lucide Icons.
- **Database:** MySQL 8 (`careerpath_db`), with Hibernate automated DDL migration.
- **Documentation:** SpringDoc OpenAPI 3 / Swagger UI (`/swagger-ui.html`) and Postman Collection.
- **Build Tools:** Maven 3.10+, npm 11+.

---

## 🏗 Architecture & Key Business Rules

1. **Layered Architecture:**
   - `React Client` $\rightarrow$ `REST Controller` $\rightarrow$ `Service Layer` (business logic) $\rightarrow$ `JPA Repository` $\rightarrow$ `MySQL`.
   - DTOs for all requests and responses; entities are never exposed directly.
   - Centralized exception handling via `@RestControllerAdvice` returning structured `ApiResponse<T>`.
2. **Eligibility Criteria:**
   - Configured per job (e.g. minimum CGPA threshold, status open, deadline not expired).
   - Real-time eligibility evaluation on job listing and application submission.
3. **Application Duplicate Prevention:**
   - Unique database constraint on `(student_id, job_id)` prevents repeat submissions.
4. **Placement Policy:**
   - Strictly **one final placement record per student** enforced by unique constraint and service validation.

---

## 🚀 Quick Setup & Run Instructions

### 1. Database Setup (MySQL)
Open your MySQL prompt (e.g. via MySQL Workbench or command line) as root or an admin user and run:

```sql
CREATE DATABASE IF NOT EXISTS careerpath_db;

CREATE USER IF NOT EXISTS 'careerpath_user'@'localhost' IDENTIFIED BY 'careerpath_pwd';
CREATE USER IF NOT EXISTS 'careerpath_user'@'%' IDENTIFIED BY 'careerpath_pwd';

GRANT ALL PRIVILEGES ON careerpath_db.* TO 'careerpath_user'@'localhost';
GRANT ALL PRIVILEGES ON careerpath_db.* TO 'careerpath_user'@'%';
FLUSH PRIVILEGES;
```

> **Note:** The script is also saved in `backend/src/main/resources/schema.sql`.

### 2. Configure Environment Variables
You can configure credentials without modifying the codebase:
- `DB_HOST` (default: `localhost`)
- `DB_PORT` (default: `3306`)
- `DB_NAME` (default: `careerpath_db`)
- `DB_USERNAME` (default: `careerpath_user`)
- `DB_PASSWORD` (default: `careerpath_pwd`)
- `JWT_SECRET` (default: base64-encoded secret key)

### 3. Run the Backend (Spring Boot)
In a PowerShell or bash terminal:

```powershell
cd backend
mvn spring-boot:run
```

The backend server starts on port `8080`.
- **Swagger UI:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI JSON:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

### 4. Run the Frontend (React + Vite)
In a separate terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend application runs on [http://localhost:5173](http://localhost:5173).

---

## 🔑 Seed Accounts & Default Credentials

On application boot, `DataInitializer` seeds default roles and sample data:

| Role | Email | Password | Description |
|---|---|---|---|
| **ADMIN** | `admin@careerpath.edu` | `Admin@123` | Placement Cell Officer |
| **STUDENT** | `rahul.sharma@careerpath.edu` | `Student@123` | CS Student (CGPA: 8.85) |
| **STUDENT** | `priya.patel@careerpath.edu` | `Student@123` | IT Student (Placed at Microsoft, 18 LPA) |
| **STUDENT** | `arun.kumar@careerpath.edu` | `Student@123` | ECE Student (CGPA: 7.60) |

*The login page also provides **One-Click Demo Login** buttons for instant access without manual typing.*

---

## 🧪 Testing

### Backend Unit Tests
To run service-layer business logic tests (testing eligibility checks, duplicate prevention, and one-placement-per-student rule):

```powershell
cd backend
mvn test
```

### End-to-End Verification Flow
1. Navigate to `http://localhost:5173/login`.
2. Click **Student Login** (or register a new student at `/register`).
3. Verify redirection to **Student Dashboard**.
4. Navigate to **Job Openings**, review eligibility statuses, and click **Apply for Opening**.
5. Switch to **Applications & Timeline** to view scheduled interviews and recruitment progress.
6. Sign out and click **Admin Login**.
7. In the **Admin Dashboard**, review KPI cards, application distribution, post new drives, schedule interviews, and log final student placements.

---

## 📁 Repository Structure

```
CarrerPath/
├── backend/
│   ├── src/main/java/com/careerpath/
│   │   ├── config/ (SecurityConfig, DataInitializer, OpenApiConfig)
│   │   ├── controller/ (AuthController, StudentController, AdminController)
│   │   ├── dto/ (ApiResponse, AuthDto, StudentDto, JobDto, ApplicationDto, PlacementDto)
│   │   ├── entity/ (User, Student, Skill, Company, Job, Application, Interview, Placement)
│   │   ├── repository/ (*Repository interfaces with search queries)
│   │   ├── security/ (JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService)
│   │   └── service/ (*Service interfaces and *ServiceImpl implementations)
│   ├── src/main/resources/ (application.properties, schema.sql)
│   └── src/test/java/com/careerpath/service/ (PlacementAndApplicationServiceTest)
├── frontend/
│   ├── src/
│   │   ├── api/ (axiosInstance.js with Bearer token interceptor)
│   │   ├── context/ (AuthContext.jsx, ToastContext.jsx)
│   │   ├── components/ (ProtectedRoute.jsx, Sidebar.jsx, DashboardLayout.jsx)
│   │   └── pages/
│   │       ├── auth/ (LoginPage.jsx, RegisterPage.jsx)
│   │       ├── student/ (Dashboard, Profile, Skills, Jobs, Applications)
│   │       └── admin/ (Dashboard, Students, Companies, Jobs, Applications, Placements)
│   └── vite.config.js
├── CareerPath_Postman_Collection.json
└── README.md
```
