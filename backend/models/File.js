const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  path: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  encryptionKey: {
    type: String,
    select: false // Don't include in normal queries
  },
  accessHistory: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['view', 'download', 'update', 'delete']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  confidentialityLevel: {
    type: String,
    enum: ['public', 'internal', 'confidential', 'restricted'],
    default: 'internal'
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String
  },
  fileNumber: {
    type: String,
    unique: true,
    required: true
  },
  referenceNumbers: [{
    type: String,
    trim: true
  }],
  notes: [{
    content: {
      type: String,
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Create text indexes for search
fileSchema.index({
  name: 'text',
  'metadata.description': 'text',
  tags: 'text',
  fileNumber: 'text',
  referenceNumbers: 'text'
});

// Create compound indexes for common queries
fileSchema.index({ department: 1, status: 1 });
fileSchema.index({ createdBy: 1, status: 1 });
fileSchema.index({ category: 1, subCategory: 1 });
fileSchema.index({ confidentialityLevel: 1, status: 1 });
fileSchema.index({ priority: 1, status: 1 });

// Middleware to handle file cleanup on deletion
fileSchema.pre('remove', async function(next) {
  try {
    const fs = require('fs').promises;
    await fs.unlink(this.path);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if user has access to file
fileSchema.methods.canAccess = function(user) {
  // Admin has access to all files
  if (user.isAdmin) return true;

  // Creator has access
  if (this.createdBy.toString() === user._id.toString()) return true;

  // Check department access
  if (user.department.toString() === this.department.toString()) {
    // Public and internal files are accessible to department members
    if (['public', 'internal'].includes(this.confidentialityLevel)) return true;

    // Check user's clearance level for confidential and restricted files
    if (user.clearanceLevel >= this.confidentialityLevel) return true;
  }

  return false;
};

// Virtual for file URL
fileSchema.virtual('url').get(function() {
  return `/api/files/${this._id}`;
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
