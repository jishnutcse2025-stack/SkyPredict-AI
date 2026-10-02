import React, { useEffect, useState } from 'react';
import {
  Compass,
  MapPin,
  Filter,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Building,
  RotateCcw,
  Clock,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { api } from '../services/api';
import { RouteInsightsData, RouteDelayStat } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

const AIRPORTS = ['ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'JFK', 'SFO', 'SEA', 'MIA', 'BOS', 'MCO', 'CLT'];
const AIRLINES = [
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'AA', name: 'American Airlines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'WN', name: 'Southwest Airlines' },
  { code: 'B6', name: 'JetBlue Airways' },
  { code: 'AS', name: 'Alaska Airlines' },
  { code: 'NK', name: 'Spirit Airlines' },
];

export const RouteAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<RouteInsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [originFilter, setOriginFilter] = useState<string>('');
  const [destFilter, setDestFilter] = useState<string>('');
  const [airlineFilter, setAirlineFilter] = useState<string>('');

  // Selected Route Detail Modal
  const [selectedRoute, setSelectedRoute] = useState<RouteDelayStat | null>(null);

  useEffect(() => {
    // Check if query params were passed in URL
    const params = new URLSearchParams(window.location.search);
    const orig = params.get('origin') || '';
    const dst = params.get('dest') || '';
    const al = params.get('airline') || '';
    if (orig) setOriginFilter(orig);
    if (dst) setDestFilter(dst);
    if (al) setAirlineFilter(al);

    fetchRoutes(orig, dst, al);
  }, []);

  const fetchRoutes = async (orig = originFilter, dst = destFilter, al = airlineFilter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRouteAnalytics({
        origin: orig || undefined,
        dest: dst || undefined,
        airline: al || undefined,
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch route analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRoutes(originFilter, destFilter, airlineFilter);
  };

  const handleResetFilters = () => {
    setOriginFilter('');
    setDestFilter('');
    setAirlineFilter('');
    fetchRoutes('', '', '');
  };

  if (loading) return <LoadingState message="Aggregating route intelligence from dataset..." />;
  if (error || !data) return <ErrorState message={error || 'No route data found'} onRetry={() => fetchRoutes()} />;

  const { route_stats, origin_stats, dest_stats, dataset_avg_delay_rate, dataset_avg_delay_min, insights } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-pale-border gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-light text-teal-dark text-xs font-semibold mb-1.5">
            <Compass className="w-3.5 h-3.5" /> Empirical Network Intelligence
          </div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Route Operations & Delay Analytics</h1>
          <p className="text-xs text-content-muted mt-0.5">
            Real aggregations across hub networks, high-friction corridors, and airport delay distribution profiles.
          </p>
        </div>

        {/* Global Benchmark Badges */}
        <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm text-xs">
          <div>
            <span className="text-content-muted block text-[10px] uppercase font-semibold">Baseline Delay Rate</span>
            <span className="font-bold text-navy">{dataset_avg_delay_rate}%</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-content-muted block text-[10px] uppercase font-semibold">Mean Corridor Delay</span>
            <span className="font-bold text-navy">{dataset_avg_delay_min} mins</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={handleApplyFilter}
        className="bg-white/95 rounded-2xl p-4 border border-blue-100 shadow-sm flex flex-col md:flex-row items-center gap-4 text-xs"
      >
        <div className="flex items-center gap-2 text-content-muted font-semibold shrink-0">
          <Filter className="w-4 h-4 text-royal" /> Filter Network:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
          <div>
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="w-full px-3 py-2 bg-pale-bg/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 font-medium text-navy"
            >
              <option value="">All Origins</option>
              {AIRPORTS.map((a) => (
                <option key={a} value={a}>
                  Origin: {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={destFilter}
              onChange={(e) => setDestFilter(e.target.value)}
              className="w-full px-3 py-2 bg-pale-bg/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 font-medium text-navy"
            >
              <option value="">All Destinations</option>
              {AIRPORTS.map((a) => (
                <option key={a} value={a}>
                  Destination: {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={airlineFilter}
              onChange={(e) => setAirlineFilter(e.target.value)}
              className="w-full px-3 py-2 bg-pale-bg/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 font-medium text-navy"
            >
              <option value="">All Carriers</option>
              {AIRLINES.map((al) => (
                <option key={al.code} value={al.code}>
                  Carrier: {al.code} ({al.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            type="submit"
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-royal hover:bg-royal-hover text-white font-semibold transition-colors shadow-sm"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-content-muted transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Innovative Feature: ROUTE DELAY INSIGHTS */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-royal/5 via-lavender/10 to-teal/5 rounded-2xl p-5 border border-royal/20 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-royal text-white">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-navy">Route Delay Insights (Empirical Findings)</h3>
          </div>
          <div className="space-y-2 text-xs text-navy leading-relaxed">
            {insights.map((ins, idx) => (
              <p key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-blue-100/60 font-medium">
                <span className="text-royal font-bold">•</span>
                <span>{ins}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Top Delayed Routes Table */}
      <div className="bg-white/95 rounded-2xl p-6 border border-blue-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-navy">Route Performance Directory</h3>
            <p className="text-xs text-content-muted">
              Corridors ordered by observed departure delay frequency (minimum sample threshold applied)
            </p>
          </div>
          <span className="text-xs font-semibold text-content-muted">{route_stats.length} corridors analyzed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-content-muted uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Route Corridor</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3 text-right">Flights Tested</th>
                <th className="py-3 px-3 text-right">Delayed Flights</th>
                <th className="py-3 px-3 text-right">Delay Rate (%)</th>
                <th className="py-3 px-3 text-right">Avg Delay (min)</th>
                <th className="py-3 px-3 text-center">Relative Risk</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {route_stats.slice(0, 20).map((r, idx) => {
                const isHighRisk = r.delay_rate_pct > dataset_avg_delay_rate;
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedRoute(r)}
                    className="hover:bg-pale-bg/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-navy flex items-center gap-2">
                      <span className="text-royal">{r.origin}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-content-muted" />
                      <span className="text-navy">{r.dest}</span>
                    </td>
                    <td className="py-3 px-3 text-content-muted">{r.distance_miles} miles</td>
                    <td className="py-3 px-3 text-right font-medium">{r.total_flights.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-amber-700 font-semibold">{r.delayed_flights}</td>
                    <td className="py-3 px-3 text-right font-bold text-navy">{r.delay_rate_pct}%</td>
                    <td className="py-3 px-3 text-right font-semibold text-navy">{r.avg_delay_min} min</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isHighRisk ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {isHighRisk ? 'Above Avg' : 'Below Avg'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoute(r);
                        }}
                        className="text-royal font-semibold hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Airport Departure & Arrival Friction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Origin Airports */}
        <div className="bg-white/95 rounded-2xl p-6 border border-blue-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-navy">Origin Hub Departure Friction</h3>
            <p className="text-xs text-content-muted">Observed delay frequency by originating airport</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={origin_stats.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="airport" tick={{ fontSize: 11, fill: '#17365D', fontWeight: 600 }} />
                <YAxis unit="%" tick={{ fontSize: 10, fill: '#5A6E85' }} />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Delay Rate']} />
                <Bar dataKey="delay_rate_pct" fill="#2878D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Destination Airports */}
        <div className="bg-white/95 rounded-2xl p-6 border border-blue-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-navy">Destination Airspace Impact</h3>
            <p className="text-xs text-content-muted">Delay rates for inbound flights by destination hub</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dest_stats.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="airport" tick={{ fontSize: 11, fill: '#17365D', fontWeight: 600 }} />
                <YAxis unit="%" tick={{ fontSize: 10, fill: '#5A6E85' }} />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Delay Rate']} />
                <Bar dataKey="delay_rate_pct" fill="#8B7CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Selected Route Detail Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-blue-100 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-royal" />
                <h3 className="text-base font-bold text-navy">
                  Corridor Detail: {selectedRoute.origin} → {selectedRoute.dest}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRoute(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-content-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-pale-bg border border-blue-100">
                <span className="text-content-muted block">Corridor Distance</span>
                <span className="text-base font-bold text-navy">{selectedRoute.distance_miles} miles</span>
              </div>
              <div className="p-3 rounded-xl bg-pale-bg border border-blue-100">
                <span className="text-content-muted block">Corridor Delay Rate</span>
                <span className="text-base font-bold text-amber-700">{selectedRoute.delay_rate_pct}%</span>
              </div>
              <div className="p-3 rounded-xl bg-pale-bg border border-blue-100">
                <span className="text-content-muted block">Average Delay</span>
                <span className="text-base font-bold text-navy">{selectedRoute.avg_delay_min} mins</span>
              </div>
              <div className="p-3 rounded-xl bg-pale-bg border border-blue-100">
                <span className="text-content-muted block">Sample Observed</span>
                <span className="text-base font-bold text-navy">{selectedRoute.total_flights} flights</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-content-muted space-y-1">
              <span className="font-semibold text-navy block">Operational Note:</span>
              <p>
                Flights operating on corridor {selectedRoute.origin} → {selectedRoute.dest} exhibit a {selectedRoute.delay_rate_pct > dataset_avg_delay_rate ? 'higher than average' : 'favorable'} delay frequency. Dispatch planners are advised to cross-check arrival airport metering before gate pushback.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRoute(null)}
                className="px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-light"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
