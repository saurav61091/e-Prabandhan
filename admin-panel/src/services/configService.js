import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ConfigService {
  // Database Configuration
  async getDatabaseConfig() {
    const response = await axios.get(`${API_URL}/admin/config/database`);
    return response.data;
  }

  async updateDatabaseConfig(config) {
    const response = await axios.post(`${API_URL}/admin/config/database`, config);
    return response.data;
  }

  async testDatabaseConnection(config) {
    const response = await axios.post(`${API_URL}/admin/config/database/test`, config);
    return response.data;
  }

  // SMTP Configuration
  async getSMTPConfig() {
    const response = await axios.get(`${API_URL}/admin/config/smtp`);
    return response.data;
  }

  async updateSMTPConfig(config) {
    const response = await axios.post(`${API_URL}/admin/config/smtp`, config);
    return response.data;
  }

  async testSMTPConnection(config) {
    const response = await axios.post(`${API_URL}/admin/config/smtp/test`, config);
    return response.data;
  }

  // Organization Configuration
  async getOrganizationConfig() {
    const response = await axios.get(`${API_URL}/admin/config/organization`);
    return response.data;
  }

  async updateOrganizationConfig(config) {
    const response = await axios.post(`${API_URL}/admin/config/organization`, config);
    return response.data;
  }

  // Workflow Configuration
  async getWorkflowConfig() {
    const response = await axios.get(`${API_URL}/admin/config/workflow`);
    return response.data;
  }

  async updateWorkflowConfig(config) {
    const response = await axios.post(`${API_URL}/admin/config/workflow`, config);
    return response.data;
  }

  // DOP Matrix Configuration
  async getDOPMatrix() {
    const response = await axios.get(`${API_URL}/admin/config/dop`);
    return response.data;
  }

  async updateDOPMatrix(config) {
    const response = await axios.post(`${API_URL}/admin/config/dop`, config);
    return response.data;
  }

  // System Settings
  async getSystemSettings() {
    const response = await axios.get(`${API_URL}/admin/config/system`);
    return response.data;
  }

  async updateSystemSettings(settings) {
    const response = await axios.post(`${API_URL}/admin/config/system`, settings);
    return response.data;
  }

  // Backup & Restore
  async createBackup() {
    const response = await axios.post(`${API_URL}/admin/config/backup`);
    return response.data;
  }

  async restoreFromBackup(backupFile) {
    const formData = new FormData();
    formData.append('backup', backupFile);
    const response = await axios.post(`${API_URL}/admin/config/restore`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Configuration Export/Import
  async exportConfiguration() {
    const response = await axios.get(`${API_URL}/admin/config/export`);
    return response.data;
  }

  async importConfiguration(configFile) {
    const formData = new FormData();
    formData.append('config', configFile);
    const response = await axios.post(`${API_URL}/admin/config/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const configService = new ConfigService();
