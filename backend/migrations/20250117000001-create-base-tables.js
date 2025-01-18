'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('ADMIN', 'USER', 'MANAGER', 'APPROVER'),
        allowNull: false
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      designationId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      mfaEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      mfaSecret: {
        type: Sequelize.STRING(32),
        allowNull: true
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      loginAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lockUntil: {
        type: Sequelize.DATE,
        allowNull: true
      },
      passwordLastChanged: {
        type: Sequelize.DATE,
        allowNull: true
      },
      requirePasswordChange: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      preferences: {
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

    // Create Departments table
    await queryInterface.createTable('departments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id'
        }
      },
      headUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      budgetCode: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Create Designations table
    await queryInterface.createTable('designations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id'
        }
      },
      canInitiate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      canApprove: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      approvalLimit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Add foreign key constraints for Users table
    await queryInterface.addConstraint('users', {
      fields: ['departmentId'],
      type: 'foreign key',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('users', {
      fields: ['designationId'],
      type: 'foreign key',
      references: {
        table: 'designations',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Create indexes
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['username']);
    await queryInterface.addIndex('users', ['departmentId']);
    await queryInterface.addIndex('users', ['designationId']);
    await queryInterface.addIndex('departments', ['parentId']);
    await queryInterface.addIndex('departments', ['headUserId']);
    await queryInterface.addIndex('departments', ['code']);
    await queryInterface.addIndex('designations', ['departmentId']);
    await queryInterface.addIndex('designations', ['level']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('designations');
    await queryInterface.dropTable('departments');
    await queryInterface.dropTable('users');
  }
};
