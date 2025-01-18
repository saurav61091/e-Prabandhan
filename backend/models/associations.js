const User = require('./User');
const Department = require('./Department');
const Designation = require('./Designation');
const Document = require('./Document');
const DocumentVersion = require('./DocumentVersion');
const Workflow = require('./Workflow');
const WorkflowStep = require('./WorkflowStep');
const DocumentApproval = require('./DocumentApproval');
const AuditLog = require('./AuditLog');

// This function sets up all model associations
function setupAssociations() {
  // Call associate method of each model
  [
    User,
    Department,
    Designation,
    Document,
    DocumentVersion,
    Workflow,
    WorkflowStep,
    DocumentApproval,
    AuditLog
  ].forEach(model => {
    if (model.associate) {
      model.associate({
        User,
        Department,
        Designation,
        Document,
        DocumentVersion,
        Workflow,
        WorkflowStep,
        DocumentApproval,
        AuditLog
      });
    }
  });
}

module.exports = setupAssociations;
