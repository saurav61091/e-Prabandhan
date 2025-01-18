# e-Prabandhan API Documentation

## Authentication

### Login
- **POST** `/api/auth/login`
- **Body**: `{ email: string, password: string }`
- **Response**: `{ token: string, user: Object }`

### Register
- **POST** `/api/auth/register`
- **Body**: `{ name: string, email: string, password: string }`
- **Response**: `{ message: string, user: Object }`

## Documents

### Upload Document
- **POST** `/api/documents`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `FormData with file`
- **Response**: `{ message: string, document: Object }`

### List Documents
- **GET** `/api/documents`
- **Headers**: `Authorization: Bearer <token>`
- **Query**: `{ page: number, limit: number, search: string }`
- **Response**: `{ documents: Array, total: number, page: number }`

## Workflows

### Create Workflow
- **POST** `/api/workflows`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name: string, steps: Array }`
- **Response**: `{ workflow: Object }`

### List Workflows
- **GET** `/api/workflows`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ workflows: Array }`

## Users

### List Users
- **GET** `/api/users`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ users: Array }`

### Update User
- **PUT** `/api/users/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name?: string, email?: string, role?: string }`
- **Response**: `{ user: Object }`

## Error Responses

All endpoints may return the following error responses:

- **400** Bad Request: Invalid input data
- **401** Unauthorized: Missing or invalid token
- **403** Forbidden: Insufficient permissions
- **404** Not Found: Resource not found
- **500** Internal Server Error: Server-side error

For detailed request/response examples, please refer to the Postman collection in the `docs` folder.
