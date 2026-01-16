import React, { useState, useEffect } from 'react';
import {
    Plus, Edit2, Trash2, Check, X, Loader, Link as LinkIcon,
    Instagram, Facebook, Youtube, Twitter
} from 'lucide-react';
import TikTokIcon from '../components/TikTokIcon';
import { accountsAPI } from '../services/api';

const InputAkun = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [notification, setNotification] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        platform: 'Instagram',
        username: '',
        link: ''
    });

    const platforms = [
        { name: 'Instagram', color: '#E1306C', bg: '#FDEDF3', icon: <Instagram size={16} /> },
        { name: 'Facebook', color: '#1877F2', bg: '#E7F1FF', icon: <Facebook size={16} /> },
        { name: 'TikTok', color: '#000000', bg: '#F0F0F0', icon: <TikTokIcon size={16} /> },
        { name: 'Youtube', color: '#FF0000', bg: '#FFEEEE', icon: <Youtube size={16} /> },
        { name: 'Twitter (X)', color: '#000000', bg: '#F0F0F0', icon: <Twitter size={16} /> },
        { name: 'Threads', color: '#000000', bg: '#F0F0F0', icon: <span style={{ fontWeight: 800, fontSize: 10 }}>@</span> }
    ];

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await accountsAPI.getAll();
            setAccounts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const openAddModal = () => {
        setEditingAccount(null);
        setFormData({ platform: 'Instagram', username: '', link: '' });
        setModalOpen(true);
    };

    const openEditModal = (acc) => {
        setEditingAccount(acc);
        setFormData({
            platform: acc.platform,
            username: acc.username,
            link: acc.link || ''
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        try {
            setSubmitting(true);
            if (editingAccount) {
                await accountsAPI.update(editingAccount.id, formData);
                showNotification('Account updated successfully');
            } else {
                await accountsAPI.create(formData);
                showNotification('Account added successfully');
            }
            setModalOpen(false);
            fetchAccounts();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this account?')) {
            try {
                await accountsAPI.delete(id);
                showNotification('Account deleted successfully');
                fetchAccounts();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getPlatformConfig = (name) => {
        const found = platforms.find(p => name.includes(p.name.split(' ')[0])); // fuzzy match
        return found || platforms[0];
    };

    if (loading) return <div className="loading-state"><Loader className="spinner" size={32} /><p>Loading accounts...</p></div>;

    return (
        <div className="input-akun-page">
            {notification && (
                <div className={`toast-notification ${notification.type}`}>
                    <Check size={18} />
                    {notification.message}
                </div>
            )}

            <div className="page-header">
                <div>
                    <h2>Input Akun</h2>
                    <p className="subtitle">Manage social media accounts for content planning</p>
                </div>
                <button className="btn-primary" onClick={openAddModal}>
                    <Plus size={18} /> Tambahkan Akun
                </button>
            </div>

            <div className="card table-container">
                <table className="accounts-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Platform</th>
                            <th>Link</th>
                            <th>Diinput Oleh</th>
                            <th>Tanggal Diinput</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.length === 0 ? (
                            <tr><td colSpan="6" className="empty-cell">No accounts found. Click "Tambahkan Akun" to create one.</td></tr>
                        ) : (
                            accounts.map(acc => {
                                const pConfig = getPlatformConfig(acc.platform);
                                return (
                                    <tr key={acc.id}>
                                        <td><span className="username-text">@{acc.username}</span></td>
                                        <td>
                                            <div className="platform-badge" style={{ color: pConfig.color, background: pConfig.bg }}>
                                                {pConfig.icon}
                                                <span>{acc.platform}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {acc.link ? (
                                                <a href={acc.link} target="_blank" rel="noopener noreferrer" className="link-btn">
                                                    <LinkIcon size={14} /> Open
                                                </a>
                                            ) : <span className="text-muted">-</span>}
                                        </td>
                                        <td>
                                            <div className="user-info-sm">
                                                <div className="avatar-xs">{acc.User?.username?.charAt(0).toUpperCase()}</div>
                                                <span>{acc.User?.username}</span>
                                            </div>
                                        </td>
                                        <td className="date-cell">{formatDate(acc.createdAt)}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="btn-icon-sm" onClick={() => openEditModal(acc)}><Edit2 size={16} /></button>
                                                <button className="btn-icon-sm danger" onClick={() => handleDelete(acc.id)}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal card">
                        <div className="modal-header">
                            <h3>{editingAccount ? 'Edit Account' : 'Tambahkan Akun'}</h3>
                            <button className="btn-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Platform</label>
                                <div className="platform-grid">
                                    {platforms.map(p => (
                                        <div
                                            key={p.name}
                                            className={`platform-option ${formData.platform === p.name ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, platform: p.name })}
                                        >
                                            <div className="p-icon" style={{ color: p.color }}>{p.icon}</div>
                                            <span>{p.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Username / Handle</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="@username"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Profile Link (Optional)</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://..."
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={submitting}>
                                {submitting ? <Loader size={16} className="spinner" /> : <Check size={16} />}
                                {editingAccount ? 'Simpan' : 'Tambahkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .input-akun-page { display: flex; flex-direction: column; gap: 24px; position: relative; }
                
                .toast-notification {
                    position: fixed; top: 24px; right: 24px;
                    background: #05CD99; color: white; padding: 12px 20px;
                    border-radius: 12px; box-shadow: 0 4px 12px rgba(5, 205, 153, 0.3);
                    display: flex; align-items: center; gap: 10px; font-weight: 500;
                    z-index: 2000; animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

                .page-header { display: flex; justify-content: space-between; align-items: center; }
                .subtitle { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }
                
                .table-container { overflow-x: auto; }
                .accounts-table { width: 100%; border-collapse: collapse; }
                .accounts-table th, .accounts-table td { padding: 16px; text-align: left; border-bottom: 1px solid #F1F2F6; white-space: nowrap; }
                .accounts-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
                
                .platform-badge {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 6px 12px; border-radius: 20px;
                    font-size: 12px; font-weight: 600;
                }
                .username-text { font-weight: 600; color: var(--text-main); font-size: 14px; }
                .link-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    color: var(--color-primary); font-size: 12px; font-weight: 500; text-decoration: none;
                }
                .link-btn:hover { text-decoration: underline; }
                .text-muted { color: #9CA3AF; font-size: 12px; font-style: italic; }
                
                .user-info-sm { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-main); }
                .avatar-xs { width: 24px; height: 24px; background: #E0E5F2; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #4B5563; }
                .date-cell { font-size: 12px; color: var(--text-secondary); }
                .empty-cell { text-align: center; padding: 40px; color: var(--text-secondary); font-style: italic; }

                /* Action Buttons */
                .action-btns { display: flex; gap: 8px; }
                .btn-icon-sm { width: 32px; height: 32px; border-radius: 8px; background: #F5F6FA; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
                .btn-icon-sm:hover { background: var(--color-primary); color: white; }
                .btn-icon-sm.danger:hover { background: #EE5D50; }

                /* Modal & Form */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal { width: 100%; max-width: 550px; padding: 0; overflow: hidden; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F1F2F6; }
                .btn-close { background: transparent; border: none; cursor: pointer; }
                .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
                .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; }
                .form-input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #E0E5F2; font-size: 14px; }
                
                /* Platform Grid */
                .platform-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
                .platform-option {
                    display: flex; flex-direction: column; align-items: center; gap: 8px;
                    padding: 12px; border: 1px solid #E0E5F2; border-radius: 12px;
                    cursor: pointer; transition: all 0.2s;
                }
                .platform-option:hover { background: #F8F9FC; }
                .platform-option.selected { border-color: var(--color-primary); background: #F4F2FF; }
                .p-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                .platform-option span { font-size: 12px; font-weight: 500; }

                .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #F1F2F6; }
                .btn-secondary { background: #F5F6FA; color: var(--text-main); border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;}
                .btn-primary { background: var(--color-primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600;}
                
                .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 16px; color: var(--text-secondary); }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 600px) {
                    .platform-grid { grid-template-columns: repeat(2, 1fr); }
                }
            `}</style>
        </div>
    );
};

export default InputAkun;
