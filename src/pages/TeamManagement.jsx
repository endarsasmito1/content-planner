import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X, Check, Loader, Users } from 'lucide-react';
import { teamsAPI } from '../services/api';

const TeamManagement = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [notification, setNotification] = useState(null);

    // Notification Helper
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const data = await teamsAPI.getAll();
            setTeams(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingTeam(null);
        setFormData({ name: '', description: '' });
        setModalOpen(true);
    };

    const openEditModal = (team) => {
        setEditingTeam(team);
        setFormData({ name: team.name, description: team.description || '' });
        setModalOpen(true);
    };

    const handleSave = async () => {
        try {
            setSubmitting(true);
            if (editingTeam) {
                await teamsAPI.update(editingTeam.id, formData);
                showNotification('Team updated successfully');
            } else {
                await teamsAPI.create(formData);
                showNotification('Team created successfully');
            }
            setModalOpen(false);
            fetchTeams();
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (teamId) => {
        if (window.confirm('Are you sure you want to delete this team? Members will be unassigned.')) {
            try {
                await teamsAPI.delete(teamId);
                showNotification('Team deleted successfully');
                fetchTeams();
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    if (loading) return <div className="loading-state"><Loader className="spinner" size={32} /><p>Loading teams...</p></div>;
    if (error) return <div className="error-state"><p>Error: {error}</p><button className="btn-primary" onClick={fetchTeams}>Retry</button></div>;

    return (
        <div className="team-management">
            {notification && (
                <div className={`toast-notification ${notification.type}`}>
                    <Check size={18} />
                    {notification.message}
                </div>
            )}

            <div className="page-header">
                <div>
                    <h2>Team Management</h2>
                    <p className="subtitle">Organize users into teams</p>
                </div>
                <button className="btn-primary" onClick={openAddModal}>
                    <Plus size={18} /> Add Team
                </button>
            </div>

            <div className="card teams-container">
                <table className="teams-table">
                    <thead>
                        <tr>
                            <th>Team Name</th>
                            <th>Description</th>
                            <th>Members</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map(team => (
                            <tr key={team.id}>
                                <td>
                                    <div className="team-name-cell">
                                        <div className="team-icon"><Users size={16} /></div>
                                        {team.name}
                                    </div>
                                </td>
                                <td className="desc-cell">{team.description || '-'}</td>
                                <td>
                                    <div className="members-avatars">
                                        {team.Users && team.Users.slice(0, 5).map(u => (
                                            <div key={u.id} className="member-avatar" title={u.username}>
                                                {u.avatarUrl ? <img src={u.avatarUrl} alt={u.username} /> : u.username.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {team.Users && team.Users.length > 5 && (
                                            <div className="member-more">+{team.Users.length - 5}</div>
                                        )}
                                        {(!team.Users || team.Users.length === 0) && <span className="no-members">No members</span>}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button className="btn-icon-sm" onClick={() => openEditModal(team)}><Edit2 size={16} /></button>
                                        <button className="btn-icon-sm danger" onClick={() => handleDelete(team.id)}><Trash2 size={16} /></button>
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
                            <h3>{editingTeam ? 'Edit Team' : 'Create Team'}</h3>
                            <button className="btn-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Team Name</label>
                                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Creative Team" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-input" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe what this team does..." />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={submitting}>
                                {submitting ? <Loader size={18} className="spinner" /> : <Check size={18} />}
                                {editingTeam ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .team-management { display: flex; flex-direction: column; gap: 24px; position: relative; }
                
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
                .subtitle { color: var(--text-secondary); font-size: 14px; }
                .btn-icon-sm { width: 32px; height: 32px; border-radius: 8px; background: #F5F6FA; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
                .btn-icon-sm:hover { background: var(--color-primary); color: white; }
                .btn-icon-sm.danger:hover { background: #EE5D50; }
                .action-btns { display: flex; gap: 8px; }
                
                .teams-container { overflow-x: auto; }
                .teams-table { width: 100%; border-collapse: collapse; }
                .teams-table th, .teams-table td { padding: 16px; text-align: left; border-bottom: 1px solid #F1F2F6; white-space: nowrap; }
                .teams-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
                
                .team-name-cell { display: flex; align-items: center; gap: 12px; font-weight: 500; }
                .team-icon { width: 32px; height: 32px; background: #EFECFD; color: var(--color-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .desc-cell { color: var(--text-secondary); font-size: 14px; max-width: 300px; white-space: normal; }
                
                .members-avatars { display: flex; align-items: center; }
                .member-avatar { width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; margin-left: -8px; background: #E0E5F2; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; overflow: hidden; }
                .member-avatar:first-child { margin-left: 0; }
                .member-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .member-more { width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; margin-left: -8px; background: #F3F4F6; color: #6B7280; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; }
                .no-members { font-size: 12px; color: #9CA3AF; font-style: italic; }

                /* Modal & Global Reused styles */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal { width: 100%; max-width: 480px; padding: 0; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F1F2F6; }
                .btn-close { background: transparent; border: none; cursor: pointer; }
                .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
                .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; }
                .form-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #E0E5F2; background: #FFF; font-size: 14px; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #F1F2F6; }
                .btn-secondary { background: #F5F6FA; color: var(--text-main); border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
                .btn-primary { background: var(--color-primary); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
                .loading-state, .error-state { text-align: center; padding: 40px; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 16px; }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default TeamManagement;
