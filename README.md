# Lumina Blog - Professional Full-Stack Blog Application

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ApurvPandey0199/LuminaDashboard-Through-Java-)
![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen?logo=springboot)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT%20%2B%20BCrypt-blue?logo=springsecurity)
![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue?logo=mysql)
![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%2F%20HTML5%20%2F%20CSS3-yellow?logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green.svg)

A production-grade, enterprise-ready Full-Stack Blog Application demonstrating modern software architecture, secure authentication, relational database integrity, and responsive frontend engineering.

Built for technical evaluation to showcase mastery in **Java 21, Spring Boot 3, Spring Security 6, stateless JWT, BCrypt, Spring Data JPA, Hibernate, MySQL, and Vanilla HTML5/CSS3/JavaScript (ES6+) with the Web Fetch API**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Framework** | Java 21 LTS (OpenJDK), Spring Boot 3.3.2, Maven 3.9 |
| **Security & Auth** | Spring Security 6, Stateless JWT (`io.jsonwebtoken:jjwt:0.12.6`), BCrypt (12 rounds) |
| **ORM & Persistence** | Spring Data JPA, Hibernate ORM 6, HikariCP Connection Pooling |
| **Databases** | MySQL 8.0+ (Production), H2 In-Memory (Zero-config local development mode) |
| **Frontend** | Pure Semantic HTML5, Vanilla CSS3 (Custom properties & glassmorphism), ES6+ JavaScript, Web Fetch API |
| **Containerization & Cloud** | Multi-stage Dockerfile, Render.com Blueprint (`render.yaml`), Railway deployable |

---

## 🏗️ Architecture & Component Design

```
 ┌─────────────────────────────────────────────────────────────┐
 │            FRONTEND (Pure Vanilla HTML5 / CSS3 / ES6+)      │
 │  - index.html (Public Feed, Live Search, Article Reader)    │
 │  - auth.html (Tabbed Sign In & Sign Up with Validation)     │
 │  - dashboard.html (Protected Author Console, CRUD & Stats)  │
 │  - api.js (Web Fetch API with Bearer Token Interceptor)     │
 └─────────────────────────────┬───────────────────────────────┘
                               │ JSON REST API (Authorization: Bearer <JWT>)
 ┌─────────────────────────────▼───────────────────────────────┐
 │               BACKEND (Java 21 / Spring Boot 3.3.2)         │
 │  ┌────────────────────────────────────────────────────────┐ │
 │  │ Spring Security 6 Filter Chain                         │ │
 │  │ - JwtAuthenticationFilter (Extracts & verifies Bearer) │ │
 │  │ - BCryptPasswordEncoder (Strength 12)                  │ │
 │  │ - CustomUserDetailsService & UserPrincipal             │ │
 │  └────────────────────────────────────────────────────────┘ │
 │  ┌────────────────────────────────────────────────────────┐ │
 │  │ REST Controllers & Global Exception Handler            │ │
 │  │ - AuthController (/api/auth/register, /api/auth/login) │ │
 │  │ - PostController (/api/posts, /api/posts/{id}, CRUD)   │ │
 │  │ - CommentController (/api/posts/{id}/comments)         │ │
 │  │ - GlobalExceptionHandler (@RestControllerAdvice)       │ │
 │  └────────────────────────────────────────────────────────┘ │
 │  ┌────────────────────────────────────────────────────────┐ │
 │  │ Service Layer (Business Logic & Author Authorization)  │ │
 │  │ - AuthService, PostService, CommentService             │ │
 │  └────────────────────────────────────────────────────────┘ │
 │  ┌────────────────────────────────────────────────────────┐ │
 │  │ Spring Data JPA Repositories & Entities                │ │
 │  │ - User, Post, Comment, Role, PostStatus                │ │
 │  └────────────────────────────────────────────────────────┘ │
 └─────────────────────────────┬───────────────────────────────┘
                               │ JDBC (HikariCP)
 ┌─────────────────────────────▼───────────────────────────────┐
 │                  DATABASE (MySQL 8.0+ / H2)                 │
 │  - schema.sql: Relational DDL with Foreign Keys & Cascades  │
 │  - Primary Keys, Foreign Keys, Unique & Composite Indexes   │
 └─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Relational Database Schema (`schema.sql`)

The repository includes a complete standalone SQL migration script in `schema.sql`:

```sql
-- 1. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Posts Table (Foreign Key to users with ON DELETE CASCADE)
CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT NOT NULL,
    summary VARCHAR(500) NULL,
    cover_image LONGTEXT NULL,
    category VARCHAR(60) NULL DEFAULT 'General',
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    author_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_posts_status (status),
    INDEX idx_posts_category (category),
    INDEX idx_posts_created_at (created_at DESC)
);

