const nodemailer = require('nodemailer');
const Email = require('email-templates');
const path = require('path');

class EmailService {
  constructor() {
    // Create SMTP transport with detailed logging
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        enabled: process.env.SMTP_TLS === 'true',
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'true'
      },
      debug: true, // Enable debug logs
      logger: true  // Enable transport logger
    });

    // Initialize email templates
    this.email = new Email({
      message: {
        from: process.env.EMAIL_FROM
      },
      transport: this.transporter,
      views: {
        root: path.join(__dirname, '..', 'templates', 'emails'),
        options: {
          extension: 'html'
        }
      },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, '..', 'templates', 'emails')
        }
      },
      preview: false,
      send: true
    });

    // Verify transport connection on startup if not in test mode
    if (process.env.NODE_ENV !== 'test') {
      this.verifyConnection();
    }
  }

  // Verify SMTP connection
  async verifyConnection() {
    try {
      const result = await this.transporter.verify();
      console.log('SMTP server connection verified:', result);
      return true;
    } catch (error) {
      console.error('SMTP connection error:', error.message);
      return false;
    }
  }

  // Test SMTP connection with detailed error reporting
  async testConnection() {
    try {
      console.log('\nTesting SMTP Connection with following settings:');
      console.log('Host:', process.env.SMTP_HOST);
      console.log('Port:', process.env.SMTP_PORT);
      console.log('User:', process.env.SMTP_USER);
      console.log('From:', process.env.EMAIL_FROM);
      console.log('TLS Enabled:', process.env.SMTP_TLS);
      console.log('Secure:', process.env.SMTP_SECURE);
      console.log('Reject Unauthorized:', process.env.SMTP_REJECT_UNAUTHORIZED);

      // Test raw connection first
      console.log('\nTesting raw connection...');
      const connectionResult = await this.transporter.verify();
      console.log('Raw connection test result:', connectionResult);

      // Try sending a test email using template
      console.log('\nTrying to send test email...');
      await this.email.send({
        template: 'test',
        message: {
          to: process.env.TEST_EMAIL,
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high',
            'X-Mailer': 'E-Prabandhan Mailer'
          }
        },
        locals: {
          subject: 'SMTP Test Email',
          content: 'This is a test email to verify SMTP configuration.'
        }
      });

      console.log('\nEmail sent successfully!');
      return true;
    } catch (error) {
      console.error('\nError sending test email:', error);
      throw error;
    }
  }

  async sendLeaveApprovalRequest(supervisor, leave, employee) {
    try {
      const totalDays = Math.ceil(
        (new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)
      ) + 1;

      await this.email.send({
        template: 'leave-request',
        message: {
          to: supervisor.email
        },
        locals: {
          approverName: supervisor.name,
          employeeName: employee.name,
          leaveType: leave.type,
          startDate: new Date(leave.startDate).toLocaleDateString(),
          endDate: new Date(leave.endDate).toLocaleDateString(),
          duration: totalDays,
          reason: leave.reason,
          approvalUrl: `${process.env.FRONTEND_URL}/leaves/approve/${leave.id}`
        }
      });

      console.log(`Leave approval request email sent to ${supervisor.email}`);
    } catch (error) {
      console.error('Error sending leave approval request email:', error);
      throw error;
    }
  }

  async sendLeaveStatusUpdate(employee, leave) {
    try {
      const totalDays = Math.ceil(
        (new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)
      ) + 1;

      await this.email.send({
        template: 'leave-status',
        message: {
          to: employee.email
        },
        locals: {
          employeeName: employee.name,
          status: leave.status,
          leaveType: leave.type,
          startDate: new Date(leave.startDate).toLocaleDateString(),
          endDate: new Date(leave.endDate).toLocaleDateString(),
          duration: totalDays,
          remarks: leave.approvalComments
        }
      });

      console.log(`Leave status update email sent to ${employee.email}`);
    } catch (error) {
      console.error('Error sending leave status update email:', error);
      throw error;
    }
  }

  async sendTourApprovalRequest(supervisor, tour, employee) {
    try {
      await this.email.send({
        template: 'tour-request',
        message: {
          to: supervisor.email
        },
        locals: {
          approverName: supervisor.name,
          employeeName: employee.name,
          purpose: tour.purpose,
          startDate: new Date(tour.startDate).toLocaleDateString(),
          endDate: new Date(tour.endDate).toLocaleDateString(),
          duration: Math.ceil((new Date(tour.endDate) - new Date(tour.startDate)) / (1000 * 60 * 60 * 24)) + 1,
          location: tour.destination,
          estimatedExpense: tour.estimatedCost,
          approvalUrl: `${process.env.FRONTEND_URL}/tours/approve/${tour.id}`
        }
      });

      console.log(`Tour approval request email sent to ${supervisor.email}`);
    } catch (error) {
      console.error('Error sending tour approval request email:', error);
      throw error;
    }
  }

  async sendTourStatusUpdate(employee, tour) {
    try {
      await this.email.send({
        template: 'tour-status',
        message: {
          to: employee.email
        },
        locals: {
          employeeName: employee.name,
          status: tour.status,
          purpose: tour.purpose,
          startDate: new Date(tour.startDate).toLocaleDateString(),
          endDate: new Date(tour.endDate).toLocaleDateString(),
          duration: Math.ceil((new Date(tour.endDate) - new Date(tour.startDate)) / (1000 * 60 * 60 * 24)) + 1,
          location: tour.destination,
          estimatedExpense: tour.estimatedCost,
          remarks: tour.approvalComments
        }
      });

      console.log(`Tour status update email sent to ${employee.email}`);
    } catch (error) {
      console.error('Error sending tour status update email:', error);
      throw error;
    }
  }

  async sendTourReportNotification(supervisor, tour) {
    try {
      await this.email.send({
        template: 'tour-report',
        message: {
          to: supervisor.email
        },
        locals: {
          approverName: supervisor.name,
          employeeName: tour.employee.name,
          purpose: tour.purpose,
          startDate: new Date(tour.startDate).toLocaleDateString(),
          endDate: new Date(tour.endDate).toLocaleDateString(),
          location: tour.destination,
          actualExpense: tour.actualCost,
          accomplishments: tour.reportContent,
          reportUrl: `${process.env.FRONTEND_URL}/tours/report/${tour.id}`
        }
      });

      console.log(`Tour report notification email sent to ${supervisor.email}`);
    } catch (error) {
      console.error('Error sending tour report notification email:', error);
      throw error;
    }
  }

  // Send compensatory leave request notification
  async sendCompLeaveRequest(supervisor, compLeave, employee) {
    try {
      await this.email.send({
        template: 'comp-leave-request',
        message: {
          to: supervisor.email
        },
        locals: {
          approverName: supervisor.name,
          employeeName: employee.name,
          workedDate: new Date(compLeave.workedDate).toLocaleDateString(),
          hours: compLeave.hours,
          reason: compLeave.reason,
          expiryDate: new Date(compLeave.expiryDate).toLocaleDateString(),
          approvalUrl: `${process.env.FRONTEND_URL}/comp-leaves/approve/${compLeave.id}`
        }
      });

      console.log('Compensatory leave request email sent to', supervisor.email);
      return true;
    } catch (error) {
      console.error('Error sending compensatory leave request email:', error);
      throw error;
    }
  }

  // Send compensatory leave status update
  async sendCompLeaveStatusUpdate(employee, compLeave) {
    try {
      await this.email.send({
        template: 'comp-leave-status',
        message: {
          to: employee.email
        },
        locals: {
          employeeName: employee.name,
          status: compLeave.status,
          workedDate: new Date(compLeave.workedDate).toLocaleDateString(),
          hours: compLeave.hours,
          reason: compLeave.reason,
          remarks: compLeave.approvalComments
        }
      });

      console.log('Compensatory leave status update email sent to', employee.email);
      return true;
    } catch (error) {
      console.error('Error sending compensatory leave status email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
