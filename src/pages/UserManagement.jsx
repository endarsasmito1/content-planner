import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit2, Plus, X, Check, Loader, Calendar as CalIcon } from 'lucide-react';
import { usersAPI, teamsAPI } from '../services/api';

const UserManagement = () => {
    const { user: currentUser, refreshUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [notification, setNotification] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'user',
        password: '',
        phoneNumber: '',
        activeUntil: '',
        TeamId: ''
    });

    // Helper: Show Notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Fetch users and teams
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, teamsData] = await Promise.all([
                usersAPI.getAll(),
                teamsAPI.getAll()
            ]);
            setUsers(usersData.users);
            setTeams(teamsData);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ username: '', email: '', role: 'user', password: '', phoneNumber: '', activeUntil: '', TeamId: '' });
        setModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        // Format date for input type="date" (YYYY-MM-DD)
        const dateStr = user.activeUntil ? new Date(user.activeUntil).toISOString().split('T')[0] : '';

        setFormData({
            username: user.username,
            email: user.email,
            role: user.role,
            password: '',
            phoneNumber: user.phoneNumber || '',
            activeUntil: dateStr,
            TeamId: user.TeamId || ''
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        try {
            setSubmitting(true);
            const payload = { ...formData };
            if (!payload.password) delete payload.password;
            // Convert empty strings to null for optional fields
            if (!payload.TeamId) payload.TeamId = null;
            if (!payload.activeUntil) payload.activeUntil = null;

            if (editingUser) {
                await usersAPI.update(editingUser.id, payload);
                if (currentUser && currentUser.id === editingUser.id) {
                    await refreshUser();
                }
                showNotification('User updated successfully');
            } else {
                await usersAPI.create(payload);
                showNotification('User created successfully');
            }
            setModalOpen(false);
            fetchData();
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await usersAPI.delete(userId);
                showNotification('User deleted successfully');
                fetchData();
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    if (loading) return <div className="loading-state"><Loader className="spinner" size={32} /><p>Loading data...</p></div>;
    if (error) return <div className="error-state"><p>Error: {error}</p><button className="btn-primary" onClick={fetchData}>Retry</button></div>;

    return (
        <div className="user-management">
            {notification && (
                <div className={`toast-notification ${notification.type}`}>
                    <Check size={18} />
                    {notification.message}
                </div>
            )}

            <div className="page-header">
                <div>
                    <h2>User Management</h2>
                    <p className="subtitle">Manage user accounts, roles, and teams</p>
                </div>
                <button className="btn-primary" onClick={openAddModal}>
                    <Plus size={18} /> Add User
                </button>
            </div>

            <div className="card users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Contact</th>
                            <th>Team</th>
                            <th>Role</th>
                            <th>Active Until</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar-sm">{user.username.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <div className="username-text">{user.username}</div>
                                            <div className="email-text">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{user.phoneNumber || '-'}</td>
                                <td>
                                    {user.Team ? <span className="team-badge">{user.Team.name}</span> : <span className="no-team">-</span>}
                                </td>
                                <td>
                                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                                </td>
                                <td>
                                    <div className="date-cell">
                                        <CalIcon size={14} />
                                        {user.activeUntil ? formatDate(user.activeUntil) : 'Lifetime'}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button className="btn-icon-sm" onClick={() => openEditModal(user)}><Edit2 size={16} /></button>
                                        <button className="btn-icon-sm danger" onClick={() => handleDelete(user.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal card">
                        <div className="modal-header">
                            <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                            <button className="btn-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input type="text" className="form-input" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" className="form-input" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="+62..." />
                                </div>
                                <div className="form-group">
                                    <label>Team</label>
                                    <select className="form-input" value={formData.TeamId} onChange={(e) => setFormData({ ...formData, TeamId: e.target.value })}>
                                        <option value="">No Team</option>
                                        {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Role</label>
                                    <select className="form-input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="user">User</option>
                                        <option value="superadmin">Superadmin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Active Until</label>
                                    <input type="date" className="form-input" value={formData.activeUntil} onChange={(e) => setFormData({ ...formData, activeUntil: e.target.value })} />
                                    <small style={{ fontSize: '11px', color: '#888' }}>Leave empty for lifetime access</small>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{editingUser ? 'New Password' : 'Password'}</label>
                                <input type="password" className="form-input" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={editingUser ? 'Leave blank to keep' : ''} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={submitting}>
                                {submitting ? <Loader size={18} className="spinner" /> : <Check size={18} />}
                                {editingUser ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* Reuse existing styles plus updates */
                .user-management { display: flex; flex-direction: column; gap: 24px; position: relative; }
                
                .toast-notification {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    background: #05CD99;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(5, 205, 153, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 500;
                    z-index: 2000;
                    animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                .page-header { display: flex; justify-content: space-between; align-items: center; }
                .users-table-container { overflow-x: auto; }
                .users-table { width: 100%; border-collapse: collapse; }
                .users-table th, .users-table td { padding: 16px; text-align: left; border-bottom: 1px solid #F1F2F6; white-space: nowrap; }
                .users-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
                .user-cell { display: flex; align-items: center; gap: 12px; }
                .user-avatar-sm { width: 36px; height: 36px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; }
                .username-text { font-weight: 500; color: var(--text-main); }
                .email-text { font-size: 12px; color: var(--text-secondary); }
                .team-badge { background: #E0E5F2; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; color: #4B5563; }
                .no-team { color: #9CA3AF; font-size: 12px; font-style: italic; }
                .role-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
                .role-badge.superadmin { background: #EFECFD; color: var(--color-primary); }
                .role-badge.user { background: #E5F9F1; color: #05CD99; }
                .date-cell { display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 13px; }
                .action-btns { display: flex; gap: 8px; }
                .btn-icon-sm { width: 32px; height: 32px; border-radius: 8px; background: #F5F6FA; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
                .btn-icon-sm:hover { background: var(--color-primary); color: white; }
                .btn-icon-sm.danger:hover { background: #EE5D50; }
                
                /* Modal Styles */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal { width: 100%; max-width: 550px; padding: 0; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F1F2F6; }
                .btn-close { background: transparent; border: none; cursor: pointer; }
                .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; }
                .form-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #E0E5F2; background: #FFF; font-size: 14px; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #F1F2F6; }
                .btn-secondary, .btn-primary { padding: 8px 16px; border-radius: 8px; font-weight: 500; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; }
                .btn-secondary { background: #F5F6FA; color: var(--text-main); }
                .btn-primary { background: var(--color-primary); color: white; }
                .loading-state, .error-state { text-align: center; padding: 40px; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 16px; }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                @media (max-width: 640px) {
                    .form-row { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default UserManagement;
