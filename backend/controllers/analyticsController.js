const File = require('../models/File');
const Task = require('../models/Task');
const Workflow = require('../models/Workflow');
const User = require('../models/User');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Leave = require('../models/Leave');
const Tour = require('../models/Tour');
const Report = require('../models/Report');
const Holiday = require('../models/Holiday');
const CompensatoryLeave = require('../models/CompensatoryLeave');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { sendEmail } = require('../services/emailService');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // Get file statistics
    const fileStats = {
      total: await File.count(),
      pending: await File.count({ where: { status: 'draft' } }),
      approved: await File.count({ where: { status: 'approved' } }),
      rejected: await File.count({ where: { status: 'rejected' } }),
      recentFiles: await File.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ 
          model: User,
          attributes: ['name']
        }]
      })
    };

    // Get task statistics
    const taskStats = {
      total: await Task.count(),
      pending: await Task.count({ where: { status: 'pending' } }),
      inProgress: await Task.count({ where: { status: 'in_progress' } }),
      completed: await Task.count({ where: { status: 'completed' } }),
      myTasks: await Task.count({ 
        where: { 
          assignedTo: userId,
          status: { [Op.ne]: 'completed' }
        }
      }),
      dueSoon: await Task.count({
        where: {
          dueDate: {
            [Op.between]: [today, new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)]
          },
          status: { [Op.ne]: 'completed' }
        }
      })
    };

    // Get workflow statistics
    const workflowStats = {
      total: await Workflow.count(),
      active: await Workflow.count({ where: { status: 'active' } }),
      completed: await Workflow.count({ where: { status: 'completed' } }),
      pendingApproval: await Workflow.count({
        where: {
          status: 'active',
          'steps.approver': userId,
          'steps.status': null
        }
      })
    };

    // Get activity trends
    const activityTrends = await File.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: lastMonth
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    // Get department statistics
    const departmentStats = await File.findAll({
      attributes: [
        'department',
        [sequelize.fn('COUNT', sequelize.col('id')), 'fileCount']
      ],
      group: ['department']
    });

    // Get user activity
    const userActivity = await User.findAll({
      attributes: [
        'id',
        'name',
        [
          sequelize.literal(`(
            SELECT COUNT(*) 
            FROM Files 
            WHERE Files.createdBy = User.id
          )`),
          'fileCount'
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*) 
            FROM Tasks 
            WHERE Tasks.assignedTo = User.id 
            AND Tasks.status = 'completed'
          )`),
          'completedTasks'
        ]
      ],
      limit: 5,
      order: [[sequelize.literal('fileCount'), 'DESC']]
    });

    // Combine all statistics
    const dashboardData = {
      fileStats,
      taskStats,
      workflowStats,
      activityTrends,
      departmentStats,
      userActivity,
      recentActivities: await getRecentActivities(userId)
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRecentActivities = async (userId) => {
  const activities = [];

  // Get recent files
  const files = await File.findAll({
    limit: 5,
    order: [['createdAt', 'DESC']],
    include: [{ 
      model: User,
      attributes: ['name']
    }]
  });

  // Get recent tasks
  const tasks = await Task.findAll({
    limit: 5,
    order: [['createdAt', 'DESC']],
    include: [
      { 
        model: User,
        as: 'assignee',
        attributes: ['name']
      },
      {
        model: User,
        as: 'creator',
        attributes: ['name']
      }
    ]
  });

  // Get recent workflow updates
  const workflows = await Workflow.findAll({
    limit: 5,
    order: [['updatedAt', 'DESC']],
    include: [{
      model: User,
      as: 'initiator',
      attributes: ['name']
    }]
  });

  // Combine and sort activities
  [...files, ...tasks, ...workflows].forEach(item => {
    let activity = {
      id: item.id,
      timestamp: item.createdAt,
      type: item instanceof File ? 'file' : item instanceof Task ? 'task' : 'workflow'
    };

    switch (activity.type) {
      case 'file':
        activity.description = `File "${item.name}" was ${item.status}`;
        activity.user = item.User.name;
        break;
      case 'task':
        activity.description = `Task "${item.title}" was ${item.status}`;
        activity.user = item.creator.name;
        break;
      case 'workflow':
        activity.description = `Workflow "${item.name}" status updated to ${item.status}`;
        activity.user = item.initiator.name;
        break;
    }

    activities.push(activity);
  });

  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
};

const getDepartmentLeaveStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await Leave.findAll({
      attributes: [
        'User.department',
        [sequelize.fn('COUNT', sequelize.col('Leave.id')), 'totalLeaves'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = \'approved\' THEN 1 ELSE 0 END')), 'approvedLeaves'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = \'rejected\' THEN 1 ELSE 0 END')), 'rejectedLeaves']
      ],
      include: [{
        model: User,
        attributes: ['department'],
        required: true
      }],
      where: startDate && endDate ? {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      } : {},
      group: ['User.department']
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLeaveUtilizationTrends = async (req, res) => {
  try {
    const { year, department } = req.query;
    const currentYear = year || new Date().getFullYear();

    let whereClause = {
      createdAt: {
        [Op.between]: [`${currentYear}-01-01`, `${currentYear}-12-31`]
      }
    };

    if (department) {
      whereClause = {
        ...whereClause,
        '$User.department$': department
      };
    }

    const trends = await Leave.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        'type',
        'status'
      ],
      include: [{
        model: User,
        attributes: [],
        required: true
      }],
      where: whereClause,
      group: [
        sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')),
        'type',
        'status'
      ],
      order: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']
      ]
    });

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTourExpenseAnalytics = async (req, res) => {
  try {
    const { year, department } = req.query;
    const currentYear = year || new Date().getFullYear();

    let whereClause = {
      startDate: {
        [Op.between]: [`${currentYear}-01-01`, `${currentYear}-12-31`]
      }
    };

    if (department) {
      whereClause = {
        ...whereClause,
        '$User.department$': department
      };
    }

    const expenses = await Tour.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('startDate')), 'month'],
        [sequelize.fn('SUM', sequelize.col('estimatedCost')), 'estimatedTotal'],
        [sequelize.fn('SUM', sequelize.col('actualCost')), 'actualTotal'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      include: [{
        model: User,
        attributes: [],
        required: true
      }],
      where: whereClause,
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('startDate'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('startDate')), 'ASC']]
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateCustomReport = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      type,
      filters,
      format = 'excel',
      schedule,
      recipients
    } = req.body;

    // Create report template
    const report = await Report.create({
      name,
      type,
      template: {
        format,
        filters
      },
      schedule,
      filters,
      recipients,
      createdBy: req.user.id
    }, { transaction });

    // Generate initial report
    const reportData = await generateReportData(type, filters);
    const fileName = await generateReportFile(reportData, format, name);

    // Schedule report if requested
    if (schedule) {
      await scheduleReport(report.id, schedule);
    }

    // Send email with report if recipients specified
    if (recipients && recipients.length > 0) {
      await sendReportEmail(recipients, fileName, name);
    }

    await transaction.commit();
    res.json({
      message: 'Report generated successfully',
      reportId: report.id,
      downloadUrl: `/api/analytics/reports/download/${path.basename(fileName)}`
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

const generateReportData = async (type, filters) => {
  let data = [];
  switch (type) {
    case 'leave':
      data = await generateLeaveReport(filters);
      break;
    case 'tour':
      data = await generateTourReport(filters);
      break;
    case 'expense':
      data = await generateExpenseReport(filters);
      break;
    case 'attendance':
      data = await generateAttendanceReport(filters);
      break;
    default:
      throw new Error('Invalid report type');
  }
  return data;
};

const generateReportFile = async (data, format, name) => {
  const timestamp = moment().format('YYYYMMDD_HHmmss');
  const fileName = `${name.replace(/[^a-z0-9]/gi, '_')}_${timestamp}`;

  if (format === 'excel') {
    return await generateExcelReport(data, fileName);
  } else if (format === 'pdf') {
    return await generatePDFReport(data, fileName);
  }

  throw new Error('Unsupported format');
};

const generateExcelReport = async (data, fileName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // Add headers
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);

  // Add data
  data.forEach(row => {
    worksheet.addRow(Object.values(row));
  });

  // Style the worksheet
  worksheet.getRow(1).font = { bold: true };
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  const filePath = path.join(__dirname, '..', 'temp', `${fileName}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

const generatePDFReport = async (data, fileName) => {
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, '..', 'temp', `${fileName}.pdf`);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  // Add title
  doc.fontSize(16).text(fileName, { align: 'center' });
  doc.moveDown();

  // Add data
  const headers = Object.keys(data[0]);
  const tableTop = 150;
  let yPosition = tableTop;

  // Add headers
  headers.forEach((header, i) => {
    doc.fontSize(12)
       .text(header, 50 + (i * 100), yPosition, { width: 90, align: 'left' });
  });

  yPosition += 20;

  // Add rows
  data.forEach(row => {
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
    }

    headers.forEach((header, i) => {
      doc.fontSize(10)
         .text(row[header].toString(), 50 + (i * 100), yPosition, { width: 90, align: 'left' });
    });

    yPosition += 20;
  });

  doc.end();
  return filePath;
};

const downloadReport = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '..', 'temp', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.download(filePath, fileName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const scheduleReport = async (reportId, schedule) => {
  // Implementation depends on your scheduling library (e.g., node-cron)
  // This is a placeholder for the scheduling logic
  console.log(`Scheduled report ${reportId} with schedule:`, schedule);
};

const sendReportEmail = async (recipients, filePath, reportName) => {
  const attachments = [{
    filename: path.basename(filePath),
    path: filePath
  }];

  for (const recipient of recipients) {
    await sendEmail({
      to: recipient,
      subject: `Report: ${reportName}`,
      html: `<p>Please find attached the requested report: ${reportName}</p>`,
      attachments
    });
  }
};

module.exports = {
  getDashboardStats,
  getDepartmentLeaveStats,
  getLeaveUtilizationTrends,
  getTourExpenseAnalytics,
  generateCustomReport,
  downloadReport
};
