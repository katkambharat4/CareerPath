-- =====================================================================
-- CareerPath: Database Initialization & User Setup Script
-- Run this script as MySQL root user or administrator to create
-- the dedicated user and schema:
-- =====================================================================

CREATE DATABASE IF NOT EXISTS careerpath_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create dedicated MySQL user 'careerpath_user'
CREATE USER IF NOT EXISTS 'careerpath_user'@'localhost' IDENTIFIED BY 'careerpath_pwd';
CREATE USER IF NOT EXISTS 'careerpath_user'@'%' IDENTIFIED BY 'careerpath_pwd';

-- Grant full permissions on careerpath_db
GRANT ALL PRIVILEGES ON careerpath_db.* TO 'careerpath_user'@'localhost';
GRANT ALL PRIVILEGES ON careerpath_db.* TO 'careerpath_user'@'%';
FLUSH PRIVILEGES;

USE careerpath_db;

-- DDL is automatically managed by Hibernate (spring.jpa.hibernate.ddl-auto=update).
-- The standard schema layout is documented below for reference:

/*
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    cgpa DECIMAL(4, 2),
    graduation_year INT,
    resume_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS student_skills (
    student_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency VARCHAR(30) NOT NULL,
    PRIMARY KEY (student_id, skill_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    industry VARCHAR(100),
    location VARCHAR(150),
    website VARCHAR(255),
    description TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    required_skills TEXT,
    min_cgpa DECIMAL(4, 2),
    package_lpa DECIMAL(6, 2),
    location VARCHAR(150),
    deadline DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'APPLIED',
    applied_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT uk_student_job UNIQUE (student_id, job_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    interview_date DATETIME NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    location_or_link VARCHAR(300),
    round_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    feedback TEXT,
    created_at DATETIME,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS placements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE,
    company_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    package_lpa DECIMAL(6, 2) NOT NULL,
    joining_date DATE,
    placed_date DATE NOT NULL,
    created_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
*/
