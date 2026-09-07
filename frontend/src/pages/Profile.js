import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeSection, setActiveSection] = useState('info');
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Confirm dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'primary'
  });

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const response = await userAPI.updateProfile({ phone });
      updateUser(response.data.user);
      setMessage({ type: 'success', text: 'Phone number updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update phone number' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await userAPI.requestPasswordChangeOtp();
      setOtpSent(true);
      setOtpTimer(300); // 5 minutes in seconds
      
      // Start countdown
      const interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setConfirmDialogConfig({
        title: 'OTP Sent',
        message: 'A 6-digit OTP has been sent to your email. Please check your inbox and enter the OTP below. It will expire in 5 minutes.',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'primary'
      });
      setShowConfirmDialog(true);
    } catch (err) {
      setConfirmDialogConfig({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to send OTP',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'danger'
      });
      setShowConfirmDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setConfirmDialogConfig({
        title: 'Validation Error',
        message: 'Passwords do not match. Please ensure both password fields are identical.',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'warning'
      });
      setShowConfirmDialog(true);
      return;
    }

    // Validate password length
    if (passwordData.newPassword.length < 6) {
      setConfirmDialogConfig({
        title: 'Validation Error',
        message: 'Password must be at least 6 characters long.',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'warning'
      });
      setShowConfirmDialog(true);
      return;
    }

    // Validate OTP
    if (!passwordData.otp || passwordData.otp.length !== 6) {
      setConfirmDialogConfig({
        title: 'Validation Error',
        message: 'Please enter the 6-digit OTP sent to your email.',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'warning'
      });
      setShowConfirmDialog(true);
      return;
    }

    setLoading(true);

    try {
      await userAPI.verifyAndChangePassword({
        otp: passwordData.otp,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      // Reset form
      setPasswordData({ newPassword: '', confirmPassword: '', otp: '' });
      setOtpSent(false);
      setOtpTimer(0);

      setConfirmDialogConfig({
        title: 'Success',
        message: 'Password changed successfully! You can now use your new password to log in.',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'success'
      });
      setShowConfirmDialog(true);
    } catch (err) {
      setConfirmDialogConfig({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to change password',
        onConfirm: () => setShowConfirmDialog(false),
        type: 'danger'
      });
      setShowConfirmDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await authAPI.forgotPassword({ email: user.email });
      setMessage({ 
        type: 'success', 
        text: 'Password reset OTP has been sent to your email. Please check your inbox and follow the instructions.' 
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account settings</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Section Tabs */}
      <div className="card mb-3">
        <div className="flex gap-2">
          <button
            className={`btn ${activeSection === 'info' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSection('info')}
          >
            Profile Information
          </button>
          <button
            className={`btn ${activeSection === 'password' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSection('password')}
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Profile Information */}
      {activeSection === 'info' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Profile Information</h2>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Name</div>
                <div style={{ fontWeight: '500' }}>{user?.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Email</div>
                <div style={{ fontWeight: '500' }}>{user?.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Role</div>
                <div style={{ fontWeight: '500' }}>{user?.role}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Employee ID / Staff ID</div>
                <div style={{ fontWeight: '500' }}>{user?.employeeId}</div>
              </div>
              {user?.department && (
                <div>
                  <div style={{ fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Department</div>
                  <div style={{ fontWeight: '500' }}>{user?.department}</div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleUpdatePhone}>
            <div className="form-group">
              <label className="form-label required">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div className="form-help">
                You can update your phone number here
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || phone === user?.phone}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Change Password */}
      {activeSection === 'password' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Change Password</h2>
          </div>

          <div className="alert alert-info mb-3">
            <strong>Secure Password Change:</strong> For security reasons, you need to verify your identity with an OTP sent to your email before changing your password.
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Registered Email</label>
              <input
                type="email"
                className="form-control"
                value={user?.email}
                disabled
                style={{ backgroundColor: '#f7fafc', cursor: 'not-allowed' }}
              />
            </div>

            {!otpSent ? (
              <>
                <div className="alert alert-warning">
                  Click the button below to receive a 6-digit OTP via email. The OTP will expire in 5 minutes.
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRequestOtp}
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP to Email'}
                </button>
              </>
            ) : (
              <>
                <div className="alert alert-success">
                  OTP sent successfully! Check your email and enter the details below.
                  {otpTimer > 0 && (
                    <div style={{ marginTop: '8px', fontWeight: '600' }}>
                      Time remaining: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                  {otpTimer === 0 && (
                    <div style={{ marginTop: '8px', color: '#c53030' }}>
                      OTP expired. Please request a new OTP.
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label required">Enter OTP</label>
                  <input
                    type="text"
                    className="form-control"
                    value={passwordData.otp}
                    onChange={(e) => setPasswordData({ ...passwordData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    required
                    style={{ letterSpacing: '8px', fontSize: '20px', textAlign: 'center' }}
                  />
                  <div className="form-help">
                    Enter the 6-digit OTP sent to {user?.email}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    minLength="6"
                    required
                  />
                  <div className="form-help">
                    Password must be at least 6 characters long
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    minLength="6"
                    required
                  />
                  <div className="form-help">
                    Both passwords must match
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || otpTimer === 0}
                  >
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpTimer(0);
                      setPasswordData({ newPassword: '', confirmPassword: '', otp: '' });
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDialogConfig.onConfirm}
        title={confirmDialogConfig.title}
        message={confirmDialogConfig.message}
        type={confirmDialogConfig.type}
      />
    </div>
  );
};

export default Profile;
