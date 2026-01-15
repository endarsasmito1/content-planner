import React from 'react';

const Kanban = () => {
    const columns = [
        { id: 'todo', title: 'List Konten', count: 4, color: '#A3AED0' },
        { id: 'inprogress', title: 'Dalam Pekerjaan', count: 4, color: '#FFB547' },
        { id: 'pending', title: 'Tertunda', count: 2, color: '#EE5D50' },
        { id: 'done', title: 'Selesai', count: 4, color: '#05CD99' },
    ];

    const tasks = [
        { id: 1, title: 'Kenapa Customer Triguna selalu puas', assignee: 'Akun A', date: '16 Januari 2026', status: 'todo' },
        { id: 2, title: 'LU TAU TRIGUNA GA?!', assignee: 'Akun A', date: '20 Januari 2026', status: 'todo' },
        { id: 3, title: 'MITSUBISHI FG35PD', assignee: 'Akun A', date: '26 Januari 2026', status: 'inprogress' },
        { id: 4, title: 'GUA TIM DIESEL/GUA TIM ELEKTRIK', assignee: 'Akun A', date: '19 Januari 2026', status: 'inprogress' },
        { id: 5, title: 'BUAT SPAREPART BUAT SPAREPART', assignee: 'Akun A', date: '17 Januari 2026', status: 'done' },
    ];

    return (
        <div className="kanban-page">
            <div className="kanban-header">
                <h2>Progres Pekerjaan</h2>
                <div className="actions">
                    <button className="btn-primary-sm">Ambil Konten</button>
                </div>
            </div>

            <div className="kanban-board">
                {columns.map(col => (
                    <div key={col.id} className="kanban-column">
                        <div className="column-header">
                            <span className="col-icon" style={{ borderColor: col.color }} />
                            <span className="col-title">{col.title}</span>
                        </div>
                        <div className="column-body">
                            {tasks.filter(t => t.status === col.id).map(task => (
                                <div key={task.id} className="kanban-card card">
                                    <h4 className="card-title">{task.title}</h4>
                                    <div className="card-meta">
                                        <span>👤 {task.assignee}</span>
                                    </div>
                                    <div className="card-footer">
                                        <span className={`date-badge ${col.id === 'done' ? 'done' : ''}`}>
                                            📅 {task.date}
                                        </span>
                                        {col.id === 'inprogress' && <span className="status-text">Progres: Dalam Pekerjaan</span>}
                                        {col.id === 'done' && <span className="status-text success">Progres: Selesai</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
            .kanban-page {
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            .kanban-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
            }
            .btn-primary-sm {
                background: var(--color-primary);
                color: white;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
            }
            .kanban-board {
                display: flex;
                gap: 24px;
                overflow-x: auto;
                padding-bottom: 20px;
                flex: 1;
            }
            .kanban-column {
                min-width: 300px;
                flex: 1;
                background: #F4F7FE; /* Slightly darker than card for contrast if needed, or matches body */
                border-radius: 16px;
                display: flex;
                flex-direction: column;
            }
            .column-header {
                background: white;
                padding: 16px;
                border-radius: 16px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 600;
                color: var(--text-main);
            }
            .col-icon {
                width: 16px;
                height: 16px;
                border: 3px solid;
                border-radius: 50%;
            }
            .column-body {
                display: flex;
                flex-direction: column;
                gap: 16px;
                flex: 1;
            }
            .kanban-card {
                padding: 16px;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .kanban-card:hover {
                transform: translateY(-4px);
            }
            .card-title {
                font-size: 14px;
                margin-bottom: 12px;
                line-height: 1.5;
            }
            .card-meta {
                font-size: 12px;
                color: var(--text-secondary);
                margin-bottom: 12px;
            }
            .card-footer {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .date-badge {
                display: inline-block;
                background: #FFB547;
                color: white;
                font-size: 10px;
                padding: 4px 8px;
                border-radius: 4px;
                width: fit-content;
                font-weight: 600;
            }
            .date-badge.done {
                background: #F4F7FE; /* Or distinct color */
                color: var(--text-secondary); 
                border: 1px solid var(--border-light);
            }
            .status-text {
                font-size: 12px;
                color: var(--text-secondary);
            }
            .status-text.success {
                color: var(--color-success);
            }
        `}</style>
        </div>
    );
};

export default Kanban;
