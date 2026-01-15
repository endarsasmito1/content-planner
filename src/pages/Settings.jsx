import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, User, Mail, Phone, Image, Check } from 'lucide-react';

const Settings = () => {
    const { user, updateUser } = useAuth();

    // Form state - initialize with user data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        avatarUrl: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                avatarUrl: user.avatarUrl || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        const result = await updateUser(formData);

        if (result.success) {
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } else {
            setMessage({ text: result.message || 'Failed to update profile.', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <h2>Account Settings</h2>
                <p className="subtitle">Manage your profile information</p>
            </div>

            <div className="card settings-card">
                <form onSubmit={handleSubmit} className="settings-form">

                    {/* Feedback Message */}
                    {message.text && (
                        <div className={`message-box ${message.type}`}>
                            {message.type === 'success' && <Check size={18} />}
                            {message.text}
                        </div>
                    )}

                    <div className="form-section">
                        <h4 className="section-heading">Personal Information</h4>

                        <div className="form-group avatar-preview-group">
                            <div className="avatar-preview">
                                <img
                                    src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.username}&background=random`}
                                    alt="Preview"
                                    onError={(e) => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
                                />
                            </div>
                            <div className="form-input-wrapper">
                                <label className="input-label">Profile Picture URL</label>
                                <div className="input-group">
                                    <Image size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        value={formData.avatarUrl}
                                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                        placeholder="https://example.com/avatar.jpg"
                                        className="form-input"
                                    />
                                </div>
                                <small className="helper-text">Paste an image URL for your profile picture.</small>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="input-label">Username / Name</label>
                                <div className="input-group">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="Enter username"
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="input-label">Email Address</label>
                                <div className="input-group">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter email"
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="input-label">Phone Number</label>
                            <div className="input-group">
                                <Phone size={18} className="input-icon" />
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="+62 812..."
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Saving...' : (
                                <>
                                    <Save size={18} /> Save Changes
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>

            <style>{`
                .settings-page {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .page-header h2 {
                    font-size: 24px;
                    margin-bottom: 4px;
                }

                .subtitle {
                    color: var(--text-secondary);
                    font-size: 14px;
                }

                .settings-card {
                    padding: 32px;
                }

                .form-section {
                    margin-bottom: 32px;
                }

                .section-heading {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 24px;
                    color: var(--text-main);
                    padding-bottom: 12px;
                    border-bottom: 1px solid #F1F2F6;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 24px;
                    width: 100%;
                }

                .input-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-main);
                }

                .input-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    color: var(--text-secondary);
                }

                .form-input {
                    width: 100%;
                    padding: 12px 16px 12px 44px; /* Space for icon */
                    border-radius: 12px;
                    border: 1px solid #E0E5F2;
                    background: #F8F9FC;
                    font-size: 14px;
                    transition: all 0.2s;
                    color: var(--text-main);
                }

                .form-input:focus {
                    border-color: var(--color-primary);
                    background: white;
                    outline: none;
                    box-shadow: 0 0 0 3px var(--color-primary-light);
                }

                .avatar-preview-group {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 24px;
                }

                .avatar-preview img {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #E0E5F2;
                }

                .form-input-wrapper {
                    flex: 1;
                }
                
                .helper-text {
                    font-size: 12px;
                    color: var(--text-secondary);
                    margin-top: 6px;
                    display: block;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    padding-top: 24px;
                    border-top: 1px solid #F1F2F6;
                }

                .btn-save {
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 500;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .btn-save:hover {
                    background: var(--color-primary-dark);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
                }

                .btn-save:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .message-box {
                    padding: 12px 16px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .message-box.success {
                    background: #E5F9F1;
                    color: #05CD99;
                    border: 1px solid #C6F4E3;
                }

                .message-box.error {
                    background: #FEF2F2;
                    color: #EE5D50;
                    border: 1px solid #FEE2E2;
                }

                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 16px;
                        margin-bottom: 16px;
                    }
                    
                    .avatar-preview-group {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </div>
    );
};

export default Settings;
