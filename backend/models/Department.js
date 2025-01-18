const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
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
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  headUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  budgetCode: {
    type: DataTypes.STRING(20),
    allowNull: true
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
}, {
  hooks: {
    beforeCreate: async (department) => {
      // Auto-generate department code if not provided
      if (!department.code) {
        department.code = await Department.generateUniqueCode(department.name);
      }
    }
  }
});

// Static methods
Department.generateUniqueCode = async function(name) {
  const baseCode = name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3);
  
  let code = baseCode;
  let counter = 1;
  
  while (await Department.findOne({ where: { code } })) {
    code = `${baseCode}${counter.toString().padStart(2, '0')}`;
    counter++;
  }
  
  return code;
};

// Instance methods
Department.prototype.getHierarchy = async function() {
  const hierarchy = [this];
  let currentDept = this;
  
  while (currentDept.parentId) {
    currentDept = await Department.findByPk(currentDept.parentId);
    if (!currentDept) break;
    hierarchy.unshift(currentDept);
  }
  
  return hierarchy;
};

Department.prototype.getSubDepartments = async function(includeInactive = false) {
  const where = { parentId: this.id };
  if (!includeInactive) {
    where.isActive = true;
  }
  
  return await Department.findAll({
    where,
    include: [{
      model: Department,
      as: 'subDepartments',
      where: includeInactive ? undefined : { isActive: true },
      required: false
    }]
  });
};

// Model associations
Department.associate = function(models) {
  Department.belongsTo(Department, {
    foreignKey: 'parentId',
    as: 'parent'
  });
  
  Department.hasMany(Department, {
    foreignKey: 'parentId',
    as: 'subDepartments'
  });
  
  Department.belongsTo(models.User, {
    foreignKey: 'headUserId',
    as: 'head'
  });
  
  Department.hasMany(models.User, {
    foreignKey: 'departmentId',
    as: 'users'
  });
  
  Department.hasMany(models.Designation, {
    foreignKey: 'departmentId',
    as: 'designations'
  });
  
  Department.hasMany(models.Document, {
    foreignKey: 'departmentId',
    as: 'documents'
  });
  
  Department.hasMany(models.Workflow, {
    foreignKey: 'departmentId',
    as: 'workflows'
  });
};

module.exports = Department;
