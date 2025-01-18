const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkflowComment = sequelize.define('WorkflowComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  workflowId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'WorkflowInstances',
      key: 'id'
    }
  },
  stepId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'WorkflowSteps',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('comment', 'note', 'internal'),
    defaultValue: 'comment'
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private', 'department'),
    defaultValue: 'public'
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'WorkflowComments',
      key: 'id'
    }
  },
  edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  paranoid: true, // Enable soft deletes
  indexes: [
    {
      fields: ['workflowId']
    },
    {
      fields: ['stepId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['parentId']
    }
  ]
});

// Define associations
WorkflowComment.associate = (models) => {
  WorkflowComment.belongsTo(models.WorkflowInstance, {
    foreignKey: 'workflowId',
    as: 'workflow'
  });

  WorkflowComment.belongsTo(models.WorkflowStep, {
    foreignKey: 'stepId',
    as: 'step'
  });

  WorkflowComment.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'author'
  });

  WorkflowComment.belongsTo(models.WorkflowComment, {
    foreignKey: 'parentId',
    as: 'parent'
  });

  WorkflowComment.hasMany(models.WorkflowComment, {
    foreignKey: 'parentId',
    as: 'replies'
  });
};

module.exports = WorkflowComment;
