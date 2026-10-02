import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sliders,
  Compass,
  History,
  FileSpreadsheet,
  Calendar,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { StatCard } from '../components/common/StatCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load aviation dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading aviation operations command center..." />;
  if (error || !data) return <ErrorState message={error || 'No data found'} onRetry={loadDashboard} />;

  const { stats, hourly_trends, airline_delays, top_delayed_routes, delay_causes, recent_predictions } = data;

  const pieData = [
    { name: 'On-Time (<15m)', value: stats.on_time_flights, color: '#24B8A6' },
    { name: 'Delayed (≥15m)', value: stats.delayed_flights, color: '#F5A34D' },
  ];

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy via-navy-light to-royal p-6 md:p-8 text-white shadow-card">
        {/* Subtle decorative background plane shape */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <Plane className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-sky-light">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentDateStr}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              <span>BTS Operations Calibrated</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Aviation Analytics Command Center
            </h1>
            <p className="text-xs md:text-sm text-sky-light/90 leading-relaxed font-normal">
              SkyPredict AI synthesizes historical flight performance, atmospheric vectors, and multi-model machine learning to forecast operational disruptions with high fidelity.
            </p>
            <p className="text-xs font-semibold text-teal-200">
              Tagline: <span className="text-white italic">Smarter Predictions. Smoother Journeys.</span>
            </p>
          </div>

          {/* Quick Primary Predict Action */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/predict')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-navy font-bold text-xs hover:bg-sky-light transition-all shadow-md group"
            >
              <Plane className="w-4 h-4 text-royal group-hover:translate-x-0.5 transition-transform" />
              Predict a Flight
            </button>
            <button
              onClick={() => navigate('/models')}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs transition-colors"
            >
              <Sliders className="w-4 h-4 text-sky" /> Compare ML Models
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Flights Analyzed"
          value={stats.total_flights_analyzed.toLocaleString()}
          subtitle="Observed multi-carrier flights"
          icon={Layers}
          color="royal"
          badgeText="Verified Corpus"
        />
        <StatCard
          title="Delayed Flights (≥15m)"
          value={stats.delayed_flights.toLocaleString()}
          subtitle={`${stats.delay_rate_pct}% observed delay rate`}
          icon={AlertTriangle}
          color="amber"
          badgeText="Delay Incidence"
        />
        <StatCard
          title="On-Time Flights"
          value={stats.on_time_flights.toLocaleString()}
          subtitle={`${(100 - stats.delay_rate_pct).toFixed(1)}% punctuality record`}
          icon={CheckCircle2}
          color="teal"
          badgeText="Cleared On-Time"
        />
        <StatCard
          title="Average Delay"
          value={`${stats.average_delay_minutes} min`}
          subtitle="Mean departure variance"
          icon={Clock}
          color="lavender"
          badgeText="Fleet Average"
        />
      </div>

      {/* Main Charts Grid: 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Delay Trend Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white/95 rounded-2xl p-6 border border-blue-100/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-royal" /> Delay Rate by Scheduled Departure Hour
              </h3>
              <p className="text-xs text-content-muted">
                Observed delay escalation curves tracking evening hub cascading effects
              </p>
            </div>
            <span className="text-[11px] font-semibold text-royal px-2.5 py-0.5 rounded-full bg-royal-light">
              24-Hour Horizon
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="delayArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2878D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2878D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="hour_label" tick={{ fontSize: 10, fill: '#5A6E85' }} />
                <YAxis unit="%" tick={{ fontSize: 10, fill: '#5A6E85' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Delay Rate']}
                  labelFormatter={(lbl) => `Time Window: ${lbl}`}
                />
                <Area
                  type="monotone"
                  dataKey="delay_rate_pct"
                  stroke="#2878D4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#delayArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center text-[11px] text-content-muted pt-2 border-t border-slate-100">
            <span>Morning troughs: 06:00 - 09:00</span>
            <span className="font-semibold text-amber-700">Peak operational delay: 17:00 - 20:00</span>
          </div>
        </div>

        {/* On-Time vs Delayed Pie Distribution */}
        <div className="bg-white/95 rounded-2xl p-6 border border-blue-100/70 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy">Flight Reliability Ratio</h3>
            <p className="text-xs text-content-muted">On-time clearance vs. standard ≥15m delays</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} flights`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-navy">{stats.delay_rate_pct}%</span>
              <span className="text-[10px] text-content-muted uppercase">Delayed</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-content-dark font-medium">
                <span className="w-3 h-3 rounded-full bg-teal" /> On-Time Operations
              </span>
              <span className="font-bold text-navy">{stats.on_time_flights.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-content-dark font-medium">
                <span className="w-3 h-3 rounded-full bg-amber" /> Delayed Operations
              </span>
              <span className="font-bold text-navy">{stats.delayed_flights.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Airline Punctuality and Most Delayed Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carrier Delay Comparison */}
        <div className="bg-white/95 rounded-2xl p-6 border border-blue-100/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy">Airline Delay Rate Ranking</h3>
              <p className="text-xs text-content-muted">Percentage of departures delayed ≥15 minutes by carrier</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={airline_delays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="airline" tick={{ fontSize: 11, fill: '#17365D', fontWeight: 600 }} />
                <YAxis unit="%" tick={{ fontSize: 10, fill: '#5A6E85' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Delay Rate']}
                  labelFormatter={(lbl) => {
                    const match = airline_delays.find((a) => a.airline === lbl);
                    return match ? `${match.airline_name} (${lbl})` : String(lbl);
                  }}
                />
                <Bar dataKey="delay_rate_pct" fill="#8B7CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Delayed Routes */}
        <div className="bg-white/95 rounded-2xl p-6 border border-blue-100/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy">Most Delayed Hub Corridors</h3>
              <p className="text-xs text-content-muted">Flight routes exhibiting highest historical delay rates</p>
            </div>
            <button
              onClick={() => navigate('/routes')}
              className="text-xs font-semibold text-royal hover:underline flex items-center gap-1"
            >
              All Routes <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {top_delayed_routes.slice(0, 5).map((r, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/routes?origin=${r.origin}&dest=${r.dest}`)}
                className="p-3 rounded-xl bg-slate-50/70 hover:bg-pale-bg border border-slate-100 flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-navy text-white flex items-center justify-center font-bold text-[11px]">
                    #{idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-navy text-sm">{r.route}</span>
                    <span className="text-[11px] text-content-muted block">
                      {r.distance_miles} mi • {r.total_flights} flights observed
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">
                    {r.delay_rate_pct}% delayed
                  </span>
                  <span className="text-[11px] text-content-muted block mt-0.5">
                    Avg delay: <strong>{r.avg_delay_min}m</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delay Reasons Breakdown (BTS Root Causes) */}
      {delay_causes.length > 0 && (
        <div className="bg-white/95 rounded-2xl p-6 border border-blue-100/70 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-navy">Delay Reason Breakdown (BTS Taxonomy)</h3>
            <p className="text-xs text-content-muted">Primary contributing factors across delayed flight corpus</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {delay_causes.map((c, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-pale-surface/40 border border-lavender/30">
                <span className="text-xs font-semibold text-content-muted uppercase tracking-wider block">
                  {c.cause}
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-navy">{c.pct}%</span>
                  <span className="text-xs text-content-muted">{c.flights.toLocaleString()} flights</span>
                </div>
                <div className="mt-2 text-[11px] text-content-subtle pt-2 border-t border-lavender/20">
                  Avg impact: <strong>{c.avg_minutes} min</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Predictions Table */}
      <div className="bg-white/95 rounded-2xl p-6 border border-blue-100/70 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy">Recent Flight Predictions</h3>
            <p className="text-xs text-content-muted">Live audit stream of evaluated flights</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-semibold text-royal hover:underline flex items-center gap-1"
          >
            Full History <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-content-muted uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Flight</th>
                <th className="py-3 px-3">Route</th>
                <th className="py-3 px-3">Carrier</th>
                <th className="py-3 px-3">Departure</th>
                <th className="py-3 px-3">Result</th>
                <th className="py-3 px-3">Est. Delay</th>
                <th className="py-3 px-3">Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(recent_predictions || []).map((p, idx) => {
                const isDel = Boolean(p.is_delayed);
                const depHour = typeof p.sched_dep_hour === 'number' ? p.sched_dep_hour : 0;
                const estDelay = typeof p.estimated_delay_minutes === 'number' ? p.estimated_delay_minutes : 0;
                const delayProb = typeof p.delay_probability === 'number' ? p.delay_probability : 0;

                return (
                  <tr key={p.id || idx} className="hover:bg-pale-bg/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-navy">{p.flight_number || 'N/A'}</td>
                    <td className="py-3 px-3 font-medium">
                      {p.origin || '---'} → {p.dest || '---'}
                    </td>
                    <td className="py-3 px-3 text-content-muted">{p.airline || '---'}</td>
                    <td className="py-3 px-3 text-content-muted">
                      {depHour.toString().padStart(2, '0')}:00
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          isDel ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {p.prediction_label || (isDel ? 'Likely Delayed' : 'Likely On-Time')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-navy">
                      {estDelay > 0 ? `+${estDelay}` : estDelay} min
                    </td>
                    <td className="py-3 px-3 font-medium text-content-dark">
                      {(delayProb * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Footer Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => navigate('/predict')}
          className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-sm hover:border-royal transition-all flex flex-col items-center justify-center text-center group"
        >
          <Plane className="w-5 h-5 text-royal mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-navy">Predict a Flight</span>
        </button>
        <button
          onClick={() => navigate('/models')}
          className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-sm hover:border-royal transition-all flex flex-col items-center justify-center text-center group"
        >
          <Sliders className="w-5 h-5 text-lavender mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-navy">Compare Models</span>
        </button>
        <button
          onClick={() => navigate('/routes')}
          className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-sm hover:border-royal transition-all flex flex-col items-center justify-center text-center group"
        >
          <Compass className="w-5 h-5 text-teal mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-navy">Route Analytics</span>
        </button>
        <button
          onClick={() => navigate('/history')}
          className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-sm hover:border-royal transition-all flex flex-col items-center justify-center text-center group"
        >
          <History className="w-5 h-5 text-amber mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-navy">Prediction History</span>
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="p-3.5 rounded-xl bg-white border border-blue-100 shadow-sm hover:border-royal transition-all flex flex-col items-center justify-center text-center group col-span-2 sm:col-span-1"
        >
          <FileSpreadsheet className="w-5 h-5 text-royal mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-navy">Generate Report</span>
        </button>
      </div>
    </div>
  );
};
