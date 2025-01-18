# e-Prabandhan: Enterprise Document Management System

e-Prabandhan is an enterprise-grade document management system that revolutionizes how organizations handle their documents, workflows, and approval processes. Built with modern technologies and best practices, it provides a secure, efficient, and user-friendly platform for managing organizational content.

## Overview

e-Prabandhan offers a comprehensive suite of features designed to streamline document management:

### Document Management
- **Intelligent File Organization**: Hierarchical folder structure with metadata tagging
- **Version Control**: Track document changes with detailed revision history
- **Smart Search**: Full-text search with OCR support for scanned documents
- **Format Support**: Handle various file formats (PDF, DOC, DOCX, XLS, XLSX, Images)
- **Batch Operations**: Bulk upload, download, and processing capabilities

### Workflow Automation
- **Custom Workflow Designer**: Create and modify approval workflows
- **Parallel & Sequential Processing**: Support for complex approval chains
- **Automatic Routing**: Smart document routing based on content and metadata
- **Task Management**: Assignment tracking and deadline monitoring
- **Email Notifications**: Automated alerts for pending tasks and approvals

### Security & Access Control
- **Role-Based Access**: Granular permission management
- **Audit Trail**: Complete activity logging and monitoring
- **Document Encryption**: Secure storage and transmission
- **Digital Signatures**: Support for electronic signatures
- **Compliance**: GDPR and industry-standard compliance features

### Collaboration Features
- **Real-time Editing**: Concurrent document editing capabilities
- **Comments & Annotations**: In-document collaboration tools
- **Share & Delegate**: Secure document sharing with internal/external users
- **Team Spaces**: Dedicated workspaces for departments/projects
- **Activity Feed**: Real-time updates on document activities

### Integration & Analytics
- **API Integration**: RESTful API for third-party integration
- **Export/Import**: Bulk data migration tools
- **Analytics Dashboard**: Usage metrics and insights
- **Custom Reports**: Generate detailed activity reports
- **Automated Backup**: Scheduled backup and recovery options

### Mobile Access
- **Responsive Design**: Access from any device
- **Mobile App**: Native mobile applications
- **Offline Access**: Work without internet connectivity
- **Push Notifications**: Real-time mobile alerts
- **Mobile Scanning**: Document capture from mobile devices

