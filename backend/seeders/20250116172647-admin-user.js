'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminId = uuidv4();
    const organizationId = uuidv4();
    const employeeId = uuidv4();
    const now = new Date();

    // Create admin user
    await queryInterface.bulkInsert('users', [{
      id: adminId,
      email: 'admin@eprabandhan.com',
      password: await bcrypt.hash('Admin@123', 10),
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      status: 'active',
      mfaEnabled: false,
      createdAt: now,
      updatedAt: now
    }]);

    // Create root organization
    await queryInterface.bulkInsert('organizations', [{
      id: organizationId,
      name: 'e-Prabandhan',
      code: 'EP-HQ',
      type: 'company',
      parentId: null,
      managerId: adminId,
      description: 'e-Prabandhan Headquarters',
      status: 'active',
      level: 0,
      path: '/',
      headcount: 1,
      metadata: JSON.stringify({
        established: '2025',
        industry: 'Technology'
      }),
      createdAt: now,
      updatedAt: now
    }]);

    // Create admin employee record
    await queryInterface.bulkInsert('employees', [{
      id: employeeId,
      userId: adminId,
      organizationId: organizationId,
      employeeId: 'EMP001',
      position: 'System Administrator',
      type: 'full_time',
      status: 'active',
      joinDate: now,
      reportingTo: null,
      metadata: JSON.stringify({
        department: 'IT',
        role: 'System Administrator'
      }),
      createdAt: now,
      updatedAt: now
    }]);

    // Create initial audit log
    await queryInterface.bulkInsert('audit_logs', [{
      id: uuidv4(),
      userId: adminId,
      action: 'SYSTEM_INIT',
      resourceType: 'SYSTEM',
      resourceId: 'INIT',
      metadata: JSON.stringify({
        event: 'System initialization',
        details: 'Initial system setup completed'
      }),
      createdAt: now
    }]);
  },

  async down(queryInterface, Sequelize) {
    // Remove data in reverse order
    await queryInterface.bulkDelete('audit_logs', null, {});
    await queryInterface.bulkDelete('employees', null, {});
    await queryInterface.bulkDelete('organizations', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
