const { emailService } = require('../../utils/emailService');

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    verify: jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
  }))
}));

// Mock email-templates
jest.mock('email-templates', () => {
  return jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue(true)
  }));
});

describe('EmailService', () => {
  const mockUser = {
    email: 'test@example.com',
    username: 'testuser'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('verifyConnection', () => {
    it('should verify SMTP connection', async () => {
      const result = await emailService.verifyConnection();
      expect(result).toBe(true);
    });
  });

  describe('sendTemplate', () => {
    it('should send email using template', async () => {
      const options = {
        to: 'test@example.com',
        subject: 'Test Email',
        locals: {
          username: 'testuser'
        }
      };

      const result = await emailService.sendTemplate('test-template', options);
      expect(result).toBe(true);
    });

    it('should handle email sending error', async () => {
      // Mock email-templates to throw error
      require('email-templates').mockImplementationOnce(() => ({
        send: jest.fn().mockRejectedValue(new Error('Send failed'))
      }));

      const options = {
        to: 'test@example.com',
        subject: 'Test Email',
        locals: {}
      };

      await expect(emailService.sendTemplate('test-template', options))
        .rejects.toThrow('Send failed');
    });
  });

  describe('sendWelcome', () => {
    it('should send welcome email', async () => {
      const result = await emailService.sendWelcome(mockUser);
      expect(result).toBe(true);
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email', async () => {
      const resetToken = 'test-token';
      const result = await emailService.sendPasswordReset(mockUser, resetToken);
      expect(result).toBe(true);
    });
  });

  describe('sendApprovalRequest', () => {
    it('should send approval request email', async () => {
      const options = {
        approver: mockUser,
        document: {
          id: '123',
          title: 'Test Document'
        },
        workflow: {
          name: 'Test Workflow'
        },
        deadline: new Date()
      };

      const result = await emailService.sendApprovalRequest(options);
      expect(result).toBe(true);
    });
  });

  describe('sendApprovalStatus', () => {
    it('should send approval status email', async () => {
      const options = {
        user: mockUser,
        document: {
          id: '123',
          title: 'Test Document'
        },
        status: 'approved',
        comments: 'Test comments'
      };

      const result = await emailService.sendApprovalStatus(options);
      expect(result).toBe(true);
    });
  });

  describe('sendDeadlineReminder', () => {
    it('should send deadline reminder email', async () => {
      const options = {
        approver: mockUser,
        document: {
          id: '123',
          title: 'Test Document'
        },
        workflow: {
          name: 'Test Workflow'
        },
        deadline: new Date(),
        hoursLeft: 24
      };

      const result = await emailService.sendDeadlineReminder(options);
      expect(result).toBe(true);
    });
  });
});
