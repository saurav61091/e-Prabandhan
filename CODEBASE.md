# e-Prabandhan Codebase Documentation

This document provides a comprehensive overview of the e-Prabandhan codebase structure and the purpose of each component.

## Project Structure

```
e-Prabandhan/
├── frontend/           # React-based frontend application
├── backend/           # Node.js backend server
├── admin-panel/       # Admin dashboard interface
├── database/         # Database migrations and seeds
└── data/            # Application data storage
```

## Frontend Structure

### Components (`frontend/src/components/`)

#### Authentication Components (`/auth`)
- `LoginForm.js` - Handles user login with email/password authentication
- `RegisterForm.js` - New user registration form with validation
- `ForgotPasswordForm.js` - Password recovery request form
- `ResetPasswordForm.js` - Password reset form with token validation
- `ProtectedRoute.js` - Route wrapper for authenticated access control

#### Layout Components (`/layout`)
- `MainLayout.js` - Root layout component with responsive sidebar and header
- `Header.js` - Top navigation bar with user profile, notifications, and search
- `Sidebar.js` - Navigation sidebar with role-based menu items

#### Document Components (`/document`)
- `DocumentUploadDialog.js` - File upload interface with drag-and-drop
- `DocumentViewer.js` - Document preview and reading interface
- `DocumentGrid.js` - Grid display of document cards
- `DocumentCard.js` - Individual document display card
- `DocumentSearch.js` - Advanced document search interface

#### Workflow Components (`/workflow`)
- `WorkflowForm.js` - Workflow creation and editing form
- `WorkflowList.js` - List of workflows with status
- `WorkflowViewer.js` - Workflow progress visualization
- `/tasks/` - Task management components
- `/templates/` - Workflow template components
- `/notifications/` - Workflow notification components

#### Common Components (`/common`)
- `LoadingSpinner.js` - Loading state indicator
- `ErrorBoundary.js` - Error handling wrapper
- `Pagination.js` - Data pagination component
- `SearchBar.js` - Reusable search input
- `ConfirmDialog.js` - Action confirmation dialog

### State Management (`frontend/src/store/`)
- `/slices/`
  - `authSlice.js` - Authentication state management
  - `documentSlice.js` - Document-related state
  - `workflowSlice.js` - Workflow state management
  - `userSlice.js` - User data management
  - `notificationSlice.js` - Notification state

### Services (`frontend/src/services/`)
- `api.js` - API client configuration
- `auth.service.js` - Authentication API calls
- `document.service.js` - Document management API calls
- `workflow.service.js` - Workflow API calls
- `user.service.js` - User management API calls

## Backend Structure

### Controllers (`backend/controllers/`)
- `authController.js` - Authentication logic
- `documentController.js` - Document CRUD operations
- `workflowController.js` - Workflow management
- `userController.js` - User management
- `notificationController.js` - Notification handling

### Models (`backend/models/`)
- `User.js` - User data model
- `Document.js` - Document data model
- `Workflow.js` - Workflow model
- `WorkflowTemplate.js` - Workflow template model
- `Notification.js` - Notification model
- `Role.js` - User role model

### Middleware (`backend/middleware/`)
- `auth.js` - Authentication middleware
- `upload.js` - File upload handling
- `validate.js` - Request validation
- `errorHandler.js` - Global error handling
- `rbac.js` - Role-based access control

### Routes (`backend/routes/`)
- `auth.routes.js` - Authentication endpoints
- `document.routes.js` - Document management endpoints
- `workflow.routes.js` - Workflow endpoints
- `user.routes.js` - User management endpoints
- `notification.routes.js` - Notification endpoints

### Services (`backend/services/`)
- `mail.service.js` - Email notification service
- `storage.service.js` - File storage service
- `search.service.js` - Document search service
- `notification.service.js` - Notification service
- `pdf.service.js` - PDF processing service

### Config (`backend/config/`)
- `database.js` - Database configuration
- `auth.js` - Authentication configuration
- `storage.js` - File storage configuration
- `mail.js` - Email service configuration
- `logger.js` - Logging configuration

## Database Structure

### Migrations (`database/migrations/`)
- User-related migrations
- Document-related migrations
- Workflow-related migrations
- Role and permission migrations

### Seeds (`database/seeds/`)
- Initial user data
- Default roles and permissions
- Sample workflow templates

## Admin Panel Structure (`admin-panel/`)
- User management interface
- System configuration
- Analytics dashboard
- Audit logs
- Role management

## Installation Scripts
- `install.sh` - Linux/Unix installation script that automates the setup process
  - System requirements check
  - Dependencies installation
  - Database setup
  - Environment configuration
  - File permissions setup
  - Service configuration

- `install.php` - Web-based installer for all platforms
  - System compatibility check
  - Database configuration
  - Admin account setup
  - Initial configuration
  - Web server setup
  - Installation verification

## Key Features Implementation

### Document Management
- Upload and storage (`backend/services/storage.service.js`)
- Version control (`backend/services/version.service.js`)
- Search and indexing (`backend/services/search.service.js`)
- Access control (`backend/middleware/rbac.js`)

### Workflow Management
- Template creation (`backend/controllers/workflowController.js`)
- Task assignment (`backend/services/workflow.service.js`)
- Progress tracking (`backend/services/tracking.service.js`)
- Notifications (`backend/services/notification.service.js`)

### Security Implementation
- Authentication (`backend/middleware/auth.js`)
- Role-based access (`backend/middleware/rbac.js`)
- Data encryption (`backend/services/encryption.service.js`)
- Audit logging (`backend/services/audit.service.js`)

## Testing Structure

### Frontend Tests (`frontend/src/__tests__/`)
- Component tests
- Redux store tests
- Integration tests
- E2E tests

### Backend Tests (`backend/tests/`)
- Unit tests
- Integration tests
- API tests
- Service tests

## Contributing Guidelines
Please refer to `CONTRIBUTING.md` for detailed information about:
- Code style and standards
- Pull request process
- Testing requirements
- Documentation requirements

## License
This project is licensed under the terms specified in `LICENSE`.
