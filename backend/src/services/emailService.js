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

exports.sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

exports.sendPasswordResetEmail = async (email, otp) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a202c;">Password Reset Request</h1>
      <p style="font-size: 16px; color: #4a5568;">You have requested to reset your password.</p>
      <p style="font-size: 16px; color: #4a5568;">Your One-Time Password (OTP) is:</p>
      <div style="background-color: #edf2f7; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #3182ce; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h2>
      </div>
      <p style="font-size: 14px; color: #718096;">This OTP will expire in <strong>15 minutes</strong>.</p>
      <p style="font-size: 14px; color: #718096;">If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      <p style="font-size: 12px; color: #a0aec0;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  await this.sendEmail({
    email,
    subject: 'Password Reset OTP - Request Management System',
    message
  });
};

exports.sendPasswordChangeOtpEmail = async (email, otp) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a202c;">Change Password Verification</h1>
      <p style="font-size: 16px; color: #4a5568;">You have requested to change your password from your profile.</p>
      <p style="font-size: 16px; color: #4a5568;">Your One-Time Password (OTP) is:</p>
      <div style="background-color: #edf2f7; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #3182ce; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h2>
      </div>
      <p style="font-size: 14px; color: #718096;">This OTP will expire in <strong>5 minutes</strong>.</p>
      <p style="font-size: 14px; color: #718096;">If you did not request this, please ignore this email and secure your account.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      <p style="font-size: 12px; color: #a0aec0;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  await this.sendEmail({
    email,
    subject: 'Password Change OTP - Request Management System',
    message
  });
};

exports.sendQueryNotification = async (email, requestId, senderName) => {
  const message = `
    <h1>New Query Received</h1>
    <p>You have received a new query from ${senderName} regarding request ${requestId}.</p>
    <p>Please log in to the system to view and respond to the query.</p>
    <a href="${process.env.FRONTEND_URL}/queries" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Queries</a>
  `;

  await this.sendEmail({
    email,
    subject: `New Query for Request ${requestId}`,
    message
  });
};

exports.sendRequestStatusEmail = async (email, requestId, status, comments) => {
  const message = `
    <h1>Request Status Update</h1>
    <p>Your request ${requestId} has been ${status}.</p>
    ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
    <a href="${process.env.FRONTEND_URL}/requests/${requestId}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Request</a>
  `;

  await this.sendEmail({
    email,
    subject: `Request ${requestId} - ${status}`,
    message
  });
};
