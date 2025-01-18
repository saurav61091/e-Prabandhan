const { Op } = require('sequelize');
const WorkflowMetric = require('../models/WorkflowMetric');
const WorkflowTemplate = require('../models/WorkflowTemplate');
const WorkflowInstance = require('../models/WorkflowInstance');
const WorkflowStep = require('../models/WorkflowStep');
const User = require('../models/User');

class WorkflowMetricsService {
  async recordMetric(data) {
    try {
      return await WorkflowMetric.create(data);
    } catch (error) {
      console.error('Error recording metric:', error);
      throw error;
    }
  }

  async recordWorkflowStart(workflow, user) {
    return this.recordMetric({
      templateId: workflow.templateId,
      workflowId: workflow.id,
      type: 'workflow_start',
      userId: user.id,
      department: workflow.metadata?.department,
      metadata: {
        initiator: user.id,
        templateName: workflow.metadata?.templateName
      }
    });
  }

  async recordWorkflowComplete(workflow, duration) {
    return this.recordMetric({
      templateId: workflow.templateId,
      workflowId: workflow.id,
      type: 'workflow_complete',
      duration,
      department: workflow.metadata?.department,
      metadata: {
        completedAt: new Date(),
        totalSteps: workflow.metadata?.totalSteps
      }
    });
  }

  async recordStepStart(step, user) {
    return this.recordMetric({
      templateId: step.workflow.templateId,
      workflowId: step.workflowId,
      stepId: step.id,
      type: 'step_start',
      userId: user.id,
      department: user.department,
      metadata: {
        stepName: step.metadata?.name,
        stepType: step.type
      }
    });
  }

  async recordStepComplete(step, user, duration) {
    return this.recordMetric({
      templateId: step.workflow.templateId,
      workflowId: step.workflowId,
      stepId: step.id,
      type: 'step_complete',
      userId: user.id,
      department: user.department,
      duration,
      metadata: {
        stepName: step.metadata?.name,
        stepType: step.type,
        decisions: step.decisions
      }
    });
  }

  async recordSLABreach(step, severity = 'warning') {
    return this.recordMetric({
      templateId: step.workflow.templateId,
      workflowId: step.workflowId,
      stepId: step.id,
      type: 'sla_breach',
      slaStatus: severity,
      metadata: {
        stepName: step.metadata?.name,
        deadline: step.deadline,
        assignedTo: step.assignedTo
      }
    });
  }

  async getTemplatePerformance(templateId, startDate, endDate) {
    const metrics = await WorkflowMetric.findAll({
      where: {
        templateId,
        timestamp: { [Op.between]: [startDate, endDate] }
      }
    });

    const workflowStarts = metrics.filter(m => m.type === 'workflow_start').length;
    const workflowCompletes = metrics.filter(m => m.type === 'workflow_complete');
    const avgDuration = workflowCompletes.reduce((acc, m) => acc + m.duration, 0) / workflowCompletes.length;
    const slaBreaches = metrics.filter(m => m.type === 'sla_breach').length;

    return {
      totalWorkflows: workflowStarts,
      completedWorkflows: workflowCompletes.length,
      averageDuration: avgDuration || 0,
      slaBreaches,
      completionRate: workflowStarts ? (workflowCompletes.length / workflowStarts) * 100 : 0
    };
  }

  async getDepartmentPerformance(department, startDate, endDate) {
    const metrics = await WorkflowMetric.findAll({
      where: {
        department,
        timestamp: { [Op.between]: [startDate, endDate] }
      }
    });

    return {
      totalTasks: metrics.filter(m => m.type === 'step_start').length,
      completedTasks: metrics.filter(m => m.type === 'step_complete').length,
      slaBreaches: metrics.filter(m => m.type === 'sla_breach').length,
      averageTaskDuration: this.calculateAverageTaskDuration(metrics)
    };
  }

  async getUserPerformance(userId, startDate, endDate) {
    const metrics = await WorkflowMetric.findAll({
      where: {
        userId,
        timestamp: { [Op.between]: [startDate, endDate] }
      }
    });

    return {
      assignedTasks: metrics.filter(m => m.type === 'step_start').length,
      completedTasks: metrics.filter(m => m.type === 'step_complete').length,
      averageResponseTime: this.calculateAverageTaskDuration(metrics),
      slaBreaches: metrics.filter(m => m.type === 'sla_breach').length
    };
  }

