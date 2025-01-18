const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Department = require('./Department');
const User = require('./User');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    unique: true
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Departments',
      key: 'id'
    }
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'on_leave', 'terminated', 'suspended'),
    defaultValue: 'active'
  },
  type: {
    type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern'),
    allowNull: false
  },
  joinDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reportingTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id'
    }
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  workEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  workPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    validate: {
      isValidEmergencyContact(value) {
        if (!value.name || !value.relationship || !value.phone) {
          throw new Error('Emergency contact must include name, relationship, and phone');
        }
      }
    }
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  certifications: {
    type: DataTypes.JSONB,
    defaultValue: [],
    validate: {
      isValidCertifications(value) {
        if (!Array.isArray(value)) {
          throw new Error('Certifications must be an array');
        }
        value.forEach(cert => {
          if (!cert.name || !cert.issuer || !cert.validUntil) {
            throw new Error('Each certification must include name, issuer, and validUntil');
          }
        });
      }
    }
  },
  education: {
    type: DataTypes.JSONB,
    defaultValue: [],
    validate: {
      isValidEducation(value) {
        if (!Array.isArray(value)) {
          throw new Error('Education must be an array');
        }
        value.forEach(edu => {
          if (!edu.degree || !edu.institution || !edu.year) {
            throw new Error('Each education entry must include degree, institution, and year');
          }
        });
      }
    }
  },
  documents: {
    type: DataTypes.JSONB,
    defaultValue: {},
    validate: {
      isValidDocuments(value) {
        const requiredDocs = ['id_proof', 'address_proof', 'resume'];
        requiredDocs.forEach(doc => {
          if (!value[doc]) {
            throw new Error(`Missing required document: ${doc}`);
          }
        });
      }
    }
  },
  benefits: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  performanceMetrics: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  indexes: [
    {
      fields: ['employeeId']
    },
    {
      fields: ['departmentId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['reportingTo']
    }
  ],
  hooks: {
    beforeCreate: async (employee) => {
      // Generate employee ID if not provided
      if (!employee.employeeId) {
        const year = new Date().getFullYear().toString().substr(-2);
        const count = await Employee.count();
        employee.employeeId = `EMP${year}${(count + 1).toString().padStart(4, '0')}`;
      }
    }
  }
});

// Define associations
Employee.associate = (models) => {
  Employee.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  Employee.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });

  Employee.belongsTo(Employee, {
    foreignKey: 'reportingTo',
    as: 'manager'
  });

  Employee.hasMany(Employee, {
    foreignKey: 'reportingTo',
    as: 'directReports'
  });

  Employee.hasMany(models.Leave, {
    foreignKey: 'employeeId',
    as: 'leaves'
  });

  Employee.hasMany(models.Attendance, {
    foreignKey: 'employeeId',
    as: 'attendance'
  });

  Employee.hasMany(models.PerformanceReview, {
    foreignKey: 'employeeId',
    as: 'performanceReviews'
  });
};

// Instance methods
Employee.prototype.getReportingChain = async function() {
  const chain = [];
  let currentEmployee = this;

  while (currentEmployee.reportingTo) {
    currentEmployee = await Employee.findByPk(currentEmployee.reportingTo, {
      include: ['user']
    });
    if (!currentEmployee) break;
    chain.push(currentEmployee);
  }

  return chain;
};

Employee.prototype.getSubordinates = async function(depth = 1) {
  const subordinates = [];
  const queue = [{ employee: this, level: 0 }];

  while (queue.length > 0) {
    const { employee, level } = queue.shift();

    if (level < depth) {
      const directReports = await Employee.findAll({
        where: { reportingTo: employee.id },
        include: ['user']
      });

      directReports.forEach(report => {
        subordinates.push(report);
        queue.push({ employee: report, level: level + 1 });
      });
    }
  }

  return subordinates;
};

module.exports = Employee;
