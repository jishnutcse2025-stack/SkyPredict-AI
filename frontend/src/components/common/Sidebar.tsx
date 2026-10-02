import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlaneTakeoff,
  SlidersHorizontal,
  Compass,
  History,
  FileSpreadsheet,
  Plane,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Predict Flight', path: '/predict', icon: PlaneTakeoff },
  { name: 'Model Comparison', path: '/models', icon: SlidersHorizontal },
  { name: 'Route Analytics', path: '/routes', icon: Compass },
  { name: 'Prediction History', path: '/history', icon: History },
  { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-navy text-white transition-all duration-300 flex flex-col justify-between border-r border-navy-light/40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-4 py-5 border-b border-navy-light/50">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-royal to-sky flex items-center justify-center shrink-0 shadow-md">
              <Plane className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-bold text-lg tracking-tight text-white block leading-tight">
                  SkyPredict <span className="text-sky">AI</span>
                </span>
                <span className="text-[10px] text-sky-light/80 uppercase tracking-widest font-semibold block">
                  Aviation Intelligence
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-navy-light/60 hover:bg-navy-light text-slate-300 hover:text-white transition-colors ml-1"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                    isActive
                      ? 'bg-royal text-white shadow-subtle'
                      : 'text-slate-300 hover:bg-navy-light/70 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Banner */}
      <div className="p-3 border-t border-navy-light/50">
        <div className={`p-3 rounded-xl bg-navy-light/40 border border-navy-light/60 flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-2.5 h-2.5 rounded-full bg-teal shrink-0 animate-pulse" />
          {!collapsed && (
            <div className="truncate text-xs">
              <p className="font-semibold text-white flex items-center gap-1">
                ML Pipeline Active <ShieldCheck className="w-3.5 h-3.5 text-teal" />
              </p>
              <p className="text-[11px] text-slate-300">BTS Operations Calibrated</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
