import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Info,
  TrendingDown,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { FlightPredictionResult } from '../../types';

interface PredictionResultPanelProps {
  result: FlightPredictionResult;
}

export const PredictionResultPanel: React.FC<PredictionResultPanelProps> = ({ result }) => {
  const isDelayed = result.is_delayed;
  const probPct = Math.round(result.delay_probability * 100);

  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-blue-100 shadow-sm space-y-6">
      {/* Header Result Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-content-muted">
              Prediction Verdict
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-content-muted flex items-center gap-1">
              <Cpu className="w-3 h-3 text-royal" /> {result.model_used.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <div
              className={`p-2 rounded-xl flex items-center justify-center ${
                isDelayed ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
              }`}
            >
              {isDelayed ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${isDelayed ? 'text-amber-800' : 'text-teal-800'}`}>
                {result.prediction_label}
              </h3>
              <p className="text-xs text-content-muted">
                Flight {result.flight_number} ({result.origin} → {result.dest})
              </p>
            </div>
          </div>
        </div>

        {/* Delay Threshold Definition */}
        <div className="bg-pale-bg px-3.5 py-2 rounded-xl border border-blue-100 text-right">
          <p className="text-[10px] text-content-muted uppercase tracking-wider font-semibold">Standard Threshold</p>
          <p className="text-xs font-bold text-navy">≥ 15 min Departure Delay</p>
          <p className="text-[10px] text-content-subtle">US BTS Label Definition</p>
        </div>
      </div>

      {/* Metrics Row: Probability Gauge & Duration Regressor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Probability Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-pale-bg to-white border border-blue-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-content-muted flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-royal" /> Delay Probability Estimate
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  result.risk_level === 'High'
                    ? 'bg-red-100 text-red-700'
                    : result.risk_level === 'Moderate'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-teal-100 text-teal-700'
                }`}
              >
                {result.risk_level} Risk
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-navy">{probPct}%</span>
              <span className="text-xs text-content-muted">model confidence score</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  probPct >= 65 ? 'bg-amber-500' : probPct >= 35 ? 'bg-royal' : 'bg-teal'
                }`}
                style={{ width: `${Math.max(5, probPct)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-content-subtle mt-1 font-medium">
              <span>0% Low</span>
              <span>50% Baseline</span>
              <span>100% Critical</span>
            </div>
          </div>
        </div>

        {/* Estimated Duration Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-lavender-surface/50 to-white border border-lavender/30 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-content-muted flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-lavender" /> Estimated Delay Duration
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-navy">
                {result.estimated_delay_minutes > 0 ? `+${result.estimated_delay_minutes}` : result.estimated_delay_minutes}
              </span>
              <span className="text-sm font-semibold text-content-muted">minutes</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-content-muted bg-white/70 p-2.5 rounded-lg border border-lavender/20 flex items-center gap-2">
            <Info className="w-4 h-4 text-lavender shrink-0" />
            <span>
              {result.estimated_delay_minutes >= 15
                ? 'Anticipate dispatch metering or ground stop delay.'
                : 'Expected to maintain normal schedule clearance.'}
            </span>
          </div>
        </div>
      </div>

      {/* Model Explainability: Feature Contributions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-navy flex items-center gap-2">
            Driver Contributions (SHAP & Model Attribution)
          </h4>
          <span className="text-[11px] text-content-subtle">Association weights from trained trees</span>
        </div>

        <div className="space-y-2.5">
          {result.contributions.map((item, idx) => {
            const isRisk = item.direction === 'increases_delay_risk';
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isRisk ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {isRisk ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-semibold text-navy block">{item.display_name}</span>
                    <span className="text-[11px] text-content-muted">
                      Observed: <strong className="text-navy">{item.input_value}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] ${
                      isRisk ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-700'
                    }`}
                  >
                    {isRisk ? '+ Delay Impact' : 'Supports On-Time'}
                  </span>
                  <span className="text-[11px] text-content-subtle block mt-0.5">
                    {item.importance_pct}% relative weight
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Limitations Disclaimer */}
      <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-content-muted flex items-start gap-2.5">
        <Info className="w-4 h-4 text-royal shrink-0 mt-0.5" />
        <p className="leading-relaxed">{result.disclaimer}</p>
      </div>
    </div>
  );
};
