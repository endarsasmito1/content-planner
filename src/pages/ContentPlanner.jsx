import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Edit2, Trash2, Check, X, Loader, Link as LinkIcon,
    Calendar as CalendarIcon, Instagram, Facebook, Youtube, Twitter, ChevronDown,
    ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { plansAPI, accountsAPI } from '../services/api';

const ContentPlanner = () => {
    const [plans, setPlans] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [notification, setNotification] = useState(null);

    // Link modal for status change to 'posted'
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [pendingStatusPlan, setPendingStatusPlan] = useState(null);
    const [pendingLink, setPendingLink] = useState('');

    // Multi-select dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filter state
    const [filters, setFilters] = useState({
        accountId: '',
        status: '',
        dateFrom: '',
        dateTo: ''
    });

    const [formData, setFormData] = useState({
        title: '',
        caption: '',
        postingDate: '',
        link: '',
        status: 'draft',
        selectedAccountIds: []
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [plansData, accountsData] = await Promise.all([
                plansAPI.getAll(),
                accountsAPI.getAll()
            ]);
            setPlans(plansData);
            setAccounts(accountsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openAddModal = () => {
        setEditingPlan(null);
        const tmr = new Date();
        tmr.setDate(tmr.getDate() + 1);
        const dateStr = tmr.toISOString().split('T')[0];

        setFormData({
            title: '',
            caption: '',
            postingDate: dateStr,
            link: '',
            status: 'draft',
            selectedAccountIds: accounts.length > 0 ? [accounts[0].id] : []
        });
        setModalOpen(true);
    };

    const openEditModal = (plan) => {
        setEditingPlan(plan);
        setFormData({
            title: plan.title,
            caption: plan.caption || '',
            postingDate: plan.postingDate ? new Date(plan.postingDate).toISOString().split('T')[0] : '',
            link: plan.link || '',
            status: plan.status || 'draft',
            selectedAccountIds: [plan.SocialAccountId]
        });
        setModalOpen(true);
    };

    const isPastOrToday = (dateString) => {
        if (!dateString) return false;
        // Robust YYYY-MM-DD comparison regardless of time
        const planDate = dateString.split('T')[0];

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayYMD = `${year}-${month}-${day}`;

        // Return True if Today >= PlanDate
        return todayYMD >= planDate;
    };

    const handleSave = async () => {
        if (!formData.title || formData.selectedAccountIds.length === 0 || !formData.postingDate) {
            alert('Please fill in Title, Date, and select at least one Account');
            return;
        }

        if (formData.status === 'posted') {
            if (!isPastOrToday(formData.postingDate)) {
                alert('Status "Posted" hanya bisa dipilih jika tanggal posting adalah hari ini atau sebelumnya.');
                return;
            }
        }

        try {
            setSubmitting(true);

            if (editingPlan) {
                const primaryId = formData.selectedAccountIds[0];
                await plansAPI.update(editingPlan.id, {
                    title: formData.title,
                    caption: formData.caption,
                    postingDate: formData.postingDate,
                    link: formData.link,
                    status: formData.status,
                    socialAccountId: primaryId
                });

                if (formData.selectedAccountIds.length > 1) {
                    const extraIds = formData.selectedAccountIds.slice(1);
                    await Promise.all(extraIds.map(accId =>
                        plansAPI.create({
                            title: formData.title,
                            caption: formData.caption,
                            postingDate: formData.postingDate,
                            link: formData.link,
                            status: formData.status,
                            socialAccountId: accId
                        })
                    ));
                    showNotification(`Plan updated & copied to ${extraIds.length} other account(s)`);
                } else {
                    showNotification('Plan updated successfully');
                }

            } else {
                const promises = formData.selectedAccountIds.map(accId =>
                    plansAPI.create({
                        title: formData.title,
                        caption: formData.caption,
                        postingDate: formData.postingDate,
                        link: formData.link,
                        status: formData.status,
                        socialAccountId: accId
                    })
                );
                await Promise.all(promises);
                showNotification(`${promises.length} plan(s) added successfully`);
            }

            setModalOpen(false);
            fetchData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickStatusChange = async (plan, newStatus) => {
        if (newStatus === 'posted' && !isPastOrToday(plan.postingDate)) {
            alert('Status "Posted" hanya bisa dipilih jika tanggal posting adalah hari ini atau sebelumnya.');
            return;
        }

        // If changing to 'posted', require link
        if (newStatus === 'posted') {
            setPendingStatusPlan(plan);
            setPendingLink(plan.link || '');
            setLinkModalOpen(true);
            return;
        }

        // For draft status, update directly
        try {
            await plansAPI.update(plan.id, { status: newStatus });
            showNotification('Status updated');
            const plansData = await plansAPI.getAll();
            setPlans(plansData);
        } catch (err) {
            console.error(err);
            alert('Failed to update status: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleConfirmPosted = async () => {
        if (!pendingLink.trim()) {
            alert('Link wajib diisi untuk mengubah status ke Posted');
            return;
        }

        try {
            await plansAPI.update(pendingStatusPlan.id, { status: 'posted', link: pendingLink });
            showNotification('Status updated to Posted');
            setLinkModalOpen(false);
            setPendingStatusPlan(null);
            setPendingLink('');
            const plansData = await plansAPI.getAll();
            setPlans(plansData);
        } catch (err) {
            console.error(err);
            alert('Failed to update status: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await plansAPI.delete(id);
                showNotification('Plan deleted successfully');
                fetchData();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const toggleAccountSelection = (id) => {
        setFormData(prev => {
            const ids = prev.selectedAccountIds;
            if (ids.includes(id)) {
                return { ...prev, selectedAccountIds: ids.filter(x => x !== id) };
            } else {
                return { ...prev, selectedAccountIds: [...ids, id] };
            }
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const getPlatformIcon = (platformName) => {
        const name = platformName?.toLowerCase() || '';
        if (name.includes('instagram')) return <Instagram size={14} />;
        if (name.includes('facebook')) return <Facebook size={14} />;
        if (name.includes('youtube')) return <Youtube size={14} />;
        if (name.includes('twitter')) return <Twitter size={14} />;
        return <span style={{ fontSize: 10, fontWeight: 800 }}>{platformName?.[0]}</span>;
    };

    const getPlatformStyle = (platform) => {
        const p = platform?.toLowerCase() || '';
        if (p.includes('instagram')) return { color: '#E1306C', bg: '#FDEDF3', border: '#FFD1DC' };
        if (p.includes('facebook')) return { color: '#1877F2', bg: '#E7F1FF', border: '#C8DFFF' };
        if (p.includes('youtube')) return { color: '#FF0000', bg: '#FFEEEE', border: '#FFCACA' };
        return { color: '#4B5563', bg: '#F5F6FA', border: '#E5E7EB' };
    };

    const getAccountDetails = (accId) => {
        const acc = accounts.find(a => a.id === accId || a.id === parseInt(accId));
        return acc ? acc : { platform: 'Unknown', username: 'Unknown' };
    };

    if (loading) return <div className="loading-state"><Loader className="spinner" size={32} /><p>Loading plans...</p></div>;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Reset to first page
    };

    // Apply filters
    const filteredPlans = plans.filter(plan => {
        // Filter by account
        if (filters.accountId && plan.SocialAccountId !== parseInt(filters.accountId)) {
            return false;
        }
        // Filter by status
        if (filters.status && plan.status !== filters.status) {
            return false;
        }
        // Filter by date range
        if (filters.dateFrom) {
            const planDate = plan.postingDate?.split('T')[0];
            if (planDate < filters.dateFrom) return false;
        }
        if (filters.dateTo) {
            const planDate = plan.postingDate?.split('T')[0];
            if (planDate > filters.dateTo) return false;
        }
        return true;
    });

    // Pagination calculations (use filteredPlans instead of plans)
    const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPlans = filteredPlans.slice(startIndex, endIndex);

    const resetFilters = () => {
        setFilters({ accountId: '', status: '', dateFrom: '', dateTo: '' });
        setCurrentPage(1);
    };

    return (
        <div className="planner-page">
            {notification && (
                <div className={`toast-notification ${notification.type}`}>
                    <Check size={18} />
                    {notification.message}
                </div>
            )}

            <div className="page-header">
                <div>
                    <h2>Content Planner</h2>
                    <p className="subtitle">Schedule and manage your posts</p>
                </div>
                <button className="btn-primary" onClick={openAddModal}>
                    <Plus size={18} /> New Plan
                </button>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar card">
                <div className="filter-icon"><Filter size={18} /></div>
                <div className="filter-group">
                    <label>Account</label>
                    <select
                        value={filters.accountId}
                        onChange={e => { setFilters({ ...filters, accountId: e.target.value }); setCurrentPage(1); }}
                    >
                        <option value="">Semua Account</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.platform} - @{acc.username}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Status</label>
                    <select
                        value={filters.status}
                        onChange={e => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}
                    >
                        <option value="">Semua Status</option>
                        <option value="draft">Draft</option>
                        <option value="posted">Posted</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Dari Tanggal</label>
                    <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={e => { setFilters({ ...filters, dateFrom: e.target.value }); setCurrentPage(1); }}
                    />
                </div>
                <div className="filter-group">
                    <label>Sampai Tanggal</label>
                    <input
                        type="date"
                        value={filters.dateTo}
                        onChange={e => { setFilters({ ...filters, dateTo: e.target.value }); setCurrentPage(1); }}
                    />
                </div>
                {(filters.accountId || filters.status || filters.dateFrom || filters.dateTo) && (
                    <button className="btn-reset-filter" onClick={resetFilters}>
                        <X size={14} /> Reset
                    </button>
                )}
            </div>

            <div className="card table-container">
                <table className="planner-table">
                    <thead>
                        <tr>
                            <th>Judul</th>
                            <th>Caption</th>
                            <th>Account</th>
                            <th>Status</th>
                            <th>Link</th>
                            <th>Tanggal Posting</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPlans.length === 0 ? (
                            <tr><td colSpan="7" className="empty-cell">No plans yet. Click "New Plan" to start.</td></tr>
                        ) : (
                            paginatedPlans.map(plan => {
                                const acc = plan.SocialAccount || getAccountDetails(plan.SocialAccountId);
                                const pStyle = getPlatformStyle(acc.platform);

                                return (
                                    <tr key={plan.id}>
                                        <td className="title-col">
                                            <div className="content-title">{plan.title}</div>
                                            {plan.link && (
                                                <a href={plan.link} target="_blank" rel="noopener noreferrer" className="link-text">
                                                    <LinkIcon size={12} /> Link Resource
                                                </a>
                                            )}
                                        </td>
                                        <td className="caption-col">
                                            <div className="content-caption">
                                                {plan.caption || '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <div
                                                className="account-badge"
                                                style={{
                                                    color: pStyle.color,
                                                    background: pStyle.bg,
                                                    border: `1px solid ${pStyle.border}`
                                                }}
                                            >
                                                {getPlatformIcon(acc.platform)}
                                                <span>@{acc.username}</span>
                                            </div>
                                        </td>

                                        {/* STATUS COLUMN (INLINE EDIT) */}
                                        <td className="status-col">
                                            <select
                                                className={`status-select ${plan.status || 'draft'}`}
                                                value={plan.status || 'draft'}
                                                onChange={(e) => handleQuickStatusChange(plan, e.target.value)}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="posted">Posted</option>
                                            </select>
                                        </td>

                                        {/* LINK COLUMN */}
                                        <td className="link-col">
                                            {plan.link ? (
                                                <a href={plan.link} target="_blank" rel="noopener noreferrer" className="link-badge">
                                                    <LinkIcon size={12} /> Lihat
                                                </a>
                                            ) : (
                                                <span className="no-link">-</span>
                                            )}
                                        </td>

                                        {/* TANGGAL POSTING */}
                                        <td className="date-col">
                                            <div className="date-badge">
                                                <CalendarIcon size={14} />
                                                <span>{formatDate(plan.postingDate)}</span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="action-btns">
                                                <button className="btn-icon-sm" onClick={() => openEditModal(plan)}><Edit2 size={16} /></button>
                                                <button className="btn-icon-sm danger" onClick={() => handleDelete(plan.id)}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {filteredPlans.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            <span>Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredPlans.length)} dari {filteredPlans.length} data</span>
                            <select className="items-per-page" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                                <option value={10}>10 per halaman</option>
                                <option value={20}>20 per halaman</option>
                                <option value={50}>50 per halaman</option>
                                <option value={100}>100 per halaman</option>
                            </select>
                        </div>
                        <div className="pagination-buttons">
                            <button
                                className="btn-page"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                            >
                                First
                            </button>
                            <button
                                className="btn-page"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Page Numbers */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        className={`btn-page ${currentPage === pageNum ? 'active' : ''}`}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                className="btn-page"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                className="btn-page"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                Last
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal card">
                        <div className="modal-header">
                            <h3>{editingPlan ? 'Edit Content Plan' : 'New Content Plan'}</h3>
                            <button className="btn-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Post Title / Idea"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Posting Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.postingDate}
                                        onChange={e => setFormData({ ...formData, postingDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group half">
                                    <label>Status</label>
                                    <select
                                        className="form-input"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="posted">Posted</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group" ref={dropdownRef}>
                                <label>Social Accounts</label>
                                <div className="custom-select" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                    <div className={`select-trigger ${formData.selectedAccountIds.length === 0 ? 'placeholder' : ''}`}>
                                        {formData.selectedAccountIds.length === 0 ? 'Select Accounts' :
                                            formData.selectedAccountIds.length === 1 ?
                                                (getAccountDetails(formData.selectedAccountIds[0])?.platform + ' - @' + getAccountDetails(formData.selectedAccountIds[0])?.username)
                                                : `${formData.selectedAccountIds.length} accounts selected`
                                        }
                                        <ChevronDown size={16} className={`chevron ${isDropdownOpen ? 'rotate' : ''}`} />
                                    </div>

                                    {isDropdownOpen && (
                                        <div className="select-dropdown">
                                            {accounts.map(acc => {
                                                const isSelected = formData.selectedAccountIds.includes(acc.id);
                                                const pStyle = getPlatformStyle(acc.platform);
                                                return (
                                                    <div
                                                        key={acc.id}
                                                        className={`select-option ${isSelected ? 'selected' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleAccountSelection(acc.id);
                                                        }}
                                                    >
                                                        <div className={`checkbox ${isSelected ? 'checked' : ''}`} style={isSelected ? { background: pStyle.color, borderColor: pStyle.color } : {}}>
                                                            {isSelected && <Check size={10} color="white" />}
                                                        </div>
                                                        <span style={{ color: pStyle.color, fontWeight: 600 }}>
                                                            {acc.platform}
                                                        </span>
                                                        <span className="username">@{acc.username}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Caption</label>
                                <textarea
                                    className="form-input textarea"
                                    placeholder="Write your caption here..."
                                    rows="4"
                                    value={formData.caption}
                                    onChange={e => setFormData({ ...formData, caption: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Resource Link (Optional)</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://drive.google.com/..."
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={submitting}>
                                {submitting ? <Loader size={16} className="spinner" /> : <Check size={16} />}
                                {editingPlan ? 'Save & Clone' : 'Create Plan(s)'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Link Modal for Posted Status */}
            {linkModalOpen && (
                <div className="modal-overlay">
                    <div className="modal card" style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h3>Masukkan Link Konten</h3>
                            <button className="btn-close" onClick={() => setLinkModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                                Untuk mengubah status ke <strong>Posted</strong>, silakan masukkan link konten yang sudah diposting.
                            </p>
                            <div className="form-group">
                                <label>Link Konten *</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://instagram.com/p/..."
                                    value={pendingLink}
                                    onChange={e => setPendingLink(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setLinkModalOpen(false)}>Batal</button>
                            <button className="btn-primary" onClick={handleConfirmPosted}>
                                <Check size={16} /> Konfirmasi Posted
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .planner-page { display: flex; flex-direction: column; gap: 24px; }
                .page-header { display: flex; justify-content: space-between; align-items: center; }
                .subtitle { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }
                .toast-notification { position: fixed; top: 24px; right: 24px; background: #05CD99; color: white; padding: 12px 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(5, 205, 153, 0.3); display: flex; align-items: center; gap: 10px; font-weight: 500; z-index: 2000; animation: slideIn 0.3s ease-out; }
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                
                /* FILTER BAR STYLES */
                .filter-bar {
                    display: flex;
                    align-items: flex-end;
                    gap: 16px;
                    padding: 16px 20px;
                    flex-wrap: wrap;
                }
                .filter-icon {
                    color: var(--text-secondary);
                    padding-bottom: 8px;
                }
                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .filter-group label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                }
                .filter-group select,
                .filter-group input {
                    padding: 8px 12px;
                    border: 1px solid #E0E5F2;
                    border-radius: 8px;
                    font-size: 13px;
                    min-width: 150px;
                    background: white;
                }
                .filter-group select:focus,
                .filter-group input:focus {
                    outline: none;
                    border-color: var(--color-primary);
                }
                .btn-reset-filter {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 12px;
                    background: #FEE2E2;
                    color: #DC2626;
                    border: none;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    margin-left: auto;
                }
                .btn-reset-filter:hover {
                    background: #FECACA;
                }
                
                .table-container { overflow-x: auto; }
                .planner-table { width: 100%; border-collapse: collapse; }
                .planner-table th, .planner-table td { padding: 16px; text-align: left; border-bottom: 1px solid #F1F2F6; }
                .planner-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; white-space: nowrap; }
                .title-col { min-width: 180px; }
                .caption-col { min-width: 200px; }
                .date-col { width: 140px; }
                .status-col { width: 100px; }
                .link-col { width: 80px; }

                .link-badge { display: inline-flex; align-items: center; gap: 4px; background: #E7F1FF; color: #1877F2; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none; }
                .link-badge:hover { background: #D0E3FF; }
                .no-link { color: var(--text-secondary); font-size: 12px; }

                .date-badge { display: inline-flex; align-items: center; gap: 6px; background: #F8F9FC; padding: 6px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; color: var(--text-secondary); white-space: nowrap; }
                
                /* STATUS DROPDOWN STYLES */
                .status-select { 
                    padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase;
                    border: 1px solid transparent; cursor: pointer; appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat; background-position: right 8px center; padding-right: 24px;
                }
                .status-select.draft { background-color: #E2E8F0; color: #475569; }
                .status-select.posted { background-color: #DEF7EC; color: #03543F; }
                .status-select:hover { opacity: 0.9; }
                .status-select:focus { outline: none; border-color: var(--color-primary); }

                /* Common */
                .content-title { font-weight: 600; color: var(--text-main); font-size: 14px; }
                .link-text { font-size: 11px; color: var(--color-primary); display: inline-flex; align-items: center; gap: 3px; margin-top: 4px; text-decoration: none; }
                .link-text:hover { text-decoration: underline; }
                .content-caption { font-size: 13px; color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap; }
                .account-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }
                .action-btns { display: flex; gap: 8px; }
                .btn-icon-sm { width: 32px; height: 32px; border-radius: 8px; background: #F5F6FA; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
                .empty-cell { text-align: center; padding: 40px; color: var(--text-secondary); font-style: italic; }

                /* CUSTOM SELECT */
                .custom-select { position: relative; user-select: none; }
                .select-trigger { padding: 10px 12px; border-radius: 8px; border: 1px solid #E0E5F2; font-size: 14px; background: white; cursor: pointer; display: flex; justify-content: space-between; align-items: center; min-height: 42px; }
                .select-trigger.placeholder { color: var(--text-secondary); }
                .chevron { color: var(--text-secondary); transition: transform 0.2s; }
                .chevron.rotate { transform: rotate(180deg); }
                .select-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #E0E5F2; border-radius: 8px; margin-top: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); z-index: 1005; max-height: 200px; overflow-y: auto; padding: 4px; }
                .select-option { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
                .select-option:hover { background: #F5F6FA; }
                .select-option.selected { background: #F0F9FF; }
                .checkbox { width: 16px; height: 16px; border: 2px solid #D1D5DB; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .username { font-size: 12px; color: var(--text-secondary); margin-left: auto; }

                /* MODAL */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal { width: 100%; max-width: 550px; padding: 0; overflow: visible; background: white; border-radius: 12px; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F1F2F6; }
                .btn-close { background: transparent; border: none; cursor: pointer; }
                .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
                .form-row { display: flex; gap: 16px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
                .form-group label { font-weight: 500; font-size: 13px; color: var(--text-main); }
                .form-input { padding: 10px 12px; border-radius: 8px; border: 1px solid #E0E5F2; font-size: 14px; font-family: inherit; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #F1F2F6; }
                .btn-secondary { background: #F5F6FA; color: var(--text-main); border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;}
                .btn-primary { background: var(--color-primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600;}
                .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 16px; color: var(--text-secondary); }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* PAGINATION STYLES */
                .pagination-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 0;
                    border-top: 1px solid #F1F2F6;
                    margin-top: 8px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .pagination-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    font-size: 13px;
                    color: var(--text-secondary);
                }
                .items-per-page {
                    padding: 6px 10px;
                    border-radius: 6px;
                    border: 1px solid #E0E5F2;
                    font-size: 12px;
                    background: white;
                    cursor: pointer;
                }
                .pagination-buttons {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .btn-page {
                    min-width: 32px;
                    height: 32px;
                    padding: 0 8px;
                    border-radius: 6px;
                    border: 1px solid #E0E5F2;
                    background: white;
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }
                .btn-page:hover:not(:disabled) {
                    border-color: var(--color-primary);
                    color: var(--color-primary);
                    background: #F8F7FF;
                }
                .btn-page:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .btn-page.active {
                    background: var(--color-primary);
                    color: white;
                    border-color: var(--color-primary);
                }
                
                @media (max-width: 600px) {
                    .form-row { flex-direction: column; gap: 16px; }
                    .content-col, .title-col, .caption-col { min-width: unset; }
                }
            `}</style>
        </div>
    );
};

export default ContentPlanner;
