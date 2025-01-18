const axios = require('axios');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { Op } = require('sequelize');

class BiometricService {
  constructor() {
    this.apiUrl = process.env.BIOMETRIC_API_URL;
    this.apiKey = process.env.BIOMETRIC_API_KEY;
  }

  // Initialize connection with biometric device
  async initializeDevice() {
    try {
      const response = await axios.post(
        `${this.apiUrl}/initialize`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error initializing biometric device:', error);
      throw error;
    }
  }

  // Sync attendance data from biometric device
  async syncAttendance() {
    try {
      // Get last sync timestamp
      const lastSync = await this.getLastSyncTime();

      // Fetch attendance logs from device
      const logs = await this.fetchAttendanceLogs(lastSync);

      // Process and save attendance records
      await this.processAttendanceLogs(logs);

      // Update last sync time
      await this.updateLastSyncTime();

      return { message: 'Attendance sync completed successfully' };
    } catch (error) {
      console.error('Error syncing attendance:', error);
      throw error;
    }
  }

  // Fetch attendance logs from biometric device
  async fetchAttendanceLogs(lastSync) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/attendance`,
        {
          params: { since: lastSync },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
      throw error;
    }
  }

  // Process attendance logs
  async processAttendanceLogs(logs) {
    for (const log of logs) {
      try {
        const user = await User.findOne({
          where: {
            employeeId: log.employeeId
          }
        });

        if (!user) {
          console.warn(`User not found for employee ID: ${log.employeeId}`);
          continue;
        }

        const date = new Date(log.timestamp).toISOString().split('T')[0];
        
        let attendance = await Attendance.findOne({
          where: {
            userId: user.id,
            date
          }
        });

        if (!attendance) {
          // Create new attendance record
          attendance = await Attendance.create({
            userId: user.id,
            date,
            checkIn: log.timestamp,
            checkInSource: 'biometric',
            status: 'present'
          });
        } else if (!attendance.checkOut) {
          // Update checkout time
          await attendance.update({
            checkOut: log.timestamp,
            checkOutSource: 'biometric',
            workHours: this.calculateWorkHours(attendance.checkIn, log.timestamp)
          });
        }
      } catch (error) {
        console.error('Error processing attendance log:', error);
      }
    }
  }

  // Calculate work hours
  calculateWorkHours(checkIn, checkOut) {
    const hours = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
    return Math.round(hours * 100) / 100;
  }

  // Get last sync timestamp
  async getLastSyncTime() {
    // Implementation depends on where you store the last sync time
    // This is a placeholder
    return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  }

  // Update last sync timestamp
  async updateLastSyncTime() {
    // Implementation depends on where you store the last sync time
    // This is a placeholder
    return true;
  }

  // Register new employee in biometric device
  async registerEmployee(employeeId, biometricData) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/register`,
        {
          employeeId,
          biometricData
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error registering employee:', error);
      throw error;
    }
  }

  // Remove employee from biometric device
  async removeEmployee(employeeId) {
    try {
      const response = await axios.delete(
        `${this.apiUrl}/employees/${employeeId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error removing employee:', error);
      throw error;
    }
  }
}

module.exports = new BiometricService();
