import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF2FF] via-[#F4F8FF] to-[#F0EDFF] text-content-dark flex">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container */}
      <div className={`flex-1 transition-all duration-300 flex flex-col ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Topbar */}
        <Topbar collapsed={collapsed} />

        {/* Content Area */}
        <main className="mt-16 p-6 md:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
