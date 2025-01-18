'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create DocumentApprovals table
    await queryInterface.createTable('documentapprovals', {
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
      workflowStepId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'workflowsteps',
          key: 'id'
        }
      },
      approverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING'
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true
      },
      remindersSent: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lastReminderSent: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isEscalated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      escalatedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      escalatedTo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
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

    // Create AuditLogs table
    await queryInterface.createTable('auditlogs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      entityType: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      entityId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      oldValue: {
        type: Sequelize.JSON,
        allowNull: true
      },
      newValue: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('SUCCESS', 'FAILURE', 'WARNING'),
        defaultValue: 'SUCCESS'
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sessionId: {
        type: Sequelize.STRING(100),
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

    // Create indexes
    await queryInterface.addIndex('documentapprovals', ['documentId', 'workflowStepId', 'approverId'], { unique: true });
    await queryInterface.addIndex('documentapprovals', ['status']);
    await queryInterface.addIndex('documentapprovals', ['deadline']);
    await queryInterface.addIndex('auditlogs', ['userId']);
    await queryInterface.addIndex('auditlogs', ['action']);
    await queryInterface.addIndex('auditlogs', ['entityType', 'entityId']);
    await queryInterface.addIndex('auditlogs', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('auditlogs');
    await queryInterface.dropTable('documentapprovals');
  }
};