-- 3. Comments Table (Foreign Keys to posts and users)
CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(1000) NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    user_id BIGINT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
);
```

---

## 🔐 REST API Reference

### 1. Authentication Endpoints

#### User Registration
- **URL**: `POST /api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Apurv Pandey",
    "email": "apurv@example.com",
    "password": "SecurePassword@123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "user": {
      "id": 1,
      "name": "Apurv Pandey",
      "email": "apurv@example.com",
      "role": "ROLE_USER"
    }
  }
  ```

#### User Login
- **URL**: `POST /api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "apurv@example.com",
    "password": "SecurePassword@123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "user": {
      "id": 1,
      "name": "Apurv Pandey",
      "email": "apurv@example.com",
      "role": "ROLE_USER"
    }
  }
  ```

---

### 2. Blog Post Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Public | List all published articles (supports `?search=` and `?category=`) |
| `GET` | `/api/posts/{id}` | Public | Retrieve article details by ID |
| `GET` | `/api/posts/my-posts` | Authenticated | List all articles authored by the authenticated user |
| `POST` | `/api/posts` | Authenticated | Create a new blog post |
| `PUT` | `/api/posts/{id}` | Author Only | Update existing post (strictly verified against post owner) |
| `DELETE` | `/api/posts/{id}` | Author Only | Delete post (strictly verified against post owner) |

#### Create Post Request Body (`POST /api/posts`):
```json
{
  "title": "Mastering Spring Boot 3 Security and Hibernate ORM",
  "content": "Full article body content with rich markdown support...",
  "summary": "Brief summary of the article.",
  "category": "Java & Spring",
  "status": "PUBLISHED",
  "coverImage": "https://images.unsplash.com/photo-1555066931-4365d14bab8c"
}
```

---

## 🚀 Running Locally

### Prerequisites
- **Java 17+** or **Java 21**
- **Git**

### Step-by-Step Execution:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ApurvPandey0199/LuminaDashboard-Through-Java-.git
   cd LuminaDashboard-Through-Java-
   ```

2. **Run the Application**:
   - On Windows:
     ```cmd
     mvnw.cmd spring-boot:run
     ```
   - On Linux/macOS:
     ```bash
     ./mvnw spring-boot:run
     ```
   *(By default, the application boots with the `local` profile using in-memory H2 in MySQL-compatibility mode with seed demo accounts and articles. No MySQL installation is required to test immediately!)*

3. **Open in Browser**:
   - Public Feed: **`http://localhost:8080`**
   - Authentication: **`http://localhost:8080/auth.html`**
   - Author Dashboard: **`http://localhost:8080/dashboard.html`**
   - H2 Database Console: **`http://localhost:8080/h2-console`** *(JDBC URL: `jdbc:h2:mem:blog_db`)*

### Testing with Local MySQL:
If you have a local MySQL server running:
```bash
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=prod -Dspring-boot.run.arguments="--spring.datasource.url=jdbc:mysql://localhost:3306/blog_db?createDatabaseIfNotExist=true --spring.datasource.username=root --spring.datasource.password=your_password"
```

---

## ⚡ Pre-Configured Demo Accounts

For immediate testing and evaluation, the application seeds two ready-to-test accounts upon first launch:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Demo Author** | `demo@example.com` | `Demo@123` |
| **Admin User** | `admin@example.com` | `Admin@123` |

*(On `auth.html`, click the "Author Demo" or "Admin Demo" button to auto-fill credentials instantly!)*

---

## 🌐 1-Click Deployment (Render / Railway)

### Deploying to Render.com:
1. Push this repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint** (or **Web Service**).
4. Connect your GitHub repository.
5. Render reads `render.yaml` and `Dockerfile` automatically.
6. Optional: Under Environment Variables, link your MySQL database (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`).
7. Click **Deploy**. Your app will be live with a free `.onrender.com` SSL domain in minutes!

---

## 📜 License & Attribution
Developed with precision by **Apurv Pandey** for the Technical Assessment. Distributed under the MIT License.
