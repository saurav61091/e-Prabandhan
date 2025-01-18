const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkflowTemplateVersion = sequelize.define('WorkflowTemplateVersion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'WorkflowTemplates',
      key: 'id'
    }
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileTypes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  steps: {
    type: DataTypes.JSON,
    allowNull: false
  },
  sla: {
    type: DataTypes.JSON
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  changeLog: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['templateId']
    },
    {
      fields: ['version']
    },
    {
      fields: ['createdBy']
    }
  ]
});

// Define associations
WorkflowTemplateVersion.associate = (models) => {
  WorkflowTemplateVersion.belongsTo(models.WorkflowTemplate, {
    foreignKey: 'templateId',
    as: 'template'
  });
  
  WorkflowTemplateVersion.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
};

module.exports = WorkflowTemplateVersion;
