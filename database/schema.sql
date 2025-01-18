-- e-Prabandhan Database Schema
-- Version: 1.0.0
-- Description: Complete database schema for e-Prabandhan document management system

-- Enable strict mode and UTF-8 encoding
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS eprabandhan
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

USE eprabandhan;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    department VARCHAR(100),
    role ENUM('admin', 'user', 'supervisor') NOT NULL DEFAULT 'user',
    status ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
    lastLogin DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_department (department)
) ENGINE=InnoDB;

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    logo VARCHAR(255),
    favicon VARCHAR(255),
    primaryColor VARCHAR(7),
    secondaryColor VARCHAR(7),
    address TEXT,
    contactEmail VARCHAR(255),
    contactPhone VARCHAR(20),
    settings JSON,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE=InnoDB;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    parentId INT,
    headId VARCHAR(36),
    description TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (headId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_code (code)
) ENGINE=InnoDB;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    fileUrl VARCHAR(255) NOT NULL,
    fileType VARCHAR(50) NOT NULL,
    fileSize INT NOT NULL,
    status ENUM('draft', 'pending', 'approved', 'rejected', 'archived') NOT NULL DEFAULT 'draft',
    createdBy VARCHAR(36) NOT NULL,
    departmentId INT,
    currentVersion INT NOT NULL DEFAULT 1,
    metadata JSON,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id),
    FOREIGN KEY (departmentId) REFERENCES departments(id),
    INDEX idx_status (status),
    INDEX idx_created_by (createdBy),
    INDEX idx_department (departmentId),
    FULLTEXT INDEX idx_search (title, description)
) ENGINE=InnoDB;

-- Document versions table
CREATE TABLE IF NOT EXISTS document_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documentId INT NOT NULL,
    version INT NOT NULL,
    fileUrl VARCHAR(255) NOT NULL,
    fileSize INT NOT NULL,
    changes TEXT,
    createdBy VARCHAR(36) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id),
    UNIQUE KEY unique_version (documentId, version),
    INDEX idx_document (documentId)
) ENGINE=InnoDB;

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    departmentId INT,
    isActive BOOLEAN NOT NULL DEFAULT true,
    settings JSON,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (departmentId) REFERENCES departments(id),
    INDEX idx_department (departmentId),
    INDEX idx_active (isActive)
) ENGINE=InnoDB;

-- Workflow steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workflowId INT NOT NULL,
    stepNumber INT NOT NULL,
    approverRole VARCHAR(100) NOT NULL,
    approverDepartment INT,
    isParallel BOOLEAN NOT NULL DEFAULT false,
    settings JSON,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workflowId) REFERENCES workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (approverDepartment) REFERENCES departments(id),
    UNIQUE KEY unique_step (workflowId, stepNumber),
    INDEX idx_workflow (workflowId)
) ENGINE=InnoDB;

-- Document approvals table
CREATE TABLE IF NOT EXISTS document_approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documentId INT NOT NULL,
    workflowStepId INT NOT NULL,
    approverId VARCHAR(36) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'skipped') NOT NULL DEFAULT 'pending',
    comments TEXT,
    signatureId VARCHAR(10),
    signedAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (workflowStepId) REFERENCES workflow_steps(id),
    FOREIGN KEY (approverId) REFERENCES users(id),
    INDEX idx_document (documentId),
    INDEX idx_approver (approverId),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Notesheets table
CREATE TABLE IF NOT EXISTS notesheets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documentId INT NOT NULL,
    content TEXT NOT NULL,
    pageNumber INT NOT NULL,
    createdBy VARCHAR(36) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id),
    INDEX idx_document (documentId),
    INDEX idx_page (pageNumber)
) ENGINE=InnoDB;

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_name (name)
) ENGINE=InnoDB;

-- Document tags table
CREATE TABLE IF NOT EXISTS document_tags (
    documentId INT NOT NULL,
    tagId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (documentId, tagId),
    FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entityType VARCHAR(50) NOT NULL,
    entityId VARCHAR(36) NOT NULL,
    details JSON,
    ipAddress VARCHAR(45),
    userAgent VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (userId),
    INDEX idx_action (action),
    INDEX idx_entity (entityType, entityId),
    INDEX idx_created (createdAt)
) ENGINE=InnoDB;

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL,
    ipAddress VARCHAR(45),
    userAgent VARCHAR(255),
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (userId),
    INDEX idx_token (token),
    INDEX idx_expires (expiresAt)
) ENGINE=InnoDB;

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    value JSON,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_setting (category, `key`)
) ENGINE=InnoDB;

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables JSON,
    isActive BOOLEAN NOT NULL DEFAULT true,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_name (name),
    INDEX idx_active (isActive)
) ENGINE=InnoDB;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    isRead BOOLEAN NOT NULL DEFAULT false,
    data JSON,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (userId),
    INDEX idx_type (type),
    INDEX idx_read (isRead)
) ENGINE=InnoDB;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Insert default admin user
INSERT INTO users (id, email, password, firstName, lastName, role)
VALUES (
    UUID(),
    'admin@eprabandhan.com',
    -- Default password: admin123 (change this in production)
    '$2b$10$5QvbXc7u3EJ3z6HhYq6Zp.tK6H8VY4qPG1xm3ZF0F5F5F5F5F5F5F',
    'System',
    'Administrator',
    'admin'
) ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP;

-- Insert default organization
INSERT INTO organizations (name, code, primaryColor, secondaryColor)
VALUES (
    'e-Prabandhan',
    'EPRB',
    '#1976D2',
    '#424242'
) ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP;

-- Insert default email templates
INSERT INTO email_templates (name, subject, body, variables, isActive)
VALUES
    ('welcome', 'Welcome to {{org.name}}', '<h2>Welcome to {{org.name}}</h2><p>Dear {{user.name}},</p><p>Your account has been created successfully.</p>', '["org.name", "user.name"]', true),
    ('document_approval', 'Document Approval Required: {{document.title}}', '<h2>Document Approval Required</h2><p>Dear {{user.name}},</p><p>A new document requires your approval.</p>', '["document.title", "user.name"]', true),
    ('password_reset', 'Password Reset Request', '<h2>Password Reset</h2><p>Dear {{user.name}},</p><p>Click the link below to reset your password:</p><p>{{resetLink}}</p>', '["user.name", "resetLink"]', true)
ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP;
