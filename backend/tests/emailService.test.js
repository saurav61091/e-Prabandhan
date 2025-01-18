require('dotenv').config();
const emailService = require('../services/emailService');

// Test data
const testData = {
  supervisor: {
    name: 'Test Supervisor',
    email: process.env.TEST_EMAIL,
    department: 'IT'
  },
  employee: {
    name: 'Test Employee',
    email: process.env.TEST_EMAIL,
    department: 'IT'
  },
  leave: {
    id: 'TEST-LEAVE-001',
    type: 'Annual Leave',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-02-05'),
    reason: 'Family vacation',
    status: 'pending',
    approvalComments: 'Please plan your work handover'
  },
  tour: {
    id: 'TEST-TOUR-001',
    purpose: 'Client Meeting',
    destination: 'Mumbai',
    startDate: new Date('2025-02-10'),
    endDate: new Date('2025-02-12'),
    estimatedCost: 25000,
    actualCost: 23500,
    description: 'Meeting with potential clients',
    status: 'pending',
    approvalComments: 'Approved with budget constraints',
    itinerary: [
      {
        date: new Date('2025-02-10'),
        activity: 'Travel to Mumbai',
        location: 'Mumbai Airport'
      },
      {
        date: new Date('2025-02-11'),
        activity: 'Client Meeting',
        location: 'Client Office'
      },
      {
        date: new Date('2025-02-12'),
        activity: 'Return Journey',
        location: 'Mumbai Airport'
      }
    ],
    employee: {
      name: 'Test Employee',
      email: process.env.TEST_EMAIL
    },
    reportContent: 'Successfully met with the client and discussed project requirements.'
  }
};

async function runTests() {
  try {
    console.log('\nStarting Email Service Tests...\n');

    // Test 1: Leave Approval Request
    console.log('Test 1: Leave Approval Request');
    await emailService.sendLeaveApprovalRequest(
      testData.supervisor,
      testData.leave,
      testData.employee
    );
    console.log('✅ Leave approval request email sent\n');

    // Test 2: Leave Status Update
    console.log('Test 2: Leave Status Update');
    await emailService.sendLeaveStatusUpdate(
      testData.employee,
      testData.leave
    );
    console.log('✅ Leave status update email sent\n');

    // Test 3: Tour Approval Request
    console.log('Test 3: Tour Approval Request');
    await emailService.sendTourApprovalRequest(
      testData.supervisor,
      testData.tour,
      testData.employee
    );
    console.log('✅ Tour approval request email sent\n');

    // Test 4: Tour Status Update
    console.log('Test 4: Tour Status Update');
    await emailService.sendTourStatusUpdate(
      testData.employee,
      testData.tour
    );
    console.log('✅ Tour status update email sent\n');

    // Test 5: Tour Report Notification
    console.log('Test 5: Tour Report Notification');
    await emailService.sendTourReportNotification(
      testData.supervisor,
      testData.tour
    );
    console.log('✅ Tour report notification email sent\n');

    console.log("All email tests completed successfully! ");
    console.log(`Please check ${process.env.TEST_EMAIL} for test emails.\n`);

  } catch (error) {
    console.error('\n❌ Error during email tests:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.command) {
      console.error('SMTP command:', error.command);
    }
  } finally {
    process.exit();
  }
}

// Run all tests
console.log(`Running email tests with test email: ${process.env.TEST_EMAIL}`);
runTests();
