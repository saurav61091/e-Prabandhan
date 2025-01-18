-- Create database if not exists
CREATE DATABASE IF NOT EXISTS eprabandhan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eprabandhan;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER', 'MANAGER', 'APPROVER') NOT NULL,
    department_id INT,
    designation_id INT,
    is_active BOOLEAN DEFAULT true,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    parent_id INT,
    head_user_id INT,
    budget_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES departments(id),
    FOREIGN KEY (head_user_id) REFERENCES users(id)
);

-- Designations table
CREATE TABLE IF NOT EXISTS designations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level INT NOT NULL,
    department_id INT,
    can_initiate BOOLEAN DEFAULT false,
    can_approve BOOLEAN DEFAULT false,
    approval_limit DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    created_by INT,
    department_id INT,
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') DEFAULT 'DRAFT',
    version INT DEFAULT 1,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Document Versions table
CREATE TABLE IF NOT EXISTS document_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT,
    version INT,
    file_path VARCHAR(255) NOT NULL,
    changes_description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    department_id INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Workflow Steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workflow_id INT,
    step_number INT,
    designation_id INT,
    is_mandatory BOOLEAN DEFAULT true,
    approval_type ENUM('SEQUENTIAL', 'PARALLEL') DEFAULT 'SEQUENTIAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id),
    FOREIGN KEY (designation_id) REFERENCES designations(id)
);

-- Document Approvals table
CREATE TABLE IF NOT EXISTS document_approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT,
    workflow_step_id INT,
    approver_id INT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    comments TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (workflow_step_id) REFERENCES workflow_steps(id),
    FOREIGN KEY (approver_id) REFERENCES users(id)
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Insert default admin user (password: Admin@123)
INSERT INTO users (username, email, password, role, is_active)
VALUES ('admin', 'admin@eprabandhan.com', '$2b$10$5QvhVX8qKkF.Zx9yF4FuKOd5N5e5xYKB3Q4yF/0xZ1Q4yF/0xZ1Q4', 'ADMIN', true);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description)
VALUES 
('SMTP_CONFIG', '{"host":"smtp.gmail.com","port":587,"secure":false}', 'JSON', 'SMTP Server Configuration'),
('FILE_UPLOAD_LIMIT', '5242880', 'NUMBER', 'Maximum file upload size in bytes'),
('ENABLE_MFA', 'false', 'BOOLEAN', 'Enable Multi-Factor Authentication'),
('ORGANIZATION_NAME', 'Your Organization Name', 'STRING', 'Organization Name'),
('FISCAL_YEAR_START', '04-01', 'STRING', 'Start date of fiscal year (MM-DD)'),
('FISCAL_YEAR_END', '03-31', 'STRING', 'End date of fiscal year (MM-DD)');
