require('dotenv').config();
const emailService = require('../services/emailService');

async function testSMTPConnection() {
  try {
    // Test with TLS enabled
    console.log('\n=== Testing with TLS enabled ===');
    process.env.SMTP_TLS = 'true';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_REJECT_UNAUTHORIZED = 'true';
    let isConnected = await emailService.testConnection();
    
    if (!isConnected) {
      // Try with TLS disabled
      console.log('\n=== Testing with TLS disabled ===');
      process.env.SMTP_TLS = 'false';
      process.env.SMTP_SECURE = 'false';
      process.env.SMTP_REJECT_UNAUTHORIZED = 'false';
      isConnected = await emailService.testConnection();
    }

    if (!isConnected) {
      // Try with SSL (secure mode)
      console.log('\n=== Testing with SSL (secure mode) ===');
      process.env.SMTP_TLS = 'true';
      process.env.SMTP_SECURE = 'true';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_REJECT_UNAUTHORIZED = 'true';
      isConnected = await emailService.testConnection();
    }

    if (isConnected) {
      console.log('\n✅ Found working SMTP configuration!');
    } else {
      console.log('\n❌ Could not establish SMTP connection with any configuration.');
      console.log('\nPlease verify these settings with your email provider:');
      console.log('1. SMTP server hostname and port');
      console.log('2. Username and password');
      console.log('3. TLS/SSL requirements');
      console.log('4. Any specific security settings or app passwords required');
    }
  } catch (error) {
    console.error('\n❌ Error during SMTP testing:', error);
  } finally {
    process.exit();
  }
}

// Run the test
console.log('Starting SMTP configuration test...');
testSMTPConnection();