  async getSLAPerformance(templateId, startDate, endDate) {
    const metrics = await WorkflowMetric.findAll({
      where: {
        templateId,
        type: 'sla_breach',
        timestamp: { [Op.between]: [startDate, endDate] }
      }
    });

    return {
      totalBreaches: metrics.length,
      warningBreaches: metrics.filter(m => m.slaStatus === 'warning').length,
      criticalBreaches: metrics.filter(m => m.slaStatus === 'breached').length,
      breachesByStep: this.groupBreachesByStep(metrics)
    };
  }

  calculateAverageTaskDuration(metrics) {
    const completedTasks = metrics.filter(m => m.type === 'step_complete' && m.duration);
    if (!completedTasks.length) return 0;
    return completedTasks.reduce((acc, m) => acc + m.duration, 0) / completedTasks.length;
  }

  groupBreachesByStep(metrics) {
    return metrics.reduce((acc, metric) => {
      const stepName = metric.metadata?.stepName || 'Unknown';
      acc[stepName] = (acc[stepName] || 0) + 1;
      return acc;
    }, {});
  }

  async generateDashboardMetrics(startDate, endDate) {
    const metrics = await WorkflowMetric.findAll({
      where: {
        timestamp: { [Op.between]: [startDate, endDate] }
      },
      include: [
        {
          model: WorkflowTemplate,
          as: 'template'
        },
        {
          model: WorkflowInstance,
          as: 'workflow'
        }
      ]
    });

    return {
      overview: {
        totalWorkflows: metrics.filter(m => m.type === 'workflow_start').length,
        completedWorkflows: metrics.filter(m => m.type === 'workflow_complete').length,
        activeWorkflows: metrics.filter(m => m.type === 'workflow_start').length - 
                        metrics.filter(m => m.type === 'workflow_complete').length,
        totalTasks: metrics.filter(m => m.type === 'step_start').length,
        completedTasks: metrics.filter(m => m.type === 'step_complete').length
      },
      slaCompliance: {
        totalBreaches: metrics.filter(m => m.type === 'sla_breach').length,
        breachesByTemplate: this.groupBreachesByTemplate(metrics),
        breachesByDepartment: this.groupBreachesByDepartment(metrics)
      },
      performance: {
        averageWorkflowDuration: this.calculateAverageWorkflowDuration(metrics),
        averageTaskDuration: this.calculateAverageTaskDuration(metrics),
        completionRateByTemplate: await this.calculateCompletionRateByTemplate(metrics)
      }
    };
  }

  groupBreachesByTemplate(metrics) {
    return metrics.reduce((acc, metric) => {
      if (metric.type === 'sla_breach' && metric.template) {
        const templateName = metric.template.name;
        acc[templateName] = (acc[templateName] || 0) + 1;
      }
      return acc;
    }, {});
  }

  groupBreachesByDepartment(metrics) {
    return metrics.reduce((acc, metric) => {
      if (metric.type === 'sla_breach' && metric.department) {
        acc[metric.department] = (acc[metric.department] || 0) + 1;
      }
      return acc;
    }, {});
  }

  calculateAverageWorkflowDuration(metrics) {
    const completedWorkflows = metrics.filter(m => 
      m.type === 'workflow_complete' && m.duration
    );
    if (!completedWorkflows.length) return 0;
    return completedWorkflows.reduce((acc, m) => acc + m.duration, 0) / completedWorkflows.length;
  }

  async calculateCompletionRateByTemplate(metrics) {
    const templates = [...new Set(metrics.map(m => m.templateId))];
    const rates = {};

    for (const templateId of templates) {
      const templateMetrics = metrics.filter(m => m.templateId === templateId);
      const starts = templateMetrics.filter(m => m.type === 'workflow_start').length;
      const completes = templateMetrics.filter(m => m.type === 'workflow_complete').length;
      
      if (starts > 0) {
        rates[templateId] = (completes / starts) * 100;
      }
    }

    return rates;
  }
}

module.exports = new WorkflowMetricsService();
