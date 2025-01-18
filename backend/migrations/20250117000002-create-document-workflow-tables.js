'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Documents table
    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      filePath: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      fileType: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departments',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'DRAFT'
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      isEncrypted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastAccessedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      accessCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    // Create DocumentVersions table
    await queryInterface.createTable('documentversions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'documents',
          key: 'id'
        }
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      filePath: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      changesDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      fileType: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      isEncrypted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    // Create Workflows table
    await queryInterface.createTable('workflows', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departments',
          key: 'id'
        }
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      type: {
        type: Sequelize.ENUM('SEQUENTIAL', 'PARALLEL', 'CONDITIONAL'),
        defaultValue: 'SEQUENTIAL'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      conditions: {
        type: Sequelize.JSON,
        allowNull: true
      },
      minApprovals: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      maxDuration: {
        type: Sequelize.INTEGER,
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

    // Create WorkflowSteps table
    await queryInterface.createTable('workflowsteps', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      workflowId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'workflows',
          key: 'id'
        }
      },
      stepNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      designationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'designations',
          key: 'id'
        }
      },
      isMandatory: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      approvalType: {
        type: Sequelize.ENUM('SEQUENTIAL', 'PARALLEL'),
        defaultValue: 'SEQUENTIAL'
      },
      minApprovals: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      deadline: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      conditions: {
        type: Sequelize.JSON,
        allowNull: true
      },
      actions: {
        type: Sequelize.JSON,
        allowNull: true
      },
      notifyEmails: {
        type: Sequelize.JSON,
        allowNull: true
      },
      reminderInterval: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      escalateAfter: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      escalateToDesignationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'designations',
          key: 'id'
        }
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

    // Create indexes
    await queryInterface.addIndex('documents', ['createdBy']);
    await queryInterface.addIndex('documents', ['departmentId']);
    await queryInterface.addIndex('documents', ['status']);
    await queryInterface.addIndex('documentversions', ['documentId', 'version']);
    await queryInterface.addIndex('documentversions', ['createdBy']);
    await queryInterface.addIndex('workflows', ['departmentId']);
    await queryInterface.addIndex('workflowsteps', ['workflowId', 'stepNumber'], { unique: true });
    await queryInterface.addIndex('workflowsteps', ['designationId']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('workflowsteps');
    await queryInterface.dropTable('workflows');
    await queryInterface.dropTable('documentversions');
    await queryInterface.dropTable('documents');
  }
};
