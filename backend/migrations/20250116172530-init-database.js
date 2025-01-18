'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'hr', 'manager', 'employee'),
        defaultValue: 'employee'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
      },
      mfaEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      mfaSecret: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Organizations table
    await queryInterface.createTable('organizations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      type: {
        type: Sequelize.ENUM('company', 'division', 'department', 'unit', 'team'),
        allowNull: false
      },
      parentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'organizations',
          key: 'id'
        }
      },
      managerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'archived'),
        defaultValue: 'active'
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      headcount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      budget: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      costCenter: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true
      },
      contact: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Employees table
    await queryInterface.createTable('employees', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id'
        }
      },
      employeeId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      position: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('full_time', 'part_time', 'contract', 'intern'),
        defaultValue: 'full_time'
      },
      status: {
        type: Sequelize.ENUM('active', 'on_leave', 'terminated', 'suspended'),
        defaultValue: 'active'
      },
      joinDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reportingTo: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'employees',
          key: 'id'
        }
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Documents table
    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id'
        }
      },
      uploadedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      isEncrypted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'archived', 'deleted'),
        defaultValue: 'active'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Audit Logs table
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      resourceType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      resourceId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Document Shares table
    await queryInterface.createTable('document_shares', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      documentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'documents',
          key: 'id'
        }
      },
      sharedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      sharedWith: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      permission: {
        type: Sequelize.ENUM('view', 'edit', 'admin'),
        defaultValue: 'view'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('organizations', ['code']);
    await queryInterface.addIndex('organizations', ['parentId']);
    await queryInterface.addIndex('organizations', ['managerId']);
    await queryInterface.addIndex('employees', ['employeeId']);
    await queryInterface.addIndex('employees', ['userId']);
    await queryInterface.addIndex('employees', ['organizationId']);
    await queryInterface.addIndex('employees', ['reportingTo']);
    await queryInterface.addIndex('documents', ['organizationId']);
    await queryInterface.addIndex('documents', ['uploadedBy']);
    await queryInterface.addIndex('audit_logs', ['userId']);
    await queryInterface.addIndex('audit_logs', ['action']);
    await queryInterface.addIndex('audit_logs', ['resourceType', 'resourceId']);
    await queryInterface.addIndex('document_shares', ['documentId']);
    await queryInterface.addIndex('document_shares', ['sharedBy']);
    await queryInterface.addIndex('document_shares', ['sharedWith']);
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order
    await queryInterface.dropTable('document_shares');
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('documents');
    await queryInterface.dropTable('employees');
    await queryInterface.dropTable('organizations');
    await queryInterface.dropTable('users');
  }
};
