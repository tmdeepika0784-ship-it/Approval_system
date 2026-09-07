import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import * as XLSX from 'xlsx';
import ConfirmDialog from '../components/ConfirmDialog';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkRole, setBulkRole] = useState('');
  const [bulkCompany, setBulkCompany] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    role: 'Employee',
    company: 'NexaFlow',
    department: '',
    password: 'password123' // Default password
  });

  const roles = ['Employee', 'Manager', 'HR', 'IT & Purchase', 'Finance', 'Accountant', 'General Manager', 'CEO'];
  const departments = ['Operations', 'Human Resources', 'Technology', 'Finance', 'Management', 'Executive'];

  useEffect(() => {
    if (user?.role === 'CEO') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/users`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setShowConfirmDialog(true);
      setConfirmDialogConfig({
        title: 'Success',
        message: 'User created successfully',
        type: 'primary',
        onConfirm: () => {
          setShowConfirmDialog(false);
          setShowAddModal(false);
          setFormData({
            name: '',
            employeeId: '',
            email: '',
            phone: '',
            role: 'Employee',
            company: 'NexaFlow',
            department: '',
            password: 'password123'
          });
          fetchUsers();
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/users/${editingUser._id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setShowConfirmDialog(true);
      setConfirmDialogConfig({
        title: 'Success',
        message: 'User updated successfully',
        type: 'primary',
        onConfirm: () => {
          setShowConfirmDialog(false);
          setShowEditModal(false);
          setEditingUser(null);
          fetchUsers();
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = (userId) => {
    setShowConfirmDialog(true);
    setConfirmDialogConfig({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this user?',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/users/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setShowConfirmDialog(false);
          fetchUsers();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to delete user');
        }
      }
    });
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      employeeId: user.employeeId,
      email: user.email,
      phone: user.phone,
      role: user.role,
      company: 'NexaFlow',
      department: user.department || '',
      password: '' // Don't show existing password
    });
    setShowEditModal(true);
  };

  const downloadTemplate = () => {
    // Create Excel template with proper headers only (no sample data)
    const headers = ['name', 'employeeID', 'email', 'phone', 'department'];
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // name
      { wch: 15 }, // employeeID
      { wch: 25 }, // email
      { wch: 15 }, // phone
      { wch: 20 }  // department
    ];
    
    XLSX.writeFile(workbook, 'user_template.xlsx');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkFile(file);
    
    // Parse Excel file
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      setBulkPreview(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkUpload = async () => {
    try {
      const usersToCreate = bulkPreview.map(user => ({
        name: user.name,
        employeeId: user.employeeID,
        email: user.email,
        phone: user.phone,
        department: user.department,
        role: bulkRole,
        company: bulkCompany,
        password: 'password123'
      }));

      await axios.post(`${API_URL}/users/bulk`, { users: usersToCreate }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setShowConfirmDialog(true);
      setConfirmDialogConfig({
        title: 'Success',
        message: `Successfully created ${usersToCreate.length} users`,
        type: 'primary',
        onConfirm: () => {
          setShowConfirmDialog(false);
          handleCancelBulkUpload();
          fetchUsers();
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create users');
    }
  };

  const handleCancelBulkUpload = () => {
    setBulkFile(null);
    setBulkPreview([]);
    // Reset file input
    const fileInput = document.getElementById('bulkFileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  if (user?.role !== 'CEO') {
    return (
      <div className="page-container">
        <div className="alert alert-error">Access denied. Only CEO can access User Management.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Create and manage user accounts</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Create Single User Section */}
      <div className="card mb-3">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">Create users</h2>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + Add single
          </button>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Role</label>
              <select className="form-control" value={bulkRole} onChange={(e) => setBulkRole(e.target.value)}>
                <option value="">Select Role</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Company</label>
              <select className="form-control" value={bulkCompany} onChange={(e) => setBulkCompany(e.target.value)}>
                <option value="">Select Company</option>
                <option value="NexaFlow">NexaFlow</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Upload Section */}
      <div className="card mb-3">
        <div className="card-header">
          <h2 className="card-title">Bulk create via Excel</h2>
        </div>
        <div className="card-body">
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            Select a company above before uploading.
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => document.getElementById('bulkFileInput').click()}
              disabled={!bulkRole || !bulkCompany}
            >
              Choose .xls file
            </button>
            <input 
              id="bulkFileInput"
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button className="btn btn-primary" onClick={downloadTemplate}>
              Download template
            </button>
            {bulkPreview.length > 0 && (
              <span style={{ color: '#48bb78', fontSize: '14px' }}>
                ✓ {bulkPreview.length} users loaded
              </span>
            )}
          </div>
          
          {bulkPreview.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label required">Role (Applied to all users)</label>
                  <select className="form-control" value={bulkRole} onChange={(e) => setBulkRole(e.target.value)}>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label required">Company (Applied to all users)</label>
                  <select className="form-control" value={bulkCompany} onChange={(e) => setBulkCompany(e.target.value)}>
                    <option value="NexaFlow">NexaFlow</option>
                  </select>
                </div>
              </div>
              
              <div className="table-container" style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '16px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Employee ID</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkPreview.map((u, i) => (
                      <tr key={i}>
                        <td>{u.name}</td>
                        <td>{u.employeeID}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>{u.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={handleBulkUpload}>
                  Create {bulkPreview.length} Users
                </button>
                <button className="btn btn-secondary" onClick={handleCancelBulkUpload}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing Users Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title" style={{ marginBottom: '8px' }}>Existing users</h2>
            <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>
              Open the manager to browse every user you can manage, edit their details, or remove them.
            </p>
          </div>
        </div>
        <div className="card-body" style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px' }}>
          <button className="btn btn-primary" onClick={() => setShowUsersModal(true)}>
            View / edit / delete users
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            zIndex: 1001
          }}>
            <div className="modal-header" style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Add User</h2>
            </div>
            <form onSubmit={handleAddUser} style={{ padding: '20px' }}>
              <div className="form-group">
                <label className="form-label required">Name</label>
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label required">Employee ID</label>
                <input type="text" name="employeeId" className="form-control" value={formData.employeeId} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label required">Email</label>
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label required">Phone</label>
                <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label required">Role</label>
                <select name="role" className="form-control" value={formData.role} onChange={handleChange} required>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label required">Company</label>
                <select name="company" className="form-control" value={formData.company} onChange={handleChange} required>
                  <option value="NexaFlow">NexaFlow</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select name="department" className="form-control" value={formData.department} onChange={handleChange}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="modal-footer" style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            zIndex: 1001
          }}>
            <div className="modal-header" style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Edit User</h2>
            </div>
            <form onSubmit={handleEditUser} style={{ padding: '20px' }}>
              <div className="form-group">
                <label className="form-label required">Name</label>
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label required">Phone</label>
                <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label required">Role</label>
                <select name="role" className="form-control" value={formData.role} onChange={handleChange} required>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select name="department" className="form-control" value={formData.department} onChange={handleChange}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="modal-footer" style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users List Modal */}
      {showUsersModal && (
        <div className="modal-overlay" onClick={() => setShowUsersModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
            maxWidth: '1000px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            zIndex: 1001
          }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>All Users ({users.length})</h2>
            </div>
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : users.length > 0 ? (
              <div className="table-container" style={{maxHeight: '500px', overflow: 'auto', padding: '20px'}}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Employee ID</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.employeeId}</td>
                        <td>{u.email}</td>
                        <td><span className="badge badge-primary">{u.role}</span></td>
                        <td>{u.department || '-'}</td>
                        <td>
                          <button className="btn btn-sm btn-secondary" onClick={() => { openEditModal(u); setShowUsersModal(false); }}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(u._id)} style={{marginLeft: '8px'}}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">No users found</div>
            )}
            <div className="modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '20px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowUsersModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal - Removed, now inline */}

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

export default UserManagement;
