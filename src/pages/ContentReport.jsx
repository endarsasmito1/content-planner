import React, { useState, useEffect } from 'react';
import {
    Loader, Eye, Heart, MessageCircle, ExternalLink,
    Instagram, Facebook, Youtube, Twitter, Edit2, Check, X,
    TrendingUp, BarChart3
} from 'lucide-react';
import TikTokIcon from '../components/TikTokIcon';
import { plansAPI, accountsAPI } from '../services/api';

const ContentReport = () => {
    const [plans, setPlans] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ views: 0, likes: 0, comments: 0 });
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [plansData, accountsData] = await Promise.all([
                plansAPI.getAll(),
                accountsAPI.getAll()
            ]);
            // Filter only posted content
            const postedPlans = plansData.filter(p => p.status === 'posted');
            setPlans(postedPlans);
            setAccounts(accountsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message) => {
        setNotification({ message });
        setTimeout(() => setNotification(null), 3000);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num?.toString() || '0';
    };

    const getPlatformIcon = (platform) => {
        const p = platform?.toLowerCase() || '';
        if (p.includes('instagram')) return <Instagram size={16} />;
        if (p.includes('facebook')) return <Facebook size={16} />;
        if (p.includes('youtube')) return <Youtube size={16} />;
        if (p.includes('twitter') || p.includes('x')) return <Twitter size={16} />;
        if (p.includes('tiktok')) return <TikTokIcon size={16} />;
        return null;
    };

    const getPlatformStyle = (platform) => {
        const p = platform?.toLowerCase() || '';
        if (p.includes('instagram')) return { color: '#E1306C', bg: '#FDEDF3' };
        if (p.includes('facebook')) return { color: '#1877F2', bg: '#E7F1FF' };
        if (p.includes('youtube')) return { color: '#FF0000', bg: '#FFEEEE' };
        if (p.includes('tiktok')) return { color: '#000000', bg: '#F2F2F2' };
        return { color: '#4B5563', bg: '#F5F6FA' };
    };

    const startEdit = (plan) => {
        setEditingId(plan.id);
        setEditData({
            views: plan.views || 0,
            likes: plan.likes || 0,
            comments: plan.comments || 0
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({ views: 0, likes: 0, comments: 0 });
    };

    const saveEdit = async (planId) => {
        try {
            await plansAPI.update(planId, editData);
            showNotification('Analytics updated');
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert('Failed to update: ' + err.message);
        }
    };

    // Calculate totals
    const totalViews = plans.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = plans.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalComments = plans.reduce((sum, p) => sum + (p.comments || 0), 0);

    if (loading) return <div className="loading-state"><Loader className="spinner" size={32} /><p>Loading report...</p></div>;

    return (
        <div className="report-page">
            {notification && (
                <div className="toast-notification">
                    <Check size={18} />
                    {notification.message}
                </div>
            )}

            <div className="page-header">
                <div>
                    <h2>Content Report</h2>
                    <p className="subtitle">Analytics for posted content</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="summary-icon views"><Eye size={24} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{formatNumber(totalViews)}</span>
                        <span className="summary-label">Total Views</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon likes"><Heart size={24} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{formatNumber(totalLikes)}</span>
                        <span className="summary-label">Total Likes</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon comments"><MessageCircle size={24} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{formatNumber(totalComments)}</span>
                        <span className="summary-label">Total Comments</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon posts"><BarChart3 size={24} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{plans.length}</span>
                        <span className="summary-label">Posted Content</span>
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="card table-container">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Judul</th>
                            <th>Tanggal Posting</th>
                            <th>Platform</th>
                            <th>Views</th>
                            <th>Likes</th>
                            <th>Comments</th>
                            <th>Link</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-cell">
                                    Belum ada konten yang posted. Update status konten ke "Posted" untuk melihat report.
                                </td>
                            </tr>
                        ) : (
                            plans.map(plan => {
                                const acc = plan.SocialAccount || {};
                                const pStyle = getPlatformStyle(acc.platform);
                                const isEditing = editingId === plan.id;

                                return (
                                    <tr key={plan.id}>
                                        <td className="title-col">
                                            <div className="content-title">{plan.title}</div>
                                        </td>
                                        <td className="date-col">
                                            {formatDate(plan.postingDate)}
                                        </td>
                                        <td>
                                            <div
                                                className="platform-badge"
                                                style={{ color: pStyle.color, background: pStyle.bg }}
                                            >
                                                {getPlatformIcon(acc.platform)}
                                                <span>@{acc.username || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="metric-col">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="metric-input"
                                                    value={editData.views}
                                                    onChange={e => setEditData({ ...editData, views: parseInt(e.target.value) || 0 })}
                                                />
                                            ) : (
                                                <div className="metric-display">
                                                    <Eye size={14} />
                                                    {formatNumber(plan.views || 0)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="metric-col">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="metric-input"
                                                    value={editData.likes}
                                                    onChange={e => setEditData({ ...editData, likes: parseInt(e.target.value) || 0 })}
                                                />
                                            ) : (
                                                <div className="metric-display likes">
                                                    <Heart size={14} />
                                                    {formatNumber(plan.likes || 0)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="metric-col">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="metric-input"
                                                    value={editData.comments}
                                                    onChange={e => setEditData({ ...editData, comments: parseInt(e.target.value) || 0 })}
                                                />
                                            ) : (
                                                <div className="metric-display comments">
                                                    <MessageCircle size={14} />
                                                    {formatNumber(plan.comments || 0)}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {plan.link ? (
                                                <a href={plan.link} target="_blank" rel="noopener noreferrer" className="link-btn">
                                                    <ExternalLink size={14} /> Lihat
                                                </a>
                                            ) : (
                                                <span className="no-link">-</span>
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <div className="action-btns">
                                                    <button className="btn-icon-sm success" onClick={() => saveEdit(plan.id)}>
                                                        <Check size={16} />
                                                    </button>
                                                    <button className="btn-icon-sm danger" onClick={cancelEdit}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="btn-icon-sm" onClick={() => startEdit(plan)}>
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .report-page { display: flex; flex-direction: column; gap: 24px; }
                .page-header h2 { margin: 0; }
                .subtitle { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }
                
                .summary-cards {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }
                .summary-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .summary-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .summary-icon.views { background: #E7F1FF; color: #1877F2; }
                .summary-icon.likes { background: #FDEDF3; color: #E1306C; }
                .summary-icon.comments { background: #FEF9C3; color: #CA8A04; }
                .summary-icon.posts { background: #DEF7EC; color: #03543F; }
                .summary-info { display: flex; flex-direction: column; }
                .summary-value { font-size: 24px; font-weight: 700; color: var(--text-main); }
                .summary-label { font-size: 13px; color: var(--text-secondary); }

                .table-container { overflow-x: auto; }
                .report-table { width: 100%; border-collapse: collapse; }
                .report-table th, .report-table td { 
                    padding: 14px 16px; 
                    text-align: left; 
                    border-bottom: 1px solid #F1F2F6; 
                }
                .report-table th { 
                    font-weight: 600; 
                    color: var(--text-secondary); 
                    font-size: 12px; 
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                .title-col { min-width: 200px; }
                .date-col { white-space: nowrap; color: var(--text-secondary); font-size: 13px; }
                .metric-col { width: 100px; }
                
                .content-title { font-weight: 600; color: var(--text-main); }
                .platform-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }
                
                .metric-display {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-main);
                }
                .metric-display.likes { color: #E1306C; }
                .metric-display.comments { color: #CA8A04; }
                
                .metric-input {
                    width: 80px;
                    padding: 6px 8px;
                    border: 1px solid #E0E5F2;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .link-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: #E7F1FF;
                    color: #1877F2;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    text-decoration: none;
                }
                .link-btn:hover { background: #D0E3FF; }
                .no-link { color: var(--text-secondary); }

                .action-btns { display: flex; gap: 6px; }
                .btn-icon-sm {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: #F5F6FA;
                    color: var(--text-secondary);
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .btn-icon-sm:hover { background: #E5E7EB; }
                .btn-icon-sm.success { background: #DEF7EC; color: #03543F; }
                .btn-icon-sm.success:hover { background: #BBF0DA; }
                .btn-icon-sm.danger { background: #FEE2E2; color: #DC2626; }
                .btn-icon-sm.danger:hover { background: #FECACA; }

                .empty-cell { 
                    text-align: center; 
                    padding: 60px 20px; 
                    color: var(--text-secondary); 
                }

                .toast-notification {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    background: #05CD99;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 12px;
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

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 300px;
                    gap: 16px;
                    color: var(--text-secondary);
                }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 900px) {
                    .summary-cards { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 500px) {
                    .summary-cards { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default ContentReport;
