const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Designation = sequelize.define('Designation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  canInitiate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  canApprove: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  approvalLimit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
});

// Instance methods
Designation.prototype.canApproveAmount = function(amount) {
  if (!this.canApprove) return false;
  if (!this.approvalLimit) return true; // No limit means can approve any amount
  return amount <= this.approvalLimit;
};

Designation.prototype.getApprovalChain = async function() {
  const department = await this.getDepartment();
  if (!department) return [];
  
  return await Designation.findAll({
    where: {
      departmentId: department.id,
      level: {
        [Sequelize.Op.gt]: this.level
      },
      canApprove: true,
      isActive: true
    },
    order: [['level', 'ASC']]
  });
};

// Model associations
Designation.associate = function(models) {
  Designation.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });
  
  Designation.hasMany(models.User, {
    foreignKey: 'designationId',
    as: 'users'
  });
  
  Designation.hasMany(models.WorkflowStep, {
    foreignKey: 'designationId',
    as: 'workflowSteps'
  });
};

module.exports = Designation;
