import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  X,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { PredictionHistoryItem } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

const AIRPORTS = ['ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'JFK', 'SFO', 'SEA', 'MIA', 'BOS', 'MCO', 'CLT'];
const AIRLINES = ['DL', 'AA', 'UA', 'WN', 'B6', 'AS', 'NK'];

export const PredictionHistoryPage: React.FC = () => {
  const [items, setItems] = useState<PredictionHistoryItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [origin, setOrigin] = useState<string>('');
  const [dest, setDest] = useState<string>('');
  const [airline, setAirline] = useState<string>('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>(''); // '', 'delayed', 'on_time'
  const [modelFilter, setModelFilter] = useState<string>('');

  // Modals
  const [selectedItem, setSelectedItem] = useState<PredictionHistoryItem | null>(null);
  const [reconcileItem, setReconcileItem] = useState<PredictionHistoryItem | null>(null);
  const [actualMinutes, setActualMinutes] = useState<number>(0);
  const [actualOutcome, setActualOutcome] = useState<string>('Delayed');

  useEffect(() => {
    fetchHistory();
  }, [origin, dest, airline, outcomeFilter, modelFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const isDel = outcomeFilter === 'delayed' ? true : (outcomeFilter === 'on_time' ? false : undefined);
      const res = await api.getHistory({
        origin: origin || undefined,
        dest: dest || undefined,
        airline: airline || undefined,
        is_delayed: isDel,
        model_used: modelFilter || undefined,
        limit: 100,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load prediction history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this prediction record?')) return;

    try {
      await api.deleteHistoryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (err: any) {
      alert(`Deletion error: ${err.message}`);
    }
  };

  const handleReconcileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileItem) return;

    try {
      const res = await api.reconcileHistoryItem(reconcileItem.id, {
        actual_delay_min: actualMinutes,
        actual_outcome: actualOutcome,
      });
      setItems((prev) =>
        prev.map((i) => (i.id === reconcileItem.id ? res.record : i))
      );
      if (selectedItem?.id === reconcileItem.id) {
        setSelectedItem(res.record);
      }
      setReconcileItem(null);
    } catch (err: any) {
      alert(`Error reconciling outcome: ${err.message}`);
    }
  };

  const handleResetFilters = () => {
    setOrigin('');
    setDest('');
    setAirline('');
    setOutcomeFilter('');
    setModelFilter('');
  };

  const downloadCsv = () => {
    window.location.href = api.downloadCsvUrl('history');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-pale-border gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-light text-amber-dark text-xs font-semibold mb-1.5">
            <History className="w-3.5 h-3.5" /> Persistent Database Audit
          </div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Prediction Audit History</h1>
          <p className="text-xs text-content-muted mt-0.5">
            Full transaction log of flight delay forecasts stored in SQLite / PostgreSQL with model explainability artifacts.
          </p>
        </div>

        {/* Export Action */}
        <button
          onClick={downloadCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-navy font-semibold text-xs hover:bg-pale-bg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-royal" /> Export History (CSV)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/95 rounded-2xl p-4 border border-blue-100 shadow-sm flex flex-col md:flex-row items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-content-muted font-semibold shrink-0">
          <Filter className="w-4 h-4 text-royal" /> Filter Log:
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 flex-1 w-full">
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="px-2.5 py-1.5 bg-pale-bg/60 border border-slate-200 rounded-lg text-navy font-medium"
          >
            <option value="">All Origins</option>
            {AIRPORTS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className="px-2.5 py-1.5 bg-pale-bg/60 border border-slate-200 rounded-lg text-navy font-medium"
          >
            <option value="">All Destinations</option>
            {AIRPORTS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
            className="px-2.5 py-1.5 bg-pale-bg/60 border border-slate-200 rounded-lg text-navy font-medium"
          >
            <option value="">All Carriers</option>
            {AIRLINES.map((al) => (
              <option key={al} value={al}>{al}</option>
            ))}
          </select>

          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-pale-bg/60 border border-slate-200 rounded-lg text-navy font-medium"
          >
            <option value="">All Outcomes</option>
            <option value="delayed">Delayed (≥15m)</option>
            <option value="on_time">On-Time</option>
          </select>

          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-pale-bg/60 border border-slate-200 rounded-lg text-navy font-medium"
          >
            <option value="">All Models</option>
            <option value="xgboost">XGBoost</option>
            <option value="random_forest">Random Forest</option>
            <option value="decision_tree">Decision Tree</option>
            <option value="logistic_regression">Logistic Reg</option>
          </select>
        </div>

        <button
          onClick={handleResetFilters}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-content-muted"
          title="Clear Filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingState message="Loading prediction history logs..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No Prediction Records Found"
          description="Adjust your search filters or run a new flight delay prediction on the Predict Flight page."
          actionText="Make a Prediction"
          onAction={() => (window.location.href = '/predict')}
        />
      ) : (
        <div className="bg-white/95 rounded-2xl p-6 border border-blue-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
            <span className="font-semibold text-navy">{total} Logged Predictions</span>
            <span className="text-content-muted">Showing recent 100 entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-content-muted uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Flight ID</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Airline</th>
                  <th className="py-3 px-3">Departure Date</th>
                  <th className="py-3 px-3">Predicted Result</th>
                  <th className="py-3 px-3">Est. Delay</th>
                  <th className="py-3 px-3">Model</th>
                  <th className="py-3 px-3">Reconciliation</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isDel = item.is_delayed;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="hover:bg-pale-bg/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-bold text-navy">{item.flight_number}</td>
                      <td className="py-3 px-3 font-medium">
                        {item.origin} → {item.dest}
                      </td>
                      <td className="py-3 px-3 text-content-muted">{item.airline}</td>
                      <td className="py-3 px-3 text-content-muted">
                        {item.flight_date} @ {item.sched_dep_hour.toString().padStart(2, '0')}:00
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                            isDel ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {item.prediction_label}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-navy">
                        {item.estimated_delay_minutes > 0 ? `+${item.estimated_delay_minutes}` : item.estimated_delay_minutes}m
                      </td>
                      <td className="py-3 px-3 text-content-muted text-[11px] uppercase">
                        {item.model_used}
                      </td>
                      <td className="py-3 px-3">
                        {item.actual_outcome ? (
                          <span className="text-[11px] font-semibold text-navy bg-slate-100 px-2 py-0.5 rounded">
                            Actual: {item.actual_outcome} ({item.actual_delay_min}m)
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReconcileItem(item);
                            }}
                            className="text-[11px] text-royal font-medium hover:underline"
                          >
                            + Add Actual
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-content-muted hover:text-royal"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-content-muted hover:text-red-600"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-blue-100 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-content-muted uppercase tracking-wider font-semibold">
                  Record ID: {selectedItem.id.slice(0, 12)}...
                </span>
                <h3 className="text-lg font-bold text-navy">
                  Flight {selectedItem.flight_number} ({selectedItem.origin} → {selectedItem.dest})
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-content-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Flight Parameter Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-pale-bg">
                <span className="text-content-muted block text-[11px]">Carrier</span>
                <strong className="text-navy">{selectedItem.airline}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-pale-bg">
                <span className="text-content-muted block text-[11px]">Departure</span>
                <strong className="text-navy">{selectedItem.sched_dep_hour.toString().padStart(2, '0')}:00</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-pale-bg">
                <span className="text-content-muted block text-[11px]">Weather</span>
                <strong className="text-navy">{selectedItem.weather_condition}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-pale-bg">
                <span className="text-content-muted block text-[11px]">Distance</span>
                <strong className="text-navy">{selectedItem.distance_miles} mi</strong>
              </div>
            </div>

            {/* Prediction Evaluation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-content-muted">Predicted Classification:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${selectedItem.is_delayed ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>
                  {selectedItem.prediction_label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-content-muted">Estimated Delay Duration:</span>
                <strong className="text-navy">{selectedItem.estimated_delay_minutes} minutes</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-content-muted">Model Delay Probability:</span>
                <strong className="text-navy">{(selectedItem.delay_probability * 100).toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-content-muted">Algorithm Evaluator:</span>
                <strong className="text-navy uppercase">{selectedItem.model_used}</strong>
              </div>
            </div>

            {/* Drivers / SHAP Contributors */}
            {selectedItem.contributions && selectedItem.contributions.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-navy">Driver Attribution Breakdown</h4>
                <div className="space-y-1.5">
                  {selectedItem.contributions.map((c, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-pale-bg/60 border border-blue-100 flex justify-between items-center">
                      <span className="font-medium text-navy">{c.display_name} ({c.input_value})</span>
                      <span className={`text-[11px] font-semibold ${c.direction === 'increases_delay_risk' ? 'text-amber-700' : 'text-teal-700'}`}>
                        {c.direction === 'increases_delay_risk' ? '+ Delay Risk' : 'On-Time'} ({c.importance_pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reconciliation State */}
            {selectedItem.actual_outcome ? (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex justify-between items-center">
                <span>Verified Actual Outcome: <strong>{selectedItem.actual_outcome} ({selectedItem.actual_delay_min} mins)</strong></span>
                <span className="text-[10px] bg-teal-200 text-teal-900 px-2 py-0.5 rounded font-bold">Reconciled</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                <span className="text-content-muted">Actual flight outcome not yet recorded.</span>
                <button
                  onClick={() => {
                    const item = selectedItem;
                    setSelectedItem(null);
                    setReconcileItem(item);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-royal text-white font-semibold text-[11px]"
                >
                  Record Actual Delay
                </button>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-light"
              >
                Close Audit Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {reconcileItem && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-blue-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-navy">
                Reconcile Actual Flight Outcome
              </h3>
              <button onClick={() => setReconcileItem(null)} className="text-content-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-content-muted">
              Enter verified post-departure metrics for Flight {reconcileItem.flight_number} to compare against machine learning prediction.
            </p>

            <form onSubmit={handleReconcileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-content-dark block mb-1">
                  Actual Outcome Classification
                </label>
                <select
                  value={actualOutcome}
                  onChange={(e) => setActualOutcome(e.target.value)}
                  className="w-full px-3 py-2 bg-pale-bg/60 border border-slate-200 rounded-lg text-navy font-medium"
                >
                  <option value="Delayed">Delayed (≥ 15 min)</option>
                  <option value="On-Time">On-Time / Cleared</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-content-dark block mb-1">
                  Actual Departure Delay (Minutes)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={actualMinutes}
                  onChange={(e) => setActualMinutes(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-pale-bg/60 border border-slate-200 rounded-lg text-navy font-medium"
                  placeholder="e.g. 24.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReconcileItem(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-content-dark text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-royal hover:bg-royal-hover text-white text-xs font-semibold"
                >
                  Save Reconciliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
