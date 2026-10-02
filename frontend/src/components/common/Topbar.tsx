import React, { useState } from 'react';
import { Search, Bell, User, CheckCircle2, AlertTriangle, X, ChevronDown, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  collapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ collapsed }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'Model Re-trained Successfully', desc: 'XGBoost & Random Forest updated with 3,000 test cases.', time: '10m ago', icon: CheckCircle2, color: 'text-teal' },
    { id: 2, title: 'Severe Convective Weather Alert', desc: 'Summer thunderstorms forming in ORD and DFW corridors.', time: '35m ago', icon: AlertTriangle, color: 'text-amber' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toUpperCase();
    if (query.includes('→') || query.includes('-') || query.length === 6) {
      // Looks like a route
      navigate(`/routes?origin=${query.slice(0, 3)}&dest=${query.slice(-3)}`);
    } else if (query.length <= 4) {
      // Looks like an airport or airline
      navigate(`/routes?origin=${query}`);
    } else {
      // Looks like a flight number
      navigate(`/history?origin=${query}`);
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/95 backdrop-blur border-b border-pale-border transition-all duration-300 flex items-center justify-between px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Global Search */}
      <form onSubmit={handleSearchSubmit} className="relative w-96 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search flight (e.g. DL1248), airport (ORD), route (ATL→DFW)..."
          className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-pale-bg/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal text-content-dark placeholder:text-content-muted transition-all"
        />
      </form>

      {/* Right Controls: Engine Badge, Notifications, User Profile */}
      <div className="flex items-center space-x-4">
        {/* Model Indicator Badge */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-lavender-surface border border-lavender/30 text-content-dark text-xs font-medium">
          <Sliders className="w-3.5 h-3.5 text-lavender" />
          <span>Active ML: <strong className="text-royal">XGBoost</strong></span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="p-2 rounded-xl text-content-muted hover:text-content-dark hover:bg-pale-bg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-royal ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-pale-border py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <span className="font-semibold text-xs text-content-dark uppercase tracking-wider">Aviation Alerts</span>
                <button onClick={() => setShowNotifications(false)} className="text-content-muted hover:text-content-dark">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="p-3.5 hover:bg-pale-bg/50 transition-colors flex space-x-3 text-xs">
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${n.color}`} />
                      <div>
                        <p className="font-semibold text-content-dark">{n.title}</p>
                        <p className="text-content-muted mt-0.5 leading-snug">{n.desc}</p>
                        <span className="text-[10px] text-content-subtle mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2.5 p-1.5 pl-2 rounded-xl hover:bg-pale-bg transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center font-bold text-xs shadow-sm">
              AO
            </div>
            <div className="hidden md:block text-left text-xs leading-tight">
              <p className="font-semibold text-content-dark">Flight Ops Analyst</p>
              <p className="text-[11px] text-content-muted">FAA Dispatch Dept</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-content-muted" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-pale-border py-2 z-50 text-xs text-content-dark">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-semibold">Airline Operations Console</p>
                <p className="text-content-muted text-[11px]">System Status: Connected</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { navigate('/models'); setShowProfile(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-pale-bg text-content-dark transition-colors"
                >
                  Configure ML Algorithms
                </button>
                <button
                  onClick={() => { navigate('/reports'); setShowProfile(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-pale-bg text-content-dark transition-colors"
                >
                  Generate Operations PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
