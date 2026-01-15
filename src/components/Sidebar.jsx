import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, ChevronLeft, ChevronRight, ChevronDown, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleSidebar, isMobile }) => {
    const { isSuperadmin } = useAuth();
    const location = useLocation();
    const [openSubmenu, setOpenSubmenu] = useState('Content Plan'); // Default open for visibility

    const toggleSubmenu = (label) => {
        if (openSubmenu === label) setOpenSubmenu(null);
        else setOpenSubmenu(label);
    };

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
        { icon: <Calendar size={20} />, label: 'Calendar', path: '/calendar' },
        {
            icon: <FileText size={20} />,
            label: 'Content Plan',
            submenu: [
                { label: 'Progress', path: '/kanban' },
                { label: 'Plan', path: '/planner' },
                { label: 'Input Akun', path: '/input-akun' },
                { label: 'Content Report', path: '/content-report' },
            ]
        },
        ...(isSuperadmin() ? [{
            icon: <Users size={20} />,
            label: 'User Management',
            submenu: [
                { label: 'Users', path: '/users' },
                { label: 'Teams', path: '/teams' }
            ]
        }] : [])
    ];

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
            <div className="logo-area">
                <div className="logo-icon">
                    <div className="logo-dot-1"></div>
                    <div className="logo-dot-2"></div>
                </div>
                {!isCollapsed && <h2 className="logo-text">ContentPln</h2>}
            </div>

            <nav className="nav-menu">
                {menuItems.map((item) => {
                    if (item.submenu) {
                        const isOpen = openSubmenu === item.label;
                        const isActive = item.submenu.some(sub => sub.path === location.pathname);

                        return (
                            <div key={item.label} className="nav-group">
                                <div
                                    className={`nav-item has-submenu ${isActive ? 'active-parent' : ''}`}
                                    onClick={() => toggleSubmenu(item.label)}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <div className="nav-icon-wrapper">{item.icon}</div>
                                    {!isCollapsed && (
                                        <>
                                            <span className="nav-label">{item.label}</span>
                                            <ChevronDown size={16} className={`submenu-arrow ${isOpen ? 'open' : ''}`} />
                                        </>
                                    )}
                                </div>

                                <div className={`submenu-container ${isOpen && !isCollapsed ? 'open' : ''}`}>
                                    {item.submenu.map((subItem) => (
                                        <NavLink
                                            key={subItem.path}
                                            to={subItem.path}
                                            className={({ isActive }) => `nav-item sub-item ${isActive ? 'active' : ''}`}
                                        >
                                            <div className="sub-dot"></div>
                                            <span className="nav-label">{subItem.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <div className="nav-icon-wrapper">{item.icon}</div>
                            {!isCollapsed && <span className="nav-label">{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {!isMobile && (
                <button className="collapse-toggle" onClick={toggleSidebar}>
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            )}

            <style>{`
        .sidebar {
          width: 260px;
          background: var(--bg-sidebar);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          padding: 32px 16px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid transparent;
          transition: all 0.3s ease;
          z-index: 100;
        }
        
        /* ... existing Mobile/Collapsed Styles ... */
        .sidebar.collapsed {
            width: 80px;
            padding: 32px 12px;
            align-items: center;
        }

        .sidebar.mobile {
            transform: translateX(0);
            width: 260px;
            z-index: 999;
            padding: 32px 16px; 
            align-items: flex-start;
        }
        
        .sidebar.mobile.collapsed {
            transform: translateX(-100%);
            width: 260px;
        }

        /* Nav Group & Submenu Styles */
        .nav-group {
            width: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .nav-item.has-submenu {
            cursor: pointer;
            justify-content: space-between;
        }
        
        .submenu-arrow {
            transition: transform 0.3s ease;
            color: var(--text-secondary);
        }
        
        .submenu-arrow.open {
            transform: rotate(180deg);
        }
        
        .submenu-container {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
            padding-left: 20px;
        }
        
        .submenu-container.open {
            max-height: 500px; /* Arbitrary large height */
        }
        
        .nav-item.sub-item {
            padding: 10px 12px;
            font-size: 13px;
            margin-top: 4px;
        }
        
        .sub-dot {
            width: 6px;
            height: 6px;
            background: var(--text-secondary);
            border-radius: 50%;
            margin-right: 12px;
            opacity: 0.5;
        }
        
        .nav-item.sub-item.active .sub-dot {
            background: white;
            opacity: 1;
        }

        /* ... Resetting existing styles just in case ... */
        
        .logo-area {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 40px;
            padding-left: 12px;
            height: 40px;
            overflow: hidden;
            white-space: nowrap;
        }
        
        /* Mobile fixes */
        .sidebar.mobile .logo-area { padding-left: 12px; justify-content: flex-start; }
        .sidebar.mobile .nav-item { justify-content: flex-start; padding: 12px 16px; }
        .sidebar.mobile .nav-icon-wrapper { margin-right: 12px; }
        
        .sidebar.collapsed .logo-area {
            padding-left: 0;
            justify-content: center;
        }

        .logo-icon {
            position: relative;
            width: 32px;
            height: 32px;
            flex-shrink: 0;
        }
        .logo-dot-1 {
            position: absolute;
            width: 16px;
            height: 32px;
            background: var(--color-primary);
            border-radius: 16px 0 16px 16px;
            transform: rotate(-15deg);
            left: 0;
        }
        .logo-dot-2 {
            position: absolute;
            width: 16px;
            height: 32px;
            background: #5D95F9;
            border-radius: 0 16px 16px 16px;
            transform: rotate(-15deg);
            left: 14px;
            top: 4px;
        }
        .logo-text {
            font-size: 20px;
            font-weight: 800;
            color: var(--text-main);
            letter-spacing: -0.5px;
        }

        .nav-menu {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          color: var(--text-secondary);
          border-radius: var(--border-radius-md);
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
        }

        .sidebar.collapsed .nav-item {
            padding: 12px;
            justify-content: center;
        }

        .nav-item:hover, .nav-item.active-parent {
          color: var(--color-primary);
          background: var(--color-primary-bg);
        }
        
        .nav-item.active {
          background: var(--color-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(76, 53, 222, 0.3);
        }

        .nav-icon-wrapper {
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 24px;
        }

        .sidebar.collapsed .nav-icon-wrapper {
            margin-right: 0;
        }

        .nav-label {
            flex: 1;
            font-size: 14px;
            text-align: left;
        }

        .collapse-toggle {
            position: absolute;
            top: 40px; 
            right: -12px;
            width: 24px;
            height: 24px;
            background: white;
            border: 1px solid #E0E0E0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.2s;
            z-index: 1000;
        }
        .collapse-toggle:hover {
            background: var(--color-primary);
            color: white;
            border-color: var(--color-primary);
            transform: scale(1.1);
        }
      `}</style>
        </div>
    );
};

export default Sidebar;
