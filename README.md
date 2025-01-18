# e-Prabandhan: Document Management System

e-Prabandhan is a comprehensive document management system designed for efficient handling of organizational documents, workflows, and approvals.

## Table of Contents
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
  - [Linux VPS Installation](#linux-vps-installation)
  - [cPanel Installation](#cpanel-installation)
  - [cPanel Installation (Browser-Based)](#cpanel-installation-browser-based)
  - [Local Development Setup](#local-development-setup)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Database Configuration](#database-configuration)
  - [Email Configuration](#email-configuration)
- [Architecture](#architecture)
- [Technical Architecture](#technical-architecture)
- [API Documentation](#api-documentation)
- [Admin Panel](#admin-panel)
- [Security](#security)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Acknowledgments](#acknowledgments)

## Features

### Document Management
- Multi-format document support (PDF, DOC, DOCX, XLS, XLSX, etc.)
- Version control and document history
- Document categorization and tagging
- Full-text search capabilities
- Document preview and online editing
- Bulk upload and download

### Workflow Management
- Customizable approval workflows
- Multi-level approval chains
- Parallel and sequential approvals
- Delegation capabilities
- Due date tracking
- Email notifications

### User Management
- Role-based access control (RBAC)
- Department and organization hierarchy
- User activity tracking
- Session management
- Two-factor authentication
- IP-based access control

### Admin Features
- System settings configuration via GUI
- Email template management
- Backup and restore capabilities
- Audit logging
- Performance monitoring
- User activity reports

### Security Features
- End-to-end encryption
- Password policy management
- File integrity verification
- Access control lists (ACL)
- Session timeout controls
- SSL/TLS support

## System Requirements

### Server Requirements
- Node.js 16.x or higher
- MySQL 8.0 or higher
- Redis (optional, for caching)
- Nginx/Apache
- SSL certificate

### Hardware Requirements
- CPU: 2+ cores
- RAM: 4GB minimum (8GB recommended)
- Storage: 20GB minimum
- Network: 100Mbps minimum

### Supported Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Installation

### Linux VPS Installation

1. **Download the Installation Script**
   ```bash
   wget https://raw.githubusercontent.com/saurav61091/e-prabandhan/main/install.sh
   chmod +x install.sh
   ```

2. **Run the Installation Script**
   ```bash
   sudo ./install.sh
   ```
   The script will:
   - Install system dependencies
   - Configure Nginx
   - Set up SSL
   - Install Node.js and PM2
   - Configure the application

3. **Follow the Prompts**
   - Enter your domain name
   - Choose SSL configuration
   - Set up database credentials

### cPanel Installation

1. **Download the cPanel Installation Script**
   ```bash
   wget https://raw.githubusercontent.com/saurav61091/e-prabandhan/main/install-cpanel.sh
   chmod +x install-cpanel.sh
   ```

2. **Run the Installation Script**
   ```bash
   ./install-cpanel.sh
   ```
   The script will:
   - Create database and user
   - Configure domain and SSL
   - Set up Node.js application
   - Configure application settings

3. **Access the Admin Panel**
   - Visit https://your-domain.com/admin
   - Complete the setup wizard

### cPanel Installation (Browser-Based)

1. **Upload Project Files**
   - Log in to your cPanel account
   - Navigate to File Manager
   - Upload the e-prabandhan project files to your desired directory
   - Extract the files if uploaded as a zip

2. **Run Web Installer**
   - Navigate to `https://your-domain.com/path-to-eprabandhan/install.php`
   - Follow the installation wizard:
     1. System Requirements Check
     2. Database Configuration
     3. Installation Process
     4. Completion

3. **Post-Installation**
   - The installer will automatically:
     - Create the database and user
     - Configure environment files
     - Install dependencies
     - Build frontend and admin panel
     - Set up required permissions

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/saurav61091/e-prabandhan.git
   cd e-prabandhan
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install

   # Admin Panel
   cd ../admin-panel
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp admin-panel/.env.example admin-panel/.env
   ```

4. **Start Development Servers**
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd ../frontend
   npm start

   # Admin Panel
   cd ../admin-panel
   npm start
   ```

## Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
DOMAIN=example.com

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=eprabandhan

# JWT
JWT_SECRET=your_secret
JWT_EXPIRES_IN=24h

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
SMTP_FROM=noreply@example.com
```

### Database Configuration

The system uses MySQL with Sequelize ORM. Database settings can be configured through:
1. Environment variables
2. Admin panel GUI
3. Configuration files

#### Database Schema
- Tables are automatically created on first run
- Migrations handle schema updates
- Seeders provide initial data

### Email Configuration

Configure email settings through the admin panel:
1. SMTP settings
2. Email templates
3. Notification rules
4. Email queue management

## Architecture

### Backend
- Node.js with Express
- Sequelize ORM
- JWT authentication
- Redis caching (optional)
- WebSocket for real-time updates

### Frontend
- React.js
- Material-UI components
- Redux state management
- React Router
- Axios for API calls

### Admin Panel
- Separate React application
- Advanced configuration UI
- System monitoring
- User management
- Settings management

## Technical Architecture

### System Architecture

```plaintext
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │     Backend     │     │   Admin Panel   │
│    (React.js)   │────▶│    (Node.js)    │◀────│    (React.js)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               │
                        ┌──────┴──────┐
                        │   Database  │
                        │   (MySQL)   │
                        └─────────────┘
```

### Component Architecture

#### Backend Components
```plaintext
backend/
├── config/          # Configuration files
│   ├── database.js  # Database configuration
│   ├── email.js     # Email configuration
│   └── auth.js      # Authentication configuration
├── controllers/     # Request handlers
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── services/        # Business logic
├── utils/           # Helper functions
└── validation/      # Request validation
```

#### Frontend Components
```plaintext
frontend/
├── src/
│   ├── components/  # Reusable UI components
│   ├── pages/       # Page components
│   ├── hooks/       # Custom React hooks
│   ├── services/    # API services
│   ├── store/       # Redux store
│   └── utils/       # Helper functions
```

### Database Schema

#### Core Tables
```sql
-- Users Table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'manager') NOT NULL,
    department_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    version INT DEFAULT 1,
    status ENUM('draft', 'pending', 'approved', 'rejected') NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Workflows Table
CREATE TABLE workflows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSON NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### API Endpoints

#### Authentication
```plaintext
POST   /api/auth/login       # User login
POST   /api/auth/register    # User registration
POST   /api/auth/logout      # User logout
GET    /api/auth/profile     # Get user profile
PUT    /api/auth/profile     # Update user profile
```

#### Documents
```plaintext
GET    /api/documents        # List documents
POST   /api/documents        # Create document
GET    /api/documents/:id    # Get document
PUT    /api/documents/:id    # Update document
DELETE /api/documents/:id    # Delete document
POST   /api/documents/search # Search documents
```

#### Workflows
```plaintext
GET    /api/workflows        # List workflows
POST   /api/workflows        # Create workflow
GET    /api/workflows/:id    # Get workflow
PUT    /api/workflows/:id    # Update workflow
DELETE /api/workflows/:id    # Delete workflow
POST   /api/workflows/:id/approve  # Approve workflow step
POST   /api/workflows/:id/reject   # Reject workflow step
```

### Security Implementation

#### Authentication Flow
```plaintext
1. User Login Request
   ├── Validate credentials
   ├── Generate JWT token
   └── Set HTTP-only cookie

2. Request Authentication
   ├── Verify JWT token
   ├── Check user permissions
   └── Rate limiting check

3. Password Security
   ├── Bcrypt hashing
   ├── Salt rounds: 12
   └── Password policies
```

#### File Security
```plaintext
1. Upload Process
   ├── Virus scanning
   ├── File type validation
   └── Size limitation

2. Storage
   ├── Encrypted at rest
   ├── Secure file names
   └── Access logging

3. Download Process
   ├── Permission check
   ├── Rate limiting
   └── Audit logging
```

### Caching Strategy

```plaintext
1. Redis Caching
   ├── Session data
   ├── API responses
   └── Frequently accessed data

2. Browser Caching
   ├── Static assets
   ├── API responses
   └── User preferences

3. Cache Invalidation
   ├── Time-based expiry
   ├── Version-based
   └── Manual purge
```

### Performance Optimization

1. **Backend Optimization**
   - Query optimization
   - Indexing strategy
   - Connection pooling
   - Response compression

2. **Frontend Optimization**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Bundle optimization

3. **Database Optimization**
   - Proper indexing
   - Query caching
   - Regular maintenance
   - Partitioning strategy

## Security

### Authentication
- JWT-based authentication
- Session management
- Password policies
- 2FA support
- IP restrictions

### Data Protection
- End-to-end encryption
- At-rest encryption
- SSL/TLS
- File integrity checks
- Access logging

## Backup & Recovery

### Automated Backups
- Configurable backup schedule
- Multiple backup types
  - Full system backup
  - Database backup
  - Document backup
- Backup encryption
- Remote storage support

### Recovery Procedures
1. Access admin panel
2. Navigate to Backup & Recovery
3. Select backup to restore
4. Follow recovery wizard

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check database credentials
   - Verify MySQL service
   - Check network connectivity

2. **Email Sending Issues**
   - Verify SMTP settings
   - Check email templates
   - Review email logs

3. **Performance Issues**
   - Monitor server resources
   - Check Redis cache
   - Review database indexes
   - Optimize file storage

### Logging

- Application logs: `/var/log/e-prabandhan/app.log`
- Error logs: `/var/log/e-prabandhan/error.log`
- Access logs: `/var/log/e-prabandhan/access.log`
- Audit logs: Available in admin panel

## Contributing

We welcome contributions to e-Prabandhan! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any problems or have questions, please:
1. Check the [documentation](#documentation)
2. Look through [existing issues](https://github.com/yourusername/e-prabandhan/issues)
3. Create a new issue if your problem persists

## Acknowledgments

- All the contributors who have helped shape e-Prabandhan
- The open-source community for the amazing tools and libraries that made this possible
