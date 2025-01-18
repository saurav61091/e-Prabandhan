const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const File = require('./File');

const FileNote = sequelize.define('FileNote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fileId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Files',
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
    type: DataTypes.ENUM('note', 'comment', 'approval', 'rejection'),
    allowNull: false
  },
  pageNumber: {
    type: DataTypes.INTEGER,
    comment: 'For notes related to specific pages in the document'
  },
  decision: {
    type: DataTypes.ENUM('approved', 'rejected', 'needs_changes'),
    comment: 'For approval/rejection notes'
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Private notes visible only to creator'
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of attachment file paths'
  },
  parentNoteId: {
    type: DataTypes.UUID,
    references: {
      model: 'FileNotes',
      key: 'id'
    },
    comment: 'For threaded comments/replies'
  }
});

// Associations
FileNote.belongsTo(File, { foreignKey: 'fileId' });
FileNote.belongsTo(User, { foreignKey: 'userId' });
FileNote.belongsTo(FileNote, { as: 'parentNote', foreignKey: 'parentNoteId' });
FileNote.hasMany(FileNote, { as: 'replies', foreignKey: 'parentNoteId' });

module.exports = FileNote;
