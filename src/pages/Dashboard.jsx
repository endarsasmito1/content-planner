import React from 'react';
import StatCard from '../components/StatCard';
import PlatformChart from '../components/PlatformChart';
import ViralContentTable from '../components/ViralContentTable';
import { FileText, Clock, CheckCircle, BarChart, Activity } from 'lucide-react';

const Dashboard = () => {
    // Mock Data
    const chartsData = [
        { name: 'Jan', views: 400000, active: false },
        { name: 'Feb', views: 300000, active: false },
        { name: 'Mar', views: 200000, active: false },
        { name: 'Apr', views: 278000, active: false },
        { name: 'May', views: 189000, active: false },
        { name: 'Jun', views: 239000, active: false },
    ];

    const viralData = [
        { title: 'HACKER: CEPAT TF SAYA 100JT ATAU SAYA SEBAR', account: 'Akun A', link: '#', platform: 'Youtube', views: 119129 },
        { title: 'Kenapa Customer Triguna selalu puas dengan pelayanan', account: 'Akun A', link: '#', platform: 'Facebook', views: 117940 },
        { title: 'LU TAU TRIGUNA GA?!', account: 'Akun A', link: '#', platform: 'Threads', views: 112015 },
        { title: 'BUAT SPAREPART', account: 'Akun A', link: '#', platform: 'Facebook', views: 110763 },
    ];

    return (
        <div className="dashboard-container">
            <h2 className="page-title">Dashboard Overview</h2>

            {/* Stats Row - Restored content but new StatCard visually */}
            <div className="stats-grid">
                <StatCard
                    title="Konten Belum Berjalan"
                    views="2 Pending"
                    trend={0}
                    icon={<Clock size={24} color="white" />}
                    color="warning"
                />
                <StatCard
                    title="Konten Sedang Berjalan"
                    views="4 Progress"
                    trend={4}
                    icon={<Activity size={24} color="white" />}
                    color="primary"
                />
                <StatCard
                    title="Konten Selesai"
                    views="1 Done"
                    trend={100}
                    icon={<CheckCircle size={24} color="white" />}
                    color="success"
                />
                <StatCard
                    title="Total Views"
                    views="1.2M"
                    trend={12}
                    icon={<BarChart size={24} color="white" />}
                    color="primary"
                />
            </div>

            {/* Charts Row - Restored Layout */}
            <h3 className="section-title">Platform Performance</h3>
            <div className="charts-grid">
                <PlatformChart platformName="Instagram" data={chartsData} barColor="#FEBC3B" />
                <PlatformChart platformName="Facebook" data={chartsData} barColor="#4C35DE" />
                <PlatformChart platformName="TikTok" data={chartsData} barColor="#05CD99" />
                <PlatformChart platformName="Youtube" data={chartsData} barColor="#EE5D50" />
            </div>

            {/* Bottom Row - Restored Layout */}
            <div className="bottom-grid">
                <div className="viral-content-col">
                    <ViralContentTable data={viralData} />
                </div>
            </div>

            <style>{`
                .dashboard-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .page-title {
                    font-size: 24px;
                    margin-bottom: 8px;
                }
                .section-title {
                    font-size: 18px;
                    color: var(--text-secondary);
                    margin-top: 12px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                }
                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }
                .bottom-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 24px;
                }
                
                @media (max-width: 1200px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
