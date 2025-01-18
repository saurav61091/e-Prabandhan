const nodemailer = require('nodemailer');
const Email = require('email-templates');
const path = require('path');
const fs = require('fs').promises;
const handlebars = require('handlebars');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.email = new Email({
      message: {
        from: process.env.EMAIL_FROM || 'no-reply@eprabandhan.com'
      },
      transport: this.transporter,
      views: {
        root: path.join(process.cwd(), 'templates', 'emails'),
        options: {
          extension: 'hbs'
        }
      },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(process.cwd(), 'templates', 'emails', 'css')
        }
      }
    });

    // Register Handlebars helpers
    this.registerHelpers();
  }

  /**
   * Register custom Handlebars helpers
   * @private
   */
  registerHelpers() {
    handlebars.registerHelper('formatDate', function(date, format) {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    });

    handlebars.registerHelper('formatTime', function(date) {
      return new Date(date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
  }

  /**
   * Send email using template
   * @param {string} template - Template name
   * @param {object} options - Email options
   * @returns {Promise}
   */
  async sendTemplate(template, options) {
    try {
      const { to, subject, locals } = options;

      // Add common variables to template
      const templateData = {
        ...locals,
        appName: process.env.APP_NAME || 'e-Prabandhan',
        year: new Date().getFullYear(),
        supportEmail: process.env.SUPPORT_EMAIL || 'support@eprabandhan.com'
      };

      await this.email.send({
        template,
        message: {
          to,
          subject
        },
        locals: templateData
      });

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   * @param {object} user - User object
   * @returns {Promise}
   */
  async sendWelcome(user) {
    return this.sendTemplate('welcome', {
      to: user.email,
      subject: 'Welcome to e-Prabandhan',
      locals: {
        username: user.username,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        user
      }
    });
  }

  /**
   * Send password reset email
   * @param {object} user - User object
   * @param {string} resetToken - Password reset token
   * @returns {Promise}
   */
  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    return this.sendTemplate('password-reset', {
      to: user.email,
      subject: 'Reset Your Password',
      locals: {
        username: user.username,
        resetUrl,
        expiryHours: 24, // Token expiry in hours
        user
      }
    });
  }

  /**
   * Send document approval request
   * @param {object} options - Approval options
   * @returns {Promise}
   */
  async sendApprovalRequest(options) {
    const { approver, document, workflow, deadline } = options;
    
    return this.sendTemplate('approval-request', {
      to: approver.email,
      subject: `Document Approval Required: ${document.title}`,
      locals: {
        approverName: approver.username,
        documentTitle: document.title,
        documentUrl: `${process.env.FRONTEND_URL}/documents/${document.id}`,
        workflowName: workflow.name,
        deadline,
        document,
        workflow,
        approver
      }
    });
  }

  /**
   * Send approval status notification
   * @param {object} options - Notification options
   * @returns {Promise}
   */
  async sendApprovalStatus(options) {
    const { user, document, status, comments } = options;
    
    return this.sendTemplate('approval-status', {
      to: user.email,
      subject: `Document ${status}: ${document.title}`,
      locals: {
        username: user.username,
        documentTitle: document.title,
        documentUrl: `${process.env.FRONTEND_URL}/documents/${document.id}`,
        status,
        comments,
        document,
        user
      }
    });
  }

  /**
   * Send deadline reminder
   * @param {object} options - Reminder options
   * @returns {Promise}
   */
  async sendDeadlineReminder(options) {
    const { approver, document, workflow, deadline, hoursLeft } = options;
    
    return this.sendTemplate('deadline-reminder', {
      to: approver.email,
      subject: `Reminder: Pending Approval - ${document.title}`,
      locals: {
        approverName: approver.username,
        documentTitle: document.title,
        documentUrl: `${process.env.FRONTEND_URL}/documents/${document.id}`,
        workflowName: workflow.name,
        deadline,
        hoursLeft,
        document,
        workflow,
        approver
      }
    });
  }

  /**
   * Verify email configuration
   * @returns {Promise<boolean>}
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration error:', error);
      return false;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export instance and class
module.exports = {
  emailService,
  EmailService
};