## Table of Contents
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
  - [1. Web-Based Installation (All Platforms)](#1-web-based-installation-all-platforms)
  - [2. Command-Line Installation (Linux/Unix)](#2-command-line-installation-linuxunix)
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
- [Development](#development)

## Features

### Core Functionality

#### Document Management
- Upload, store, and organize documents in a hierarchical structure
- Automatic metadata extraction and classification
- Version control with detailed change tracking
- Full-text search with OCR for scanned documents
- Support for multiple file formats (PDF, Office documents, images)
- Batch processing capabilities for multiple documents

#### Workflow Management
- Visual workflow designer for creating custom approval processes
- Support for both sequential and parallel approval flows
- Automatic document routing based on rules and conditions
- Task assignment and deadline management
- Real-time status tracking and notifications
- Workflow templates for common processes

#### Security
- Role-based access control (RBAC)
- Document-level permissions
- Encryption at rest and in transit
- Digital signature integration
- Comprehensive audit logging
- Two-factor authentication (2FA)

### User Interface

#### Modern Dashboard
- Intuitive and responsive design
- Customizable widgets and layouts
- Quick access to recent documents
- Task and notification center
- Analytics and reporting widgets

#### Document Viewer
- Built-in viewer for common file formats
- Annotation and commenting tools
- Side-by-side version comparison
- Mobile-friendly viewing experience
- Download and sharing options

#### Search & Navigation
- Advanced search with filters
- Quick navigation breadcrumbs
- Saved searches and favorites
- Recent items history
- Tag-based organization

### Collaboration

#### Team Features
- Shared workspaces for teams
- Document collaboration tools
- Comment threads and discussions
- Task delegation and tracking
- Team activity dashboard

#### Sharing & Access
- Secure external sharing
- Guest user access
- Temporary access links
- Access expiration controls
- Download tracking

### Integration

#### API & Extensions
- RESTful API for custom integration
- Webhook support for automation
- Third-party app connections
- Custom plugin support
- Batch import/export tools

#### Analytics & Reporting
- Usage statistics and trends
- User activity reports
- Storage utilization metrics
- Workflow performance analytics
- Custom report generator

### Mobile Features

#### Mobile Access
- Responsive web interface
- Native mobile apps (iOS/Android)
- Offline document access
- Mobile document scanning
- Push notifications

#### Offline Capabilities
- Offline document viewing
- Sync queue for pending changes
- Automatic conflict resolution
- Background synchronization
- Bandwidth optimization

## API Documentation

#### Authentication Endpoints
```http
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout
POST /api/auth/reset-password
POST /api/auth/change-password
```

#### User Management
```http
GET /api/users
POST /api/users
GET /api/users/:id
PUT /api/users/:id
DELETE /api/users/:id
```

#### Document Management
```http
GET /api/documents
POST /api/documents
GET /api/documents/:id
PUT /api/documents/:id
DELETE /api/documents/:id
POST /api/documents/:id/versions
GET /api/documents/:id/versions
```

#### Notesheet Operations
```http
POST /api/notesheets
GET /api/notesheets/:id
PUT /api/notesheets/:id
POST /api/notesheets/:id/comments
GET /api/notesheets/:id/history
POST /api/notesheets/:id/forward
POST /api/notesheets/:id/return
```

#### Workflow Management
```http
POST /api/workflows
GET /api/workflows/:id
PUT /api/workflows/:id
POST /api/workflows/:id/steps
GET /api/workflows/:id/steps
POST /api/workflows/:id/approve
POST /api/workflows/:id/reject
```

#### File Management
```http
POST /api/files/upload
GET /api/files/:id
DELETE /api/files/:id
POST /api/files/:id/share
GET /api/files/:id/versions
```

## Workflow Configuration

#### Template Definition
```json
{
  "template": {
    "id": "purchase_approval",
    "name": "Purchase Approval Workflow",
    "description": "Workflow for purchase approvals based on amount",
    "version": "1.0",
    "steps": [
      {
        "id": "initiator",
        "type": "start",
        "name": "Document Initiation",
        "roles": ["INITIATOR"],
        "actions": ["SUBMIT"]
      },
      {
        "id": "department_head",
        "type": "approval",
        "name": "Department Head Review",
        "roles": ["DEPT_HEAD"],
        "actions": ["APPROVE", "REJECT", "RETURN"],
        "sla": "48h"
      },
      {
        "id": "finance_review",
        "type": "approval",
        "name": "Finance Review",
        "roles": ["FINANCE_OFFICER"],
        "actions": ["APPROVE", "REJECT", "RETURN"],
        "sla": "72h",
        "conditions": {
          "amount": {
            "gt": 50000
          }
        }
      },
      {
        "id": "director_approval",
        "type": "approval",
        "name": "Director Approval",
        "roles": ["DIRECTOR"],
        "actions": ["APPROVE", "REJECT"],
        "sla": "96h",
        "conditions": {
          "amount": {
            "gt": 100000
          }
        }
      }
    ]
  }
}
```

#### DOP Configuration
```json
{
  "financial_powers": {
    "DEPT_HEAD": {
      "limit": 50000,
      "categories": ["OPEX", "SUPPLIES"],
      "restrictions": ["NO_CAPEX"]
    },
    "FINANCE_OFFICER": {
      "limit": 100000,
      "categories": ["ALL"],
      "restrictions": []
    },
    "DIRECTOR": {
      "limit": 1000000,
      "categories": ["ALL"],
      "restrictions": []
    }
  },
  "special_powers": {
    "EMERGENCY": {
      "roles": ["DIRECTOR", "EMERGENCY_OFFICER"],
      "limit": "UNLIMITED",
      "conditions": {
        "requires_justification": true,
        "requires_post_facto": true
      }
    }
  }
}
```

#### Notification Templates
```json
{
  "templates": {
    "approval_required": {
      "subject": "Approval Required: {{document_type}} - {{document_id}}",
      "body": "Dear {{recipient_name}},\n\nYour approval is required for {{document_type}} ({{document_id}}).\n\nDetails:\nInitiated by: {{initiator}}\nDepartment: {{department}}\nAmount: {{amount}}\n\nPlease review and take necessary action.\n\nRegards,\nSystem Administrator"
    },
    "approval_complete": {
      "subject": "Approved: {{document_type}} - {{document_id}}",
      "body": "Dear {{recipient_name}},\n\nThe {{document_type}} ({{document_id}}) has been approved.\n\nApproval Chain:\n{{approval_chain}}\n\nFinal Status: {{status}}\n\nRegards,\nSystem Administrator"
    }
  }
}
```

#### Audit Configuration
```json
{
  "audit_settings": {
    "retention_period": "7y",
    "log_level": "INFO",
    "sensitive_fields": [
      "password",
      "credit_card",
      "bank_details"
    ],
    "audit_events": [
      "LOGIN",
      "LOGOUT",
      "CREATE_DOCUMENT",
      "MODIFY_DOCUMENT",
      "APPROVE_DOCUMENT",
      "REJECT_DOCUMENT",
      "ACCESS_DENIED"
    ]
  }
}
```

## Integration Examples

#### PFMS Integration
```javascript
const pfmsConfig = {
  baseUrl: 'https://pfms.gov.in/api',
  authToken: process.env.PFMS_TOKEN,
  department: process.env.DEPT_CODE
};

async function submitToPFMS(billData) {
  try {
    const response = await axios.post(
      `${pfmsConfig.baseUrl}/bills/submit`,
      billData,
      {
        headers: {
          'Authorization': `Bearer ${pfmsConfig.authToken}`,
          'Department-Code': pfmsConfig.department
        }
      }
    );
    return response.data;
  } catch (error) {
    logger.error('PFMS submission failed:', error);
    throw new Error('PFMS submission failed');
  }
}
```

#### Digital Signature Integration
```javascript
const dsConfig = {
  provider: 'DSC_PROVIDER',
  apiKey: process.env.DSC_API_KEY,
  endpoint: process.env.DSC_ENDPOINT
};

async function signDocument(documentId, certificate, pin) {
  try {
    const document = await Document.findByPk(documentId);
    const signature = await digitalSign(document.content, certificate, pin);
    
    await document.update({
      signatureId: signature.id,
      signedBy: certificate.subject,
      signedAt: new Date(),
      signatureData: signature.data
    });
    
    return signature;
  } catch (error) {
    logger.error('Digital signing failed:', error);
    throw new Error('Digital signing failed');
  }
}
```

## Notesheet Management System

### Overview
The notesheet management system is a core component that handles the creation, routing, and approval of official documents following government procedures and hierarchies.

### Notesheet Features

#### Document Creation
- **Template-Based Generation**
  - Pre-approved templates for different document types
  - Auto-population of organizational details
  - Dynamic form fields based on document category
  - Support for multiple languages
  - Version control with full history

#### Structure and Components
- **Header Section**
  - File number generation (configurable format)
  - Department/Section details
  - Classification level
  - Priority markers
  - Reference numbers

- **Body Content**
  - Rich text editor with formatting
  - Section-wise organization
  - Previous correspondence references
  - Financial implications section
  - Supporting document attachments
  - Cross-referencing capability

- **Footer Section**
  - Signature blocks with designations
  - Time and date stamps
  - Page numbering
  - Document classification

### Delegation of Powers (DOP) System

#### Hierarchy Management
- **Organizational Structure**
  - Department hierarchy configuration
  - Position-based authority levels
  - Acting/Additional charge handling
  - Delegation certificates
  - Special powers assignment

- **Financial Limits**
  - Department-wise limits
  - Position-based limits
  - Project-specific authorities
  - Emergency override provisions
  - Temporary delegation handling

#### Authority Matrices
- **Standard Operating Procedures**
  - Category-wise approval chains
  - Bypass conditions
  - Emergency protocols
  - Delegation rules
  - Substitute approver assignment

### Financial Power Policy (FPP) Implementation

#### Financial Categories
- **Budget Classifications**
  - Revenue expenditure
  - Capital expenditure
  - Contingency funds
  - Special projects
  - Recurring expenses

#### Approval Thresholds
- **Amount-based Routing**
  - Department-wise limits
  - Designation-based limits
  - Combined approval requirements
  - Special case handling
  - Override protocols

### Workflow Management

#### Approval Chains
- **Sequential Approval**
  - Linear progression
  - Conditional routing
  - Return flow handling
  - Revision cycles
  - Comment threads

- **Parallel Processing**
  - Concurrent approvals
  - Department consultations
  - External stakeholder inputs
  - Consolidation rules
  - Conflict resolution

#### Digital Signature System

##### Signature Infrastructure
- **Technical Components**
  - PKI integration
  - Certificate management
  - Timestamp authority
  - Validation services
  - Encryption standards

##### Signature Process
- **Creation**
  - Biometric verification (optional)
  - PIN/Password protection
  - Device binding
  - Geo-tagging
  - Time stamping

- **Storage**
  - Encrypted database
  - Blockchain backup (optional)
  - Audit trails
  - Version control
  - Recovery mechanisms

- **Verification**
  - Certificate validation
  - Signature authenticity check
  - Timestamp verification
  - Authority validation
  - Tampering detection

### Audit and Compliance

#### Tracking System
- **Activity Logging**
  - User actions
  - System events
  - Error logs
  - Performance metrics
  - Security incidents

#### Compliance Features
- **Regulatory Requirements**
  - RTI compliance
  - Audit trail maintenance
  - Document retention
  - Access controls
  - Data protection

### Security Measures

#### Access Control
- **Authentication**
  - Multi-factor authentication
  - Role-based access
  - IP restrictions
  - Session management
  - Device registration

#### Data Protection
- **Encryption**
  - At-rest encryption
  - In-transit encryption
  - Key management
  - Backup encryption
  - Archive security

### Integration Capabilities

#### External Systems
- **Compatible Systems**
  - PFMS integration
  - Treasury systems
  - Budget systems
  - HR management
  - Asset management

#### APIs and Services
- **Integration Points**
  - REST APIs
  - Web services
  - Data exchange formats
  - Authentication protocols
  - Error handling

### Mobile Access

#### Mobile Features
- **App Capabilities**
  - Document viewing
  - Approval processing
  - Digital signing
  - Notification handling
  - Offline access

#### Security Features
- **Mobile Security**
  - Device registration
  - Secure container
  - Data wiping
  - Access control
  - Encryption

### Reporting and Analytics

#### Standard Reports
- **Report Types**
  - Pending approvals
  - Processing time
  - Bottleneck analysis
  - User activity
  - Audit reports

#### Custom Analytics
- **Analysis Tools**
  - Custom report builder
  - Dashboard creation
  - Data export
  - Trend analysis
  - Performance metrics

### System Requirements

#### Hardware Requirements
- **Server Specifications**
  - Processor: Intel Xeon or equivalent (8+ cores)
  - RAM: 16GB minimum
  - Storage: SSD with RAID configuration
  - Network: Gigabit Ethernet
  - Backup: Redundant storage

#### Software Requirements
- **Server Environment**
  - OS: Linux/Windows Server
  - Database: PostgreSQL/MySQL
  - Web Server: Nginx/Apache
  - Runtime: Node.js
  - SSL Certificate

#### Client Requirements
- **Workstation**
  - Modern web browser
  - PDF viewer
  - Digital signature tools
  - Minimum 4GB RAM
  - Stable internet connection

### Backup and Recovery

#### Backup System
- **Backup Types**
  - Automated daily backups
  - Incremental backups
  - Full system backups
  - Document versioning
  - Configuration backups

#### Recovery Procedures
- **Recovery Options**
  - Point-in-time recovery
  - Disaster recovery
  - System restoration
  - Data reconstruction
  - Emergency procedures

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

e-Prabandhan provides two installation methods:

### 1. Web-Based Installation (All Platforms)

Use the web-based installer by accessing `install.php` through your web browser:

1. Upload the e-Prabandhan files to your web server
2. Navigate to `http://your-domain/install.php`
3. Follow the installation wizard which will:
   - Check system requirements
   - Configure database settings
   - Set up admin account
   - Configure initial settings
   - Verify installation

### 2. Command-Line Installation (Linux/Unix)

For automated installation on Linux/Unix systems, use the installation script:

```bash
chmod +x install.sh
./install.sh
```

The script will:
- Check system requirements
- Install required dependencies
- Set up the database
- Configure environment variables
- Set appropriate file permissions
- Configure web server
- Set up system services

Choose the installation method that best suits your environment and expertise level.

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

## Development

### Quick Start

1. Install all dependencies:
```bash
npm run install:all
```

2. Configure environment variables:
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin-panel/.env.example admin-panel/.env
```

3. Set up the database:
```bash
npm run migrate
npm run seed
```

4. Start all services (backend, frontend, and admin panel):
```bash
npm start
```

This will start:
- Backend server on http://localhost:5000
- Frontend application on http://localhost:3000
- Admin panel on http://localhost:3001

### Individual Component Scripts

You can also start components individually:

```bash
# Start only backend
npm run start:backend

# Start only frontend
npm run start:frontend

# Start only admin panel
npm run start:admin
```

### Other Available Scripts

```bash
# Run tests across all components
npm test

# Build frontend and admin panel for production
npm run build

# Run database migrations
npm run migrate

# Seed the database with initial data
npm run seed

```

### Technical Architecture

#### Component Architecture
- **Frontend Layer**
  - React.js for user interface
  - Redux for state management
  - Material-UI for components
  - PDF.js for document viewing
  - Socket.IO for real-time updates

- **Backend Layer**
  - Node.js runtime
  - Express.js framework
  - Sequelize ORM
  - Redis for caching
  - Bull for job queues

- **Database Layer**
  - PostgreSQL for primary storage
  - Redis for session management
  - MongoDB for audit logs
  - Elasticsearch for search
  - MinIO for document storage

#### Security Architecture
- **Authentication**
  - JWT-based authentication
  - OAuth2 support
  - LDAP integration
  - SSO capabilities
  - 2FA implementation

- **Authorization**
  - Role-based access control
  - Attribute-based policies
  - Department-level isolation
  - Data-level security
  - API security

#### Network Architecture
- **Load Balancing**
  - Nginx reverse proxy
  - SSL termination
  - Request routing
  - Health monitoring
  - Rate limiting

- **Caching Layer**
  - Redis caching
  - CDN integration
  - Browser caching
  - API response caching
  - Static asset caching

### Deployment Guide

#### Development Setup
```bash
# Clone repository
git clone https://github.com/your-org/e-prabandhan.git

# Install dependencies
cd e-prabandhan
npm run install:all

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development servers
npm run dev
```

#### Production Deployment
```bash
# Build production assets
npm run build

# Configure environment
cp .env.production.example .env.production
# Edit production environment variables

# Start production servers
npm run start:prod
```

#### Docker Deployment
```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# Monitor logs
docker-compose logs -f
```

#### Kubernetes Deployment
```bash
# Apply configurations
kubectl apply -f k8s/

# Monitor deployment
kubectl get pods
kubectl get services
```

### Configuration Guide

#### Environment Variables
```env
# Server Configuration
NODE_ENV=production
PORT=5000
API_URL=https://api.example.com

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eprabandhan
DB_USER=admin
DB_PASSWORD=secure_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=email_password

# Storage Configuration
STORAGE_TYPE=minio
MINIO_ENDPOINT=minio.example.com
MINIO_ACCESS_KEY=access_key
MINIO_SECRET_KEY=secret_key
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Maintenance Guide

#### Regular Maintenance
- Daily backup verification
- Log rotation
- Performance monitoring
- Security updates
- User access review

#### Troubleshooting
- Error log analysis
- Performance bottleneck identification
- Database optimization
- Cache invalidation
- Session management

#### Scaling Guidelines
- Horizontal scaling with load balancers
- Database replication
- Cache distribution
- CDN integration
- Microservices adoption
