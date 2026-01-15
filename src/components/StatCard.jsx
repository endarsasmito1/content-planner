import React from 'react';

const StatCard = ({ title, views, trend, icon, color = 'primary' }) => {
    return (
        <div className="card stat-card">
            <div className={`icon-wrapper bg-${color}-light`}>
                {icon}
            </div>
            <div className="stat-content">
                <h4 className="stat-title">{title}</h4>
                <p className="stat-views">{views}</p>
            </div>
            <div className={`trend-badge ${trend > 0 ? 'positive' : 'negative'}`}>
                {trend > 0 ? '+' : ''}{trend}%
            </div>

            <style>{`
        .stat-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            position: relative;
        }
        
        .icon-wrapper {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
        }
        
        /* Kreatop style uses very bold saturated colors for icons */
        .bg-primary-light { background: var(--color-primary); }
        .bg-success-light { background: #05CD99; }
        .bg-warning-light { background: #FFB547; }
        .bg-danger-light { background: #EE5D50; }

        .stat-content {
            flex: 1;
        }

        .stat-title {
            font-size: 14px;
            color: var(--text-main);
            font-weight: 700;
            margin-bottom: 4px;
        }

        .stat-views {
            font-size: 12px;
            color: var(--text-secondary);
        }

        .trend-badge {
            background: #E5F9F1;
            color: #05CD99;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 20px;
        }
        
        /* Negative trend could be red, but reference mostly shows green chips */
      `}</style>
        </div>
    );
};

export default StatCard;
