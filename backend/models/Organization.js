const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('company', 'division', 'department', 'unit', 'team'),
    allowNull: false
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Organizations',
      key: 'id'
    }
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'archived'),
    defaultValue: 'active'
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  headcount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  costCenter: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  contact: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  indexes: [
    {
      fields: ['code'],
      unique: true
    },
    {
      fields: ['parentId']
    },
    {
      fields: ['managerId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['path'],
      using: 'gin',
      operator: 'jsonb_path_ops'
    }
  ],
  hooks: {
    beforeCreate: async (org) => {
      // Generate organization code if not provided
      if (!org.code) {
        const prefix = org.type.substring(0, 3).toUpperCase();
        const count = await Organization.count({ where: { type: org.type } });
        org.code = `${prefix}${(count + 1).toString().padStart(4, '0')}`;
      }

      // Set level and path
      if (org.parentId) {
        const parent = await Organization.findByPk(org.parentId);
        if (parent) {
          org.level = parent.level + 1;
          org.path = `${parent.path}.${org.id}`;
        } else {
          org.level = 0;
          org.path = org.id;
        }
      } else {
        org.level = 0;
        org.path = org.id;
      }
    }
  }
});

// Define associations
Organization.associate = (models) => {
  Organization.belongsTo(Organization, {
    foreignKey: 'parentId',
    as: 'parent'
  });

  Organization.hasMany(Organization, {
    foreignKey: 'parentId',
    as: 'children'
  });

  Organization.belongsTo(models.Employee, {
    foreignKey: 'managerId',
    as: 'manager'
  });

  Organization.hasMany(models.Employee, {
    foreignKey: 'organizationId',
    as: 'employees'
  });
};

// Instance methods
Organization.prototype.getHierarchy = async function(depth = null) {
  const hierarchy = {
    ...this.toJSON(),
    children: []
  };

  if (depth !== 0) {
    const children = await Organization.findAll({
      where: { parentId: this.id },
      include: [{
        model: Organization.sequelize.models.Employee,
        as: 'manager',
        attributes: ['id', 'employeeId', 'position']
      }]
    });

    for (const child of children) {
      hierarchy.children.push(
        await child.getHierarchy(depth ? depth - 1 : null)
      );
    }
  }

  return hierarchy;
};

Organization.prototype.updateHeadcount = async function() {
  const employeeCount = await Organization.sequelize.models.Employee.count({
    where: { organizationId: this.id }
  });

  await this.update({ headcount: employeeCount });

  if (this.parentId) {
    const parent = await Organization.findByPk(this.parentId);
    if (parent) {
      await parent.updateHeadcount();
    }
  }
};

Organization.prototype.getFullPath = async function() {
  const pathIds = this.path.split('.');
  const orgs = await Organization.findAll({
    where: { id: pathIds },
    attributes: ['id', 'name', 'code', 'type']
  });

  return pathIds.map(id => {
    const org = orgs.find(o => o.id === id);
    return {
      id: org.id,
      name: org.name,
      code: org.code,
      type: org.type
    };
  });
};

module.exports = Organization;
