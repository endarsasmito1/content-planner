import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, Bell, Menu, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarCollapsed(true); // Default collapsed on mobile
            } else {
                setSidebarCollapsed(false); // Default expanded on desktop
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Init

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSidebar = () => {
        setSidebarCollapsed(!isSidebarCollapsed);
    };

    const handleLogoutClick = () => {
        setProfileDropdownOpen(false);
        setLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        logout();
        setLogoutModalOpen(false);
        navigate('/login', { state: { message: 'You have been logged out successfully.', type: 'success' } });
    };


    const todayDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="layout-container">
            {/* Mobile Overlay */}
            {isMobile && !isSidebarCollapsed && (
                <div className="sidebar-overlay" onClick={() => setSidebarCollapsed(true)}></div>
            )}

            <Sidebar
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
            />

            <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
                <header className="top-header card">
                    <div className="header-left">
                        {isMobile && (
                            <button className="btn-menu" onClick={toggleSidebar}>
                                <Menu size={24} color="#202124" />
                            </button>
                        )}

                    </div>

                    <div className="header-right">
                        <span className="header-date">{todayDate}</span>

                        <button className="btn-icon">
                            <Bell size={20} color="#202124" />
                            <span className="notif-dot"></span>
                        </button>

                        <div className="user-profile-container" ref={dropdownRef}>
                            <div
                                className="user-profile"
                                onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
                            >
                                <div className="user-info">
                                    <span className="user-name">{user?.username || 'User'}</span>
                                    <span className="user-role">{user?.Team?.name || 'No Team'}</span>
                                </div>
                                <img src={user?.avatarUrl || "https://ui-avatars.com/api/?name=" + (user?.username || 'User') + "&background=random"} alt="Profile" className="user-avatar" />
                            </div>

                            {/* Dropdown Menu */}
                            {isProfileDropdownOpen && (
                                <div className="profile-dropdown">
                                    <Link to="/settings" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                                        <Settings size={18} />
                                        Settings
                                    </Link>
                                    <button className="dropdown-item danger" onClick={handleLogoutClick}>
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Logout</h3>
                        <p>Are you sure you want to log out?</p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setLogoutModalOpen(false)}>Cancel</button>
                            <button className="btn-confirm" onClick={confirmLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .layout-container {
                    display: flex;
                    min-height: 100vh;
                    background: var(--bg-body);
                    position: relative;
                    overflow-x: hidden;
                }
                
                .main-content {
                    margin-left: 260px; /* Default Expanded Width */
                    flex: 1;
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                    transition: margin-left 0.3s ease;
                    width: 100%;
                }

                .main-content.collapsed {
                    margin-left: 80px; /* Collapsed Width */
                }
                
                .main-content.mobile {
                    margin-left: 0 !important; /* No margin on mobile */
                    padding: 16px; /* Smaller padding on mobile */
                }

                .top-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-radius: var(--border-radius-lg);
                    margin-bottom: 0;
                    margin-top: 0;
                }
                
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .btn-menu {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                }
                
                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: transparent;
                }
                
                .search-bar input {
                    border: none;
                    background: transparent;
                    font-size: 15px;
                    color: var(--text-main);
                    width: 300px;
                }
                .search-bar input::placeholder {
                    color: var(--text-secondary);
                }
                
                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                }
                
                .btn-icon {
                    background: transparent;
                    position: relative;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border: none;
                    cursor: pointer;
                }
                
                .notif-dot {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 8px;
                    height: 8px;
                    background: var(--color-secondary);
                    border-radius: 50%;
                    border: 2px solid white;
                }
                
                .user-profile-container {
                    position: relative;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 0; /* flex fix */
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 8px;
                    transition: background 0.2s;
                }

                .user-profile:hover {
                    background: #F1F2F6;
                }
                
                .user-info {
                    text-align: right;
                }
                
                .user-name {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-main);
                }
                
                .user-role {
                    display: block;
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                
                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                
                .sidebar-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0,0,0,0.5);
                    z-index: 90;
                    backdrop-filter: blur(2px);
                }

                /* Dropdown Menu Styles */
                .profile-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    width: 200px;
                    padding: 8px;
                    z-index: 1000;
                    animation: slideDown 0.2s ease-out;
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    color: var(--text-main);
                    text-decoration: none;
                    border-radius: 8px;
                    transition: all 0.2s;
                    background: transparent;
                    border: none;
                    width: 100%;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    text-align: left;
                }

                .dropdown-item:hover {
                    background: #F5F6FA;
                    color: var(--color-primary);
                }

                .dropdown-item.danger:hover {
                    background: #FEF2F2;
                    color: #EE5D50;
                }
                
                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                }
                
                .modal-content {
                    background: white;
                    padding: 24px;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 320px;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }
                
                .modal-content h3 {
                    margin-bottom: 8px;
                    color: var(--text-main);
                }
                
                .modal-content p {
                    color: var(--text-secondary);
                    margin-bottom: 24px;
                    font-size: 14px;
                }
                
                .modal-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                
                .btn-cancel, .btn-confirm {
                    padding: 10px 20px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                
                .btn-cancel {
                    background: #F5F6FA;
                    color: var(--text-secondary);
                }
                
                .btn-cancel:hover {
                    background: #E0E5F2;
                }
                
                .btn-confirm {
                    background: #EE5D50;
                    color: white;
                }
                
                .btn-confirm:hover {
                    background: #D63D30;
                    box-shadow: 0 4px 12px rgba(238, 93, 80, 0.3);
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .header-date {
                    font-weight: 500;
                    color: var(--text-secondary);
                    font-size: 14px;
                    margin-right: 8px;
                }

                /* RESPONSIVE BREAKPOINTS */
                @media (max-width: 1024px) {
                    .search-bar input {
                        width: 150px;
                    }
                }
                
                @media (max-width: 768px) {
                    .header-date {
                        display: none;
                    }

                    .top-header {
                        padding: 12px 16px;
                    }
                    
                    .search-bar {
                        display: none; /* Hide search on mobile to save space, or make it an icon */
                    }
                    
                    .user-info {
                        display: none; /* Hide name/role on mobile */
                    }
                    
                    .header-right {
                        gap: 16px;
                    }
                }
            `}</style>
        </div>
    );
};

export default DashboardLayout;
