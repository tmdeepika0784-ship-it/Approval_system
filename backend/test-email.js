// Quick Email Configuration Test
// Run with: node test-email.js

require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function testEmail() {
  console.log('\n🔧 Testing Email Configuration...\n');
  console.log('Configuration:');
  console.log('  HOST:', process.env.EMAIL_HOST);
  console.log('  PORT:', process.env.EMAIL_PORT);
  console.log('  USER:', process.env.EMAIL_USER);
  console.log('  FROM:', process.env.EMAIL_FROM);
  console.log('  PASS:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : '(not set)');
  console.log('\n');

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📧 Sending test email...\n');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email - Request Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a202c;">Email Configuration Test</h1>
          <p style="font-size: 16px; color: #4a5568;">
            This is a test email from your Request Management System.
          </p>
          <p style="font-size: 16px; color: #4a5568;">
            If you received this, your email configuration is working correctly! ✅
          </p>
          <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Configuration Details:</strong></p>
            <p style="margin: 5px 0;">Host: ${process.env.EMAIL_HOST}</p>
            <p style="margin: 5px 0;">Port: ${process.env.EMAIL_PORT}</p>
            <p style="margin: 5px 0;">User: ${process.env.EMAIL_USER}</p>
          </div>
          <p style="font-size: 14px; color: #718096;">
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!\n');
    console.log('Message ID:', info.messageId);
    
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
      console.log('\n📬 View your email at: https://ethereal.email');
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('\n📬 Check your inbox:', process.env.EMAIL_USER);
    }
    
    console.log('\n✨ Email configuration is working correctly!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Email test failed:\n');
    console.error('Error:', error.message);
    console.error('\n');
    
    if (error.code === 'EAUTH') {
      console.log('🔍 Authentication Failed - Possible Solutions:');
      console.log('   1. For Gmail: Use App Password instead of regular password');
      console.log('      → https://myaccount.google.com/apppasswords');
      console.log('   2. For testing: Use Ethereal Email (free fake SMTP)');
      console.log('      → https://ethereal.email/create');
      console.log('   3. Double-check EMAIL_USER and EMAIL_PASSWORD in .env');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      console.log('🔍 Connection Failed - Possible Solutions:');
      console.log('   1. Check EMAIL_HOST and EMAIL_PORT in .env');
      console.log('   2. Verify your internet connection');
      console.log('   3. Check firewall settings');
    } else {
      console.log('🔍 Check your .env file configuration');
      console.log('   See EMAIL_SETUP_GUIDE.md for detailed instructions');
    }
    
    console.log('\n');
    process.exit(1);
  }
}

testEmail();
