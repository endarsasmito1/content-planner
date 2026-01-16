import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Instagram, Facebook, Youtube, Twitter, X, Check, Loader, ChevronDown } from 'lucide-react';
import TikTokIcon from '../components/TikTokIcon';
import { plansAPI, accountsAPI } from '../services/api';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [plans, setPlans] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedDays, setExpandedDays] = useState(null);

    // Multi-select dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Modal States
    const [isModalOpen, setModalOpen] = useState(false); // Add/Edit Modal
    const [isStatusModalOpen, setStatusModalOpen] = useState(false); // Status Only Modal
    const [submitting, setSubmitting] = useState(false);

    // This is used for BOTH modals to identify which plan we are working on
    const [editingPlan, setEditingPlan] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        caption: '',
        postingDate: '',
        link: '',
        status: 'draft',
        selectedAccountIds: []
    });

    const [statusData, setStatusData] = useState('draft'); // For status modal
    const [linkData, setLinkData] = useState(''); // Link for posted status

    // Close expansion when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setExpandedDays(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // Close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            const [plansData, accountsData] = await Promise.all([
                plansAPI.getAll(),
                accountsAPI.getAll()
            ]);
            setPlans(plansData);
            setAccounts(accountsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openAddModal = (dateStr) => {
        setEditingPlan(null);
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

    const openStatusModal = (plan) => {
        setEditingPlan(plan);
        setStatusData(plan.status || 'draft');
        setLinkData(plan.link || '');
        setStatusModalOpen(true);
    };

    const isToday = (dateString) => {
        const d = new Date(dateString);
        const today = new Date();
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    };

    const isPastOrToday = (dateString) => {
        if (!dateString) return false;
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
            const promises = formData.selectedAccountIds.map(accId =>
                plansAPI.create({ ...formData, socialAccountId: accId })
            );
            await Promise.all(promises);

            setPlans(await plansAPI.getAll());
            setModalOpen(false);
        } catch (err) {
            alert("Failed to save plan: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveStatus = async () => {
        if (!editingPlan) return;

        if (statusData === 'posted' && !isPastOrToday(editingPlan.postingDate)) {
            alert('Status "Posted" hanya bisa dipilih jika tanggal posting adalah hari ini atau sebelumnya.');
            return;
        }

        // Require link for posted status
        if (statusData === 'posted' && !linkData.trim()) {
            alert('Link wajib diisi untuk mengubah status ke Posted');
            return;
        }

        try {
            setSubmitting(true);
            // Send status and link
            await plansAPI.update(editingPlan.id, { status: statusData, link: linkData });
            setPlans(await plansAPI.getAll());
            setStatusModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to update status: " + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
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

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)); setExpandedDays(null); };
    const handleNextMonth = () => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)); setExpandedDays(null); };
    const handleMonthChange = (e) => { setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1)); setExpandedDays(null); };
    const handleYearChange = (e) => { setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1)); setExpandedDays(null); };
    const goToToday = () => { setCurrentDate(new Date()); setExpandedDays(null); };

    const toggleExpand = (e, dateStr) => {
        e.stopPropagation();
        setExpandedDays(prev => prev === dateStr ? null : dateStr);
    };

    const getPlatformIcon = (platform) => {
        const p = platform?.toLowerCase() || '';
        if (p.includes('instagram')) return <Instagram size={12} />;
        if (p.includes('facebook')) return <Facebook size={12} />;
        if (p.includes('youtube')) return <Youtube size={12} />;
        if (p.includes('twitter') || p.includes('x')) return <Twitter size={12} />;
        if (p.includes('tiktok')) return <TikTokIcon size={12} />;
        return <span style={{ fontSize: 9, fontWeight: 'bold' }}>{platform?.[0]}</span>;
    };

    const getPlatformStyle = (platform) => {
        const p = platform?.toLowerCase() || '';
        if (p.includes('instagram')) return { color: '#E1306C', bg: '#FDEDF3', border: '#FFD1DC' };
        if (p.includes('facebook')) return { color: '#1877F2', bg: '#E7F1FF', border: '#C8DFFF' };
        if (p.includes('youtube')) return { color: '#FF0000', bg: '#FFEEEE', border: '#FFCACA' };
        if (p.includes('tiktok')) return { color: '#000000', bg: '#F2F2F2', border: '#D9D9D9' };
        return { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return '#F1F5F9'; // Gray
            case 'scripting': return '#EEF2FF'; // Indigo
            case 'shooting': return '#FFFBEB'; // Amber
            case 'editing': return '#EFF6FF'; // Blue
            case 'ready': return '#F5F3FF'; // Violet
            case 'posted': return '#ECFDF5'; // Emerald
            default: return '#F3F4F6';
        }
    };

    const getStatusTextColor = (status) => {
        switch (status) {
            case 'draft': return '#64748B';
            case 'scripting': return '#4338CA';
            case 'shooting': return '#B45309';
            case 'editing': return '#1D4ED8';
            case 'ready': return '#6D28D9';
            case 'posted': return '#059669';
            default: return '#374151';
        }
    };

    const getAccountDetails = (accId) => {
        const acc = accounts.find(a => a.id === accId || a.id === parseInt(accId));
        return acc ? acc : { platform: 'Unknown', username: 'Unknown' };
    };

    const renderPlanItem = (plan) => (
        <div
            key={plan.id}
            className="plan-item"
            style={{
                background: getStatusColor(plan.status),
                color: getStatusTextColor(plan.status),
                border: '1px solid transparent',
            }}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openStatusModal(plan);
            }}
        >
            <span className="plan-icon">{getPlatformIcon(plan.SocialAccount?.platform)}</span>
            <span className="plan-title" style={{ flex: 1 }}>{plan.title}</span>

            <div className="plan-tooltip">
                <div className="tooltip-header">{plan.title}</div>
                <div className="tooltip-meta">
                    <span className="tooltip-badge">
                        {getPlatformIcon(plan.SocialAccount?.platform)}
                        {plan.SocialAccount?.username || 'No Account'}
                    </span>
                    <span className={`status-pill ${plan.status}`}>{plan.status || 'draft'}</span>
                </div>
                {plan.caption && (
                    <div className="tooltip-caption">
                        {plan.caption.length > 100 ? plan.caption.substring(0, 100) + '...' : plan.caption}
                    </div>
                )}
            </div>
        </div>
    );

    const renderCalendarGrid = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const days = [];

        // Items to show per cell before "View More"
        const MAX_ITEMS = 3;

        for (let i = 0; i < startDay; i++) days.push(<div key={`prev-${i}`} className="calendar-cell empty"></div>);
        for (let i = 1; i <= totalDays; i++) {
            const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const dateStr = `${currentDayDate.getFullYear()}-${String(currentDayDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isToday = i === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
            const dayPlans = plans.filter(p => p.postingDate && p.postingDate.startsWith(dateStr));

            const hasMore = dayPlans.length > MAX_ITEMS;
            const isExpanded = expandedDays === dateStr;
            const previewItems = dayPlans.slice(0, MAX_ITEMS);

            days.push(
                <div
                    key={i}
                    className={`calendar-cell ${isToday ? 'today' : ''}`}
                    onClick={() => openAddModal(dateStr)} // Clicking cell adds plan now since + button is gone
                    style={{ cursor: 'pointer', zIndex: isExpanded ? 50 : 1 }} // Boost Z-Index when expanded
                >
                    <div className="cell-header">
                        <span className="day-number">{i}</span>
                    </div>
                    <div className="day-content">
                        {previewItems.map(renderPlanItem)}

                        {/* More Button */}
                        {hasMore && (
                            <button className="btn-more" onClick={(e) => toggleExpand(e, dateStr)}>
                                + {dayPlans.length - MAX_ITEMS} More
                            </button>
                        )}
                    </div>

                    {isExpanded && (
                        <div className="cell-overlay" onClick={(e) => e.stopPropagation()}>
                            <div className="cell-header">
                                <span className="day-number">{i}</span>
                            </div>
                            <div className="day-content expanded-content">
                                {dayPlans.map(renderPlanItem)}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Calculate total cells needed to complete the last row
        const totalNeeded = days.length;
        const rowsNeeded = Math.ceil(totalNeeded / 7);
        const remainingCells = (rowsNeeded * 7) - totalNeeded;

        for (let i = 1; i <= remainingCells; i++) days.push(<div key={`next-${i}`} className="calendar-cell empty"></div>);

        // Return grid with dynamic row style
        return (
            <div className="calendar-grid" style={{ gridTemplateRows: `repeat(${rowsNeeded}, 1fr)` }}>
                {days}
            </div>
        );
    };

    // Remove legacy render call in main JSX and just call the function which now returns the wrapper


    // ... Helper consts (monthNames, etc)
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
        <div className="calendar-page">
            <div className="calendar-header">
                <div className="header-left">
                    <h2>Calendar</h2>
                    <p className="subtitle">Manage your content schedule</p>
                </div>
                <div className="calendar-controls">
                    <button className="btn-today" onClick={goToToday}>Hari Ini</button>

                    <button className="btn-nav" onClick={handlePrevMonth}><ChevronLeft size={20} /></button>

                    <select className="calendar-select month-select" value={currentDate.getMonth()} onChange={handleMonthChange}>
                        {monthNames.map((month, index) => <option key={month} value={index}>{month}</option>)}
                    </select>

                    <button className="btn-nav" onClick={handleNextMonth}><ChevronRight size={20} /></button>

                    <select className="calendar-select year-select" value={currentDate.getFullYear()} onChange={handleYearChange}>
                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
            </div>

            <div className="calendar-content card">
                <div className="calendar-grid-header">
                    {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(d => <div key={d}>{d}</div>)}
                </div>

                {renderCalendarGrid()}
            </div>

            {/* ... */}

            <style>{`
                .calendar-page { padding: 0; height: 100%; display: flex; flex-direction: column; gap: 16px; min-height: 0; }
                .calendar-header { display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; padding: 0 4px; }
                .calendar-content { flex: 1; display: flex; flex-direction: column; background: white; border-radius: var(--border-radius-lg); padding: 0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-height: 0; }
                .calendar-controls, .nav-buttons, .select-container { display: flex; align-items: center; gap: 8px; }
                .calendar-grid-header { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: 600; color: var(--text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0; padding: 12px 0 8px 0; border-bottom: 1px solid #E5E7EB; background: white; }
                
                .calendar-grid { 
                    display: grid; 
                    grid-template-columns: repeat(7, 1fr); 
                    gap: 1px; 
                    background: #E5E7EB; 
                    border: none;
                    flex: 1; 
                    min-height: 0; 
                    overflow: hidden;
                }

                .calendar-cell { background: white; padding: 4px; display: flex; flex-direction: column; position: relative; gap: 4px; height: 100%; min-height: 0; transition: background-color 0.2s; border-radius: 0; }
                .calendar-cell:hover { background-color: #F9FAFB; } 
                .calendar-cell.empty { background: #F9FAFB; }
                .calendar-cell.today { background: #F0F9FF; }
                .day-number { font-weight: 600; color: var(--text-main); font-size: 13px; margin-bottom: 2px; }
                .day-content { display: flex; flex-direction: column; gap: 2px; flex: 1; overflow: visible; }
                .expanded-content { overflow: visible !important; }

                .plan-item { position: relative; display: flex; align-items: center; gap: 6px; padding: 4px 6px; border-radius: 4px; font-size: 11px; font-weight: 500; white-space: nowrap; cursor: pointer; flex-shrink: 0; height: 24px; }
                .plan-item:hover { z-index: 2000; }
                .plan-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .btn-more { font-size: 10px; color: var(--color-primary); background: #EEF2FF; border: 1px dashed #6366f1; border-radius: 4px; cursor: pointer; text-align: center; padding: 4px; margin-top: 2px; font-weight: 600; width: 100%; transition: all 0.2s; flex-shrink: 0; }
                .btn-more:hover { background: #E0E7FF; text-decoration: none; }
                
                .cell-overlay { position: absolute; top: -5px; left: -5px; width: calc(100% + 10px); min-width: 200px; min-height: calc(100% + 10px); height: auto; background: white; border: 1px solid var(--color-primary); border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); z-index: 1000; padding: 12px; display: flex; flex-direction: column; gap: 8px; overflow: visible; }
                
                .btn-today { padding: 0 12px; height: 32px; background: white; border: 1px solid #E0E5F2; border-radius: 8px; font-weight: 600; color: var(--text-secondary); cursor: pointer; font-size: 12px; }
                .btn-today:hover { color: var(--color-primary); border-color: var(--color-primary); background: #F8F7FF; }
                .btn-nav { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #E0E5F2; background: white; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; cursor: pointer; }
                .btn-nav:hover { border-color: var(--color-primary); color: var(--color-primary); background: #F8F7FF; }
                .calendar-select { height: 32px; padding: 0 24px 0 8px; border-radius: 8px; border: 1px solid #E0E5F2; font-size: 12px; font-weight: 600; color: var(--text-main); background: white; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; }
                .month-select { min-width: 100px; } 
                .year-select { min-width: 70px; }

                /* Tooltip & Modal Styles */
                .plan-tooltip { visibility: hidden; opacity: 0; position: absolute; bottom: 110%; left: 0; min-width: 200px; max-width: 250px; background: #1F2937; color: white; padding: 8px 12px; border-radius: 8px; z-index: 9999; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); transition: all 0.2s ease; pointer-events: none; text-align: left; white-space: normal; transform: translateY(4px); }
                .plan-item:hover .plan-tooltip { visibility: visible; opacity: 1; transform: translateY(0); }
                .tooltip-header { font-weight: 600; font-size: 12px; margin-bottom: 4px; line-height: 1.4; color: #F3F4F6; }
                .tooltip-meta { display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #9CA3AF; margin-bottom: 6px; }
                .tooltip-badge { display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; }
                .tooltip-caption { font-size: 10px; color: #D1D5DB; line-height: 1.4; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px; }
                .status-pill { padding: 2px 4px; border-radius: 4px; text-transform: uppercase; font-size: 8px; font-weight: bold; }
                .status-pill.draft { background: #4B5563; color: white; }
                .status-pill.posted { background: #10B981; color: white; }

                /* Common Modal Styles */
                .modal-overlay-fixed { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal { width: 100%; max-width: 550px; padding: 0; overflow: visible; background: white; border-radius: 12px; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F1F2F6; }
                .btn-close { background: transparent; border: none; cursor: pointer; }
                .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
                .form-row { display: flex; gap: 16px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
                .form-group label { font-weight: 500; font-size: 13px; color: var(--text-main); }
                .form-input { padding: 10px 12px; border-radius: 8px; border: 1px solid #E0E5F2; font-size: 14px; font-family: inherit; }
                .form-input:focus { outline: none; border-color: var(--color-primary); }
                .textarea { resize: vertical; min-height: 80px; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #F1F2F6; }
                .btn-secondary { background: #F5F6FA; color: var(--text-main); border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; }
                .btn-primary { background: var(--color-primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .custom-select { position: relative; user-select: none; }
                .select-trigger { padding: 10px 12px; border-radius: 8px; border: 1px solid #E0E5F2; font-size: 14px; background: white; cursor: pointer; display: flex; justify-content: space-between; align-items: center; min-height: 42px; }
                .select-trigger.placeholder { color: var(--text-secondary); }
                .select-trigger:hover { border-color: var(--color-primary); }
                .chevron { color: var(--text-secondary); transition: transform 0.2s; }
                .chevron.rotate { transform: rotate(180deg); }
                .select-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #E0E5F2; border-radius: 8px; margin-top: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); z-index: 2005; max-height: 200px; overflow-y: auto; padding: 4px; }
                .select-option { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
                .select-option:hover { background: #F5F6FA; }
                .select-option.selected { background: #F0F9FF; }
                .checkbox { width: 16px; height: 16px; border: 2px solid #D1D5DB; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .username { font-size: 12px; color: var(--text-secondary); margin-left: auto; }
            `}</style>

            {/* ADD PLAN MODAL */}
            {isModalOpen && (
                <div className="modal-overlay-fixed">
                    {/* ... Same Add Modal as before ... */}
                    <div className="modal card">
                        <div className="modal-header">
                            <h3>New Content Plan</h3>
                            <button className="btn-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" className="form-input" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Posting Date</label>
                                    <input type="date" className="form-input" value={formData.postingDate} onChange={e => setFormData({ ...formData, postingDate: e.target.value })} />
                                </div>
                                <div className="form-group half">
                                    <label>Status</label>
                                    <select className="form-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="draft">Draft</option>
                                        <option value="posted">Posted</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group" ref={dropdownRef}>
                                <label>Social Accounts</label>
                                <div className="custom-select" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                    <div className={`select-trigger ${formData.selectedAccountIds.length === 0 ? 'placeholder' : ''}`}>
                                        {formData.selectedAccountIds.length === 0 ? 'Select Accounts' : formData.selectedAccountIds.length === 1 ? (getAccountDetails(formData.selectedAccountIds[0])?.platform + ' - @' + getAccountDetails(formData.selectedAccountIds[0])?.username) : `${formData.selectedAccountIds.length} accounts selected`}
                                        <ChevronDown size={16} className={`chevron ${isDropdownOpen ? 'rotate' : ''}`} />
                                    </div>
                                    {
                                        isDropdownOpen && (
                                            <div className="select-dropdown">
                                                {accounts.map(acc => {
                                                    const isSelected = formData.selectedAccountIds.includes(acc.id);
                                                    const pStyle = getPlatformStyle(acc.platform);
                                                    return (
                                                        <div key={acc.id} className={`select-option ${isSelected ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); toggleAccountSelection(acc.id); }}>
                                                            <div className={`checkbox ${isSelected ? 'checked' : ''}`} style={isSelected ? { background: pStyle.color, borderColor: pStyle.color } : {}}>{isSelected && <Check size={10} color="white" />}</div>
                                                            <span style={{ color: pStyle.color, fontWeight: 600 }}>{acc.platform}</span>
                                                            <span className="username">@{acc.username}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )
                                    }
                                </div >
                            </div >
                            <div className="form-group">
                                <label>Caption</label>
                                <textarea className="form-input textarea" placeholder="Caption..." rows="4" value={formData.caption} onChange={e => setFormData({ ...formData, caption: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Resource Link</label>
                                <input type="url" className="form-input" placeholder="URL" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} />
                            </div>
                        </div >
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={submitting}>
                                {submitting ? <Loader size={16} className="spinner" /> : <Check size={16} />}
                                Create Plan(s)
                            </button>
                        </div>
                    </div >
                </div >
            )}

            {/* STATUS EDIT MODAL (SMALL) */}
            {
                isStatusModalOpen && editingPlan && (
                    <div className="modal-overlay-fixed">
                        <div className="modal card" style={{ maxWidth: '400px' }}>
                            <div className="modal-header">
                                <h3>Update Status</h3>
                                <button className="btn-close" onClick={() => setStatusModalOpen(false)}><X size={20} /></button>
                            </div>
                            <div className="modal-body">
                                <div style={{ marginBottom: '16px' }}>
                                    <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>{editingPlan.title}</strong>
                                    <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span>{new Date(editingPlan.postingDate).toLocaleDateString('id-ID')}</span>
                                        <span>•</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {getPlatformIcon(editingPlan.SocialAccount?.platform)}
                                            {editingPlan.SocialAccount?.username}
                                        </span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Current Status</label>
                                    <select
                                        className="form-input"
                                        value={statusData}
                                        onChange={e => setStatusData(e.target.value)}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="posted">Posted</option>
                                    </select>
                                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>
                                        Note: Status Posted hanya bisa dipilih jika tanggal adalah hari ini atau sebelumnya.
                                    </p>
                                </div>

                                {statusData === 'posted' && (
                                    <div className="form-group">
                                        <label>Link Konten *</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            placeholder="https://instagram.com/p/..."
                                            value={linkData}
                                            onChange={e => setLinkData(e.target.value)}
                                        />
                                        <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                                            Wajib diisi untuk status Posted
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setStatusModalOpen(false)}>Cancel</button>
                                <button className="btn-primary" onClick={handleSaveStatus} disabled={submitting}>
                                    {submitting ? <Loader size={16} className="spinner" /> : <Check size={16} />}
                                    Save Status
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                .calendar-page { padding: 0; height: 100%; display: flex; flex-direction: column; gap: 16px; min-height: 0; }
                .calendar-header { display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; padding: 0 4px; }
                .calendar-controls, .nav-buttons, .select-container { display: flex; align-items: center; gap: 8px; }
                
                .calendar-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: white;
                    border-radius: var(--border-radius-lg);
                    padding: 0;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    min-height: 0;
                }

                .calendar-grid-header { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: 600; color: var(--text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0; padding: 12px 0 8px 0; border-bottom: 1px solid #E5E7EB; background: white; }

                .calendar-grid { 
                    display: grid; 
                    grid-template-columns: repeat(7, 1fr); 
                    /* Rows are now handled dynamically via inline style */
                    gap: 1px; 
                    background: #E5E7EB; 
                    border: none;
                    flex: 1; 
                    min-height: 0; 
                    overflow: hidden;
                }

                .calendar-cell { 
                    background: white; 
                    padding: 4px; 
                    display: flex; 
                    flex-direction: column; 
                    position: relative; 
                    gap: 4px; 
                    height: 100%; 
                    min-height: 0;
                    transition: background-color 0.2s;
                }
                .calendar-cell:hover { background-color: #F9FAFB; } 
                .calendar-cell.empty { background: #F9FAFB; }
                .calendar-cell.today { background: #F0F9FF; }

                .day-number { font-weight: 600; color: var(--text-main); font-size: 13px; margin-bottom: 2px; }

                .day-content { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 2px; /* Reduced gap */
                    flex: 1; 
                    overflow: hidden; 
                }

                .plan-item { 
                    display: flex; 
                    align-items: center; 
                    gap: 6px; 
                    padding: 4px 6px; 
                    border-radius: 4px; 
                    font-size: 11px; 
                    font-weight: 500; 
                    white-space: nowrap; 
                    overflow: hidden; 
                    cursor: pointer; 
                    flex-shrink: 0; 
                    height: 24px; 
                }
                
                .btn-more { 
                    font-size: 10px; 
                    color: var(--color-primary); 
                    background: rgba(var(--color-primary-rgb), 0.1);
                    background: #EEF2FF;
                    border: 1px dashed #6366f1;
                    border-radius: 4px;
                    cursor: pointer; 
                    text-align: center; 
                    padding: 4px; 
                    margin-top: 2px;
                    font-weight: 600; 
                    width: 100%;
                    transition: all 0.2s;
                    flex-shrink: 0; /* Important */
                }
                .btn-more:hover { 
                    background: #E0E7FF; 
                    text-decoration: none;
                }

                .calendar-cell { border-radius: 0; }
                
                .cell-overlay { 
                    position: absolute; 
                    top: -5px; 
                    left: -5px; 
                    width: calc(100% + 10px); 
                    min-width: 200px;
                    min-height: calc(100% + 10px);
                    height: auto; 
                    max-height: 300px;
                    background: white; 
                    border: 1px solid var(--color-primary);
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15); 
                    z-index: 1000; 
                    padding: 12px; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 8px; 
                    overflow-y: auto; 
                }
                
                .plan-tooltip { visibility: hidden; opacity: 0; position: absolute; bottom: 110%; left: 0; min-width: 200px; max-width: 250px; background: #1F2937; color: white; padding: 8px 12px; border-radius: 8px; z-index: 9999; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); transition: all 0.2s ease; pointer-events: none; text-align: left; white-space: normal; transform: translateY(4px); }
                .plan-item:hover .plan-tooltip { visibility: visible; opacity: 1; transform: translateY(0); }
                .tooltip-header { font-weight: 600; font-size: 12px; margin-bottom: 4px; line-height: 1.4; color: #F3F4F6; }
                .tooltip-meta { display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #9CA3AF; margin-bottom: 6px; }
                .tooltip-badge { display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; }
                .tooltip-caption { font-size: 10px; color: #D1D5DB; line-height: 1.4; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px; }
                
                .status-pill { padding: 2px 4px; border-radius: 4px; text-transform: uppercase; font-size: 8px; font-weight: bold; }
                .status-pill.draft { background: #4B5563; color: white; }
                .status-pill.posted { background: #10B981; color: white; }

                /* MODAL STYLES */
                .modal-overlay-fixed { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal { width: 100%; max-width: 550px; padding: 0; overflow: visible; background: white; border-radius: 12px; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #F1F2F6; }
                .btn-close { background: transparent; border: none; cursor: pointer; }
                .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
                .form-row { display: flex; gap: 16px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
                .form-group label { font-weight: 500; font-size: 13px; color: var(--text-main); }
                .form-input { padding: 10px 12px; border-radius: 8px; border: 1px solid #E0E5F2; font-size: 14px; font-family: inherit; }
                .form-input:focus { outline: none; border-color: var(--color-primary); }
                .textarea { resize: vertical; min-height: 80px; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #F1F2F6; }
                .btn-secondary { background: #F5F6FA; color: var(--text-main); border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; }
                .btn-primary { background: var(--color-primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                /* CUSTOM SELECT STYLES */
                .custom-select { position: relative; user-select: none; }
                .select-trigger { padding: 10px 12px; border-radius: 8px; border: 1px solid #E0E5F2; font-size: 14px; background: white; cursor: pointer; display: flex; justify-content: space-between; align-items: center; min-height: 42px; }
                .select-trigger.placeholder { color: var(--text-secondary); }
                .select-trigger:hover { border-color: var(--color-primary); }
                .chevron { color: var(--text-secondary); transition: transform 0.2s; }
                .chevron.rotate { transform: rotate(180deg); }
                .select-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #E0E5F2; border-radius: 8px; margin-top: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); z-index: 2005; max-height: 200px; overflow-y: auto; padding: 4px; }
                .select-option { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
                .select-option:hover { background: #F5F6FA; }
                .select-option.selected { background: #F0F9FF; }
                .checkbox { width: 16px; height: 16px; border: 2px solid #D1D5DB; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .username { font-size: 12px; color: var(--text-secondary); margin-left: auto; }

                @media (max-width: 800px) {
                    .calendar-page { height: auto; min-height: 100vh; overflow: auto; }
                    .calendar-grid { grid-template-rows: repeat(6, minmax(60px, 1fr)); }
                    .cell-overlay { width: 150%; left: -25%; }
                    .plan-tooltip { display: none; }
                    .form-row { flex-direction: column; gap: 16px; }
                }
            `}</style>
        </div >
    );
};

export default Calendar;
