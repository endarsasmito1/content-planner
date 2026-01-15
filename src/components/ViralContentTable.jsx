import React from 'react';
import { ExternalLink } from 'lucide-react';

const ViralContentTable = ({ data }) => {
    return (
        <div className="card table-card">
            <div className="table-header">
                <h3>Top 20 Konten Viral</h3>
            </div>
            <div className="table-responsive">
                <table className="viral-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Judul</th>
                            <th>Akun</th>
                            <th>Link</th>
                            <th>Sosmed</th>
                            <th>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td className="cell-title">{item.title}</td>
                                <td>{item.account}</td>
                                <td>
                                    <a href={item.link} className="link-icon">
                                        Link <ExternalLink size={12} />
                                    </a>
                                </td>
                                <td>{item.platform}</td>
                                <td className="cell-views">{item.views.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
        .table-card {
            height: 100%;
        }
        .table-header {
            margin-bottom: 20px;
        }
        .table-responsive {
            overflow-x: auto;
        }
        .viral-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        .viral-table th {
            text-align: left;
            padding: 12px;
            color: var(--text-secondary);
            font-weight: 500;
            border-bottom: 1px solid var(--border-light);
            white-space: nowrap;
        }
        .viral-table td {
            padding: 16px 12px;
            color: var(--text-main);
            border-bottom: 1px solid var(--border-light);
            white-space: nowrap;
        }
        .cell-title {
            font-weight: 600;
            max-width: 300px;
        }
        .link-icon {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            color: var(--color-primary);
            font-weight: 500;
        }
        .cell-views {
            font-weight: 700;
        }
      `}</style>
        </div>
    );
};

export default ViralContentTable;
