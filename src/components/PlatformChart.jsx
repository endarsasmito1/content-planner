import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PlatformChart = ({ platformName, data, barColor }) => {
    return (
        <div className="card chart-card">
            <div className="chart-header">
                <h3>{platformName}</h3>
            </div>
            <div className="chart-body">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#A3AED0' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#A3AED0' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="views" radius={[4, 4, 0, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.active ? '#FFB547' : barColor} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-legend">
                <div className="legend-item">
                    <span className="dot" style={{ background: barColor }}></span> View
                </div>
                <div className="legend-item">
                    <span className="dot" style={{ background: '#FFB547' }}></span> Interaksi
                </div>
            </div>

            <style>{`
        .chart-card {
            display: flex;
            flex-direction: column;
        }
        .chart-header {
            margin-bottom: 20px;
        }
        .chart-header h3 {
            font-size: 18px;
            color: var(--text-main);
        }
        .chart-legend {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin-top: 10px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--text-secondary);
        }
        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
      `}</style>
        </div>
    );
};

export default PlatformChart;
