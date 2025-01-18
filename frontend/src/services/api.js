import axios from 'axios';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error);
      }
    );
  }

  // Auth endpoints
  async login(credentials) {
    return this.api.post('/auth/login', credentials);
  }

  async register(userData) {
    return this.api.post('/auth/register', userData);
  }

  async forgotPassword(email) {
    return this.api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token, password) {
    return this.api.post('/auth/reset-password', { token, password });
  }

  async setupMFA() {
    return this.api.post('/auth/mfa/setup');
  }

  async verifyMFA(code) {
    return this.api.post('/auth/mfa/verify', { code });
  }

  // User endpoints
  async getCurrentUser() {
    return this.api.get('/users/me');
  }

  async updateProfile(data) {
    return this.api.put('/users/me', data);
  }

  async changePassword(data) {
    return this.api.post('/users/me/change-password', data);
  }

  // Document endpoints
  async getDocuments(params) {
    return this.api.get('/documents', { params });
  }

  async getDocument(id) {
    return this.api.get(`/documents/${id}`);
  }

  async createDocument(data) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item));
      } else {
        formData.append(key, value);
      }
    });
    return this.api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async updateDocument(id, data) {
    return this.api.put(`/documents/${id}`, data);
  }

  async deleteDocument(id) {
    return this.api.delete(`/documents/${id}`);
  }

  async searchDocuments(query) {
    return this.api.get('/documents/search', { params: { query } });
  }

  // Workflow endpoints
  async getWorkflows(params) {
    return this.api.get('/workflows', { params });
  }

  async getWorkflow(id) {
    return this.api.get(`/workflows/${id}`);
  }

  async createWorkflow(data) {
    return this.api.post('/workflows', data);
  }

  async updateWorkflow(id, data) {
    return this.api.put(`/workflows/${id}`, data);
  }

  async deleteWorkflow(id) {
    return this.api.delete(`/workflows/${id}`);
  }

  async approveWorkflowStep(workflowId, stepId, data) {
    return this.api.post(`/workflows/${workflowId}/steps/${stepId}/approve`, data);
  }

  async rejectWorkflowStep(workflowId, stepId, data) {
    return this.api.post(`/workflows/${workflowId}/steps/${stepId}/reject`, data);
  }

  // Department endpoints
  async getDepartments() {
    return this.api.get('/departments');
  }

  async getDepartment(id) {
    return this.api.get(`/departments/${id}`);
  }

  async createDepartment(data) {
    return this.api.post('/departments', data);
  }

  async updateDepartment(id, data) {
    return this.api.put(`/departments/${id}`, data);
  }

  async deleteDepartment(id) {
    return this.api.delete(`/departments/${id}`);
  }

  // Utility methods
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return this.api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    });
  }

  async downloadFile(fileId) {
    return this.api.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
