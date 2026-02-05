import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Settings, Globe, Bell } from 'lucide-react';
import '../index.css';

const DashboardLayout = () => {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-content">
                <header className="topbar">
                    {/* Spacer to push content right */}
                    <div style={{ flex: 1 }}></div>

                    <div className="topbar-actions">
                        <button className="icon-btn">
                            <Globe size={20} />
                        </button>
                        <button className="icon-btn relative">
                            <Bell size={20} />
                            <span className="badge">3</span>
                        </button>

                        <div className="user-profile">
                            <div className="avatar">
                                <img src="https://ui-avatars.com/api/?name=Andrew+Smith&background=0D8ABC&color=fff" alt="User" />
                            </div>
                            <div className="user-info">
                                <span className="name">Andrew Smith</span>
                                <span className="role">Admin</span>
                            </div>
                        </div>

                        <button className="settings-btn">
                            <Settings size={20} color="white" />
                        </button>
                    </div>
                </header>

                <main className="content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

const styles = `
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f1f5f9;
}

.main-content {
  margin-left: 250px; /* Match sidebar width */
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 80px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 32px;
  box-shadow: var(--shadow-sm);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-btn {
  background: transparent;
  color: #64748b;
  padding: 8px;
  border-radius: 50%;
}
.icon-btn:hover {
  background: #f1f5f9;
  color: #3b82f6;
}

.relative { position: relative; }

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #10b981;
  color: white;
  font-size: 0.7rem;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 16px;
  padding: 4px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info .name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
}

.user-info .role {
  font-size: 0.8rem;
  color: #64748b;
}

.settings-btn {
  background: #6366f1;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
}

.settings-btn:hover {
  transform: rotate(45deg);
}

.content-area {
  padding: 32px;
  overflow-y: auto;
  height: calc(100vh - 80px);
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
