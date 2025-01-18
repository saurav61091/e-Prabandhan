const bcrypt = require('bcryptjs');
const { User, Department, Designation, Workflow } = require('../models');
const config = require('../config/config');

async function seedDatabase() {
  try {
    // Create default admin department
    const adminDept = await Department.create({
      name: 'Administration',
      code: 'ADMIN',
      description: 'System Administration Department'
    });

    // Create default admin designation
    const adminDesignation = await Designation.create({
      name: 'System Administrator',
      level: 1,
      departmentId: adminDept.id,
      canInitiate: true,
      canApprove: true,
      description: 'System Administrator with full privileges'
    });

    // Create default admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@eprabandhan.com',
      password: adminPassword,
      role: 'ADMIN',
      departmentId: adminDept.id,
      designationId: adminDesignation.id,
      isActive: true
    });

    // Update department head
    await adminDept.update({ headUserId: adminUser.id });

    // Create default workflow for document approvals
    const defaultWorkflow = await Workflow.create({
      name: 'Standard Document Approval',
      description: 'Default workflow for document approvals',
      departmentId: adminDept.id,
      type: 'SEQUENTIAL',
      isActive: true
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  const env = process.argv[2] || 'development';
  const dbConfig = config[env];

  seedDatabase()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
