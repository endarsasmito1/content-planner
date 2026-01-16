import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { plansAPI, accountsAPI } from '../services/api';
import { Calendar, AlertCircle, CheckCircle, ExternalLink, Link as LinkIcon, Loader, X, Plus, ChevronDown, Check, Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import TikTokIcon from '../components/TikTokIcon';

const Kanban = () => {
    const [plans, setPlans] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state for Add/Edit Task
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        postingDate: '',
        script: '',
        caption: '',
        resourceLink: '',
        link: '', // Published Link
        selectedAccountIds: []
    });

    // Modal state for moving to Done
    const [isLinkModalOpen, setLinkModalOpen] = useState(false);
    const [pendingMove, setPendingMove] = useState(null); // { draggableId, source, destination }
    const [linkInput, setLinkInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Helpers for Dropdown
    const toggleAccountSelection = (id) => {
        const currentSelected = formData.selectedAccountIds || [];
        if (currentSelected.includes(id)) {
            setFormData({ ...formData, selectedAccountIds: currentSelected.filter(accId => accId !== id) });
        } else {
            setFormData({ ...formData, selectedAccountIds: [...currentSelected, id] });
        }
    };

    const getPlatformIcon = (platformName, color = 'currentColor') => {
        const name = platformName?.toLowerCase() || '';
        if (name.includes('instagram')) return <Instagram size={14} color={color} />;
        if (name.includes('facebook')) return <Facebook size={14} color={color} />;
        if (name.includes('youtube')) return <Youtube size={14} color={color} />;
        if (name.includes('twitter')) return <Twitter size={14} color={color} />;
        if (name.includes('tiktok')) return <TikTokIcon size={14} color={color} />;
        return <span style={{ fontSize: 10, fontWeight: 800, color: color }}>{platformName?.[0]}</span>;
    };

    const getPlatformStyle = (platform) => {
        const p = platform?.toLowerCase() || '';
        if (p.includes('instagram')) return { color: '#E1306C', bg: '#FDEDF3', border: '#FFD1DC' };
        if (p.includes('facebook')) return { color: '#1877F2', bg: '#E7F1FF', border: '#C8DFFF' };
        if (p.includes('youtube')) return { color: '#FF0000', bg: '#FFEEEE', border: '#FFCACA' };
        if (p.includes('tiktok')) return { color: '#000000', bg: '#F2F2F2', border: '#D9D9D9' };
        return { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' };
    };

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Columns config
    const columns = {
        draft: { id: 'draft', title: 'List Konten', color: '#A3AED0' },
        scripting: { id: 'scripting', title: 'Scripting', color: '#6366F1' },
        shooting: { id: 'shooting', title: 'Shooting', color: '#F59E0B' },
        editing: { id: 'editing', title: 'Editing', color: '#3B82F6' },
        ready: { id: 'ready', title: 'Ready to Post', color: '#8B5CF6' },
        posted: { id: 'posted', title: 'Posted', color: '#05CD99' }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const [plansData, accountsData] = await Promise.all([
                plansAPI.getAll(),
                accountsAPI.getAll()
            ]);
            // Default sort by posting date descending (newest first) as requested
            const sortedData = plansData.sort((a, b) => new Date(b.postingDate) - new Date(a.postingDate));
            setPlans(sortedData);
            setAccounts(accountsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingPlan(null);
        setFormData({
            title: '',
            postingDate: new Date().toISOString().split('T')[0],
            script: '',
            caption: '',
            resourceLink: '',
            link: '',
            selectedAccountIds: []
        });
        setIsModalOpen(true);
    };

    const openEditModal = (plan) => {
        setEditingPlan(plan);
        setFormData({
            title: plan.title,
            postingDate: plan.postingDate ? new Date(plan.postingDate).toISOString().split('T')[0] : '',
            script: plan.script || '',
            caption: plan.caption || '',
            resourceLink: plan.resourceLink || '',
            link: plan.link || '',
            selectedAccountIds: plan.SocialAccountId ? [plan.SocialAccountId] : []
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title || formData.selectedAccountIds.length === 0) {
            alert('Title and at least one Account are required!');
            return;
        }

        try {
            setSubmitting(true);
            if (editingPlan) {
                // Update primary
                const primaryId = formData.selectedAccountIds[0];
                await plansAPI.update(editingPlan.id, { ...formData, socialAccountId: primaryId });

                // If more selected, create new ones
                if (formData.selectedAccountIds.length > 1) {
                    const otherIds = formData.selectedAccountIds.slice(1);
                    const promises = otherIds.map(accId =>
                        plansAPI.create({ ...formData, socialAccountId: accId, status: editingPlan.status })
                    );
                    await Promise.all(promises);
                }
            } else {
                // Create New (Loop through accounts)
                const promises = formData.selectedAccountIds.map(accId =>
                    plansAPI.create({ ...formData, socialAccountId: accId, status: 'draft' })
                );
                await Promise.all(promises);
            }
            await fetchPlans();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save plan:", error);
            alert("Failed to save plan");
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to check overdue
    const isOverdue = (dateStr) => {
        const planDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return planDate < today;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        // Dropped outside or same position
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        // Handle Status Change
        if (source.droppableId !== destination.droppableId) {
            const planId = parseInt(draggableId);
            const targetStatus = destination.droppableId;

            // If moving to 'posted', require Link
            if (targetStatus === 'posted') {
                const plan = plans.find(p => p.id === planId);
                // Pre-fill link if exists
                setLinkInput(plan.link || '');
                setPendingMove({ draggableId, source, destination, planId });
                setLinkModalOpen(true);
                return;
            }

            // Moving back to draft or other status
            updatePlanStatus(planId, targetStatus);
        }
    };

    const updatePlanStatus = async (id, status, link = null) => {
        try {
            // Optimistic update
            const updatedPlans = plans.map(p => {
                if (p.id === id) {
                    return { ...p, status, link: link || p.link };
                }
                return p;
            });
            setPlans(updatedPlans);

            await plansAPI.update(id, { status, link });
        } catch (error) {
            console.error('Failed to update status:', error);
            fetchPlans(); // Revert on error
        }
    };

    const handleConfirmMoveToDone = async () => {
        if (!linkInput) {
            alert('Wajib menyertakan link konten untuk status Posted.');
            return;
        }

        try {
            setSubmitting(true);
            const { planId } = pendingMove;
            await updatePlanStatus(planId, 'posted', linkInput);
            setLinkModalOpen(false);
            setPendingMove(null);
            setLinkInput('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelMove = () => {
        setLinkModalOpen(false);
        setPendingMove(null);
        setLinkInput('');
    };

    // Group plans by status
    const getColumnPlans = (status) => {
        return plans.filter(p => p.status === status || (status === 'draft' && !p.status));
    };

    if (loading) return <div className="loading-state"><Loader className="spinner" size={32} /><p>Loading Job Board...</p></div>;

    return (
        <div className="kanban-page">
            <div className="kanban-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Progres Pekerjaan</h2>
                    <p className="subtitle">Pantau status pengerjaan konten</p>
                </div>
                <button className="btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                    <Plus size={18} />
                    Add Task
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-board">
                    {Object.values(columns).map(col => (
                        <Droppable key={col.id} droppableId={col.id}>
                            {(provided) => (
                                <div
                                    className="kanban-column"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <div className="column-header">
                                        <span className="col-icon" style={{ borderColor: col.color }} />
                                        <span className="col-title">{col.title}</span>
                                        <span className="col-count">{getColumnPlans(col.id).length}</span>
                                    </div>
                                    <div className="column-body">
                                        {getColumnPlans(col.id).map((plan, index) => {
                                            const overdue = isOverdue(plan.postingDate) && col.id !== 'posted';
                                            const isPosted = col.id === 'posted';

                                            return (
                                                <Draggable key={plan.id} draggableId={plan.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            className={`kanban-card-wrapper ${snapshot.isDragging ? 'is-dragging' : ''}`}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{ ...provided.draggableProps.style }}
                                                        >
                                                            <div
                                                                className={`kanban-card-visual ${overdue ? 'overdue-card' : ''}`}
                                                                onClick={() => openEditModal(plan)}
                                                            >
                                                                <div className="card-top">
                                                                    <h4 className={`card-title ${isPosted ? 'strikethrough' : ''}`}>{plan.title}</h4>
                                                                    {isPosted && <CheckCircle size={16} className="text-success" />}
                                                                </div>
                                                                <div className="card-meta">
                                                                    <div className="card-meta">
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F3F4F6', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', width: 'fit-content', maxWidth: '100%' }}>
                                                                            {plan.SocialAccount ? (
                                                                                (() => {
                                                                                    const pStyle = getPlatformStyle(plan.SocialAccount.platform);
                                                                                    return (
                                                                                        <>
                                                                                            {getPlatformIcon(plan.SocialAccount.platform, pStyle.color)}
                                                                                            <span style={{ fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px', display: 'block' }}>@{plan.SocialAccount.username}</span>
                                                                                        </>
                                                                                    );
                                                                                })()
                                                                            ) : (
                                                                                <>
                                                                                    <AlertCircle size={12} />
                                                                                    <span>No Account</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="card-footer">
                                                                    <div className={`date-badge ${isPosted ? 'done' : ''}`}>
                                                                        <Calendar size={12} />
                                                                        {formatDate(plan.postingDate)}
                                                                    </div>
                                                                    {isPosted && plan.link && (
                                                                        <a href={plan.link} target="_blank" rel="noopener noreferrer" className="link-icon">
                                                                            <ExternalLink size={14} />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal card" style={{ width: '600px', maxWidth: '90%' }}>
                        <div className="modal-header">
                            <h3>{editingPlan ? 'Edit Task' : 'Add New Task'}</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Task Title" />
                            </div>
                            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Posting Date</label>
                                    <input type="date" className="form-input" value={formData.postingDate} onChange={e => setFormData({ ...formData, postingDate: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }} ref={dropdownRef}>
                                    <label>Social Accounts</label>
                                    <div className="custom-select" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                        <div className={`select-trigger ${formData.selectedAccountIds.length === 0 ? 'placeholder' : ''}`}>
                                            {formData.selectedAccountIds.length === 0 ? 'Select Accounts' :
                                                formData.selectedAccountIds.length === 1 ?
                                                    (() => {
                                                        const acc = accounts.find(a => a.id == formData.selectedAccountIds[0]);
                                                        return acc ? `${acc.platform} - @${acc.username}` : 'Select Accounts';
                                                    })()
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
                                                            <span style={{ color: pStyle.color, fontWeight: 600, fontSize: '13px' }}>
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
                            </div>
                            <div className="form-group">
                                <label>Script</label>
                                <textarea className="form-input" rows="4" value={formData.script} onChange={e => setFormData({ ...formData, script: e.target.value })} placeholder="Write your script here..." style={{ resize: 'vertical' }} />
                            </div>
                            <div className="form-group">
                                <label>Caption</label>
                                <textarea className="form-input" rows="3" value={formData.caption} onChange={e => setFormData({ ...formData, caption: e.target.value })} placeholder="Write caption..." style={{ resize: 'vertical' }} />
                            </div>
                            <div className="form-group">
                                <label>Resource Link (Assets)</label>
                                <input type="url" className="form-input" value={formData.resourceLink} onChange={e => setFormData({ ...formData, resourceLink: e.target.value })} placeholder="Google Drive / Dropbox link" />
                            </div>
                            <div className="form-group">
                                <label>Published Link (if posted)</label>
                                <input type="url" className="form-input" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="Instagram/TikTok URL" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
                                {submitting ? <Loader size={16} className="spinner" /> : <CheckCircle size={16} />}
                                Save Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Link Input Modal */}
            {isLinkModalOpen && (
                <div className="modal-overlay">
                    <div className="modal card">
                        <div className="modal-header">
                            <h3>Masukkan Link Konten</h3>
                            <button className="btn-close" onClick={handleCancelMove}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-desc">Untuk memindahkan ke Selesai, harap masukkan link konten yang sudah diposting.</p>
                            <div className="form-group">
                                <label>Link Postingan</label>
                                <div className="input-with-icon">
                                    <LinkIcon size={16} className="input-icon" />
                                    <input
                                        type="url"
                                        className="form-input pl-10"
                                        placeholder="https://instagram.com/p/..."
                                        value={linkInput}
                                        onChange={(e) => setLinkInput(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={handleCancelMove}>Batal</button>
                            <button className="btn-primary" onClick={handleConfirmMoveToDone} disabled={submitting}>
                                {submitting ? <Loader size={16} className="spinner" /> : <CheckCircle size={16} />}
                                Selesai & Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
            .kanban-page {
                min-height: 100%;
                display: flex;
                flex-direction: column;
                gap: 20px;
                overflow: visible;
            }
            .subtitle { color: var(--text-secondary); font-size: 14px; }
            
            .kanban-board {
                display: flex;
                gap: 16px;
                padding-bottom: 20px;
                align-items: flex-start; /* Allow columns to have natural height */
                width: 100%; /* Ensure it takes full width */
                min-height: 0;
            }
            .kanban-column {
                flex: 1; /* Distribute space evenly */
                min-width: 0; /* Allow shrinking to fit */
                background: #F4F7FE;
                border: 1px solid #E2E8F0;
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                height: auto; /* Allow growing */
                max-height: none;
            }
            .column-header {
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 600;
                color: var(--text-main);
                border-bottom: 1px solid rgba(0,0,0,0.05);
            }
            .col-icon {
                width: 12px;
                height: 12px;
                border: 3px solid;
                border-radius: 50%;
            }
            .col-count {
                margin-left: auto;
                background: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                color: var(--text-secondary);
                font-weight: 700;
            }
            /* Updated to use margin instead of gap for dnd compatibility */
            .column-body {
                padding: 16px;
                display: flex;
                flex-direction: column;
                overflow: visible; /* No internal scroll */
                min-height: 100px;
                height: auto;
            }
            
            /* WRAPPER: Handles positioning and margin */
            .kanban-card-wrapper {
                margin-bottom: 12px;
                user-select: none;
            }

            /* VISUAL: Handles styling and tilt animation */
            .kanban-card-visual {
                padding: 16px;
                background: white;
                border: 1px solid #E2E8F0;
                border-radius: 12px;
                cursor: grab;
                transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s;
                position: relative; 
            }
            
            .kanban-card-visual:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                border-color: #CBD5E1;
            }
            
            /* Trello-like Tilt & Lift */
            .kanban-card-wrapper.is-dragging .kanban-card-visual {
                transform: rotate(3deg) scale(1.02);
                box-shadow: 0 16px 32px rgba(0,0,0,0.15);
                border-color: var(--color-primary);
                z-index: 100;
                cursor: grabbing;
            }

            /* Overdue State */
            .kanban-card-visual.overdue-card {
                background: #FEF2F2;
                border-color: #FECACA;
            }
            .kanban-card-visual.overdue-card:hover {
                border-color: #F87171;
            }
            .kanban-card-visual.overdue-card .card-title {
                color: #B91C1C;
            }

            .card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px;}
            .card-title {
                font-size: 14px;
                line-height: 1.4;
                color: var(--text-main);
                margin-bottom: 12px;
            }
            .strikethrough { text-decoration: line-through; color: var(--text-secondary); margin-bottom: 0; }
            .card-meta {
                font-size: 12px;
                color: var(--text-secondary);
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 12px;
            }
            .card-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: auto;
            }
            
            .date-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: #F4F7FE;
                color: var(--text-secondary);
                font-size: 11px;
                padding: 4px 8px;
                border-radius: 6px;
                font-weight: 500;
                white-space: nowrap;
            }
            .kanban-card-visual.overdue-card .date-badge {
                background: white;
                color: #DC2626;
                border: 1px solid #FECACA;
            }
            
            .date-badge.done { background: #DEF7EC; color: #03543F; }
            
            .link-icon {
                color: #1877F2;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.2s;
            }
            .link-icon:hover { background: #E7F1FF; }
            .text-success { color: #05CD99; }

            /* Form Styles */
            .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; width: 100%; }
            .form-group label { font-weight: 500; font-size: 13px; color: var(--text-main); }
            .form-input { padding: 10px 12px; border-radius: 8px; border: 1px solid #E0E5F2; font-size: 14px; font-family: inherit; width: 100%; transition: border-color 0.2s; box-sizing: border-box; }
            .form-input:focus { outline: none; border-color: var(--color-primary); }
            .form-row { display: flex; gap: 16px; width: 100%; }
            .textarea { resize: vertical; min-height: 80px; }

            /* Modal Styles */
            .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
            .modal { width: 100%; max-width: 420px; padding: 0; animation: popIn 0.2s; display: flex; flex-direction: column; max-height: 90vh; }
            .modal-header { padding: 16px 20px; border-bottom: 1px solid #F1F2F6; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
            .modal-body { padding: 20px; overflow-y: auto; flex: 1; }
            .modal-desc { margin-bottom: 16px; color: var(--text-secondary); font-size: 14px; }
            .modal-footer { padding: 16px 20px; background: #F9FAFB; border-top: 1px solid #F1F2F6; display: flex; justify-content: flex-end; gap: 10px; border-radius: 0 0 16px 16px; flex-shrink: 0; }
            .input-with-icon { position: relative; }
            .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
            .pl-10 { padding-left: 36px; }

            /* Custom Select CSS */
            .custom-select { position: relative; user-select: none; }
            .select-trigger { padding: 10px 12px; border-radius: 8px; border: 1px solid #E0E5F2; font-size: 14px; background: white; cursor: pointer; display: flex; justify-content: space-between; align-items: center; min-height: 42px; width: 100%; box-sizing: border-box; }
            .select-trigger.placeholder { color: var(--text-secondary); }
            .chevron { color: var(--text-secondary); transition: transform 0.2s; }
            .chevron.rotate { transform: rotate(180deg); }
            .select-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #E0E5F2; border-radius: 8px; margin-top: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); z-index: 1005; max-height: 200px; overflow-y: auto; padding: 4px; }
            .select-option { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
            .select-option:hover { background: #F5F6FA; }
            .select-option.selected { background: #F0F9FF; }
            .checkbox { width: 16px; height: 16px; border: 2px solid #D1D5DB; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
            .username { font-size: 12px; color: var(--text-secondary); margin-left: auto; }
            
            .loading-state { text-align: center; padding: 40px; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 16px; margin-top: 40px;}
            .spinner { animation: spin 1s linear infinite; }
            
            @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Kanban;
