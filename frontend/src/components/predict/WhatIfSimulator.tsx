import React, { useState } from 'react';
import {
  Sliders,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Clock,
  CloudSun
} from 'lucide-react';
import { FlightPredictionResult, WhatIfComparison } from '../../types';
import { api } from '../../services/api';

interface WhatIfSimulatorProps {
  originalResult: FlightPredictionResult;
  originalInputs: any;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  originalResult,
  originalInputs,
}) => {
  const [scenarioHour, setScenarioHour] = useState<number>(
    originalResult.sched_dep_hour <= 12 ? 18 : 8
  );
  const [scenarioWeather, setScenarioWeather] = useState<string>(
    originalInputs.weather_condition || 'Clear'
  );
  const [scenarioAirline, setScenarioAirline] = useState<string>(originalResult.airline);
  const [loading, setLoading] = useState<boolean>(false);
  const [comparison, setComparison] = useState<WhatIfComparison | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.simulateWhatIf({
        original: originalInputs,
        scenario_sched_dep_hour: scenarioHour,
        scenario_weather_condition: scenarioWeather,
        scenario_airline: scenarioAirline,
        scenario_model_key: originalResult.model_used,
      });
      setComparison(res);
    } catch (err: any) {
      setError(err.message || 'Simulation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-lavender/40 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-lg font-bold text-navy flex items-center gap-2">
            <Sliders className="w-5 h-5 text-lavender" /> What-If Flight Simulator
          </h3>
          <p className="text-xs text-content-muted mt-0.5">
            Evaluate alternative departure hours, weather dynamics, or carrier switches with trained ML pipelines.
          </p>
        </div>
        <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-lavender-light text-lavender text-xs font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Counterfactual Modeling
        </span>
      </div>

      {/* Simulator Form Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-pale-surface/40 p-4 rounded-xl border border-lavender/30">
        {/* Hour Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-navy flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-royal" /> Scenario Departure Hour:
            </label>
            <span className="font-bold text-royal px-2 py-0.5 bg-white rounded border border-blue-200">
              {scenarioHour.toString().padStart(2, '0')}:00
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={23}
            value={scenarioHour}
            onChange={(e) => setScenarioHour(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-royal"
          />
          <div className="flex justify-between text-[10px] text-content-subtle">
            <span>06:00 Morning</span>
            <span>14:00 Midday</span>
            <span>20:00 Evening</span>
          </div>
        </div>

        {/* Weather Scenario */}
        <div className="space-y-1.5">
          <label className="font-semibold text-navy text-xs flex items-center gap-1">
            <CloudSun className="w-3.5 h-3.5 text-amber" /> Weather Condition:
          </label>
          <select
            value={scenarioWeather}
            onChange={(e) => setScenarioWeather(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender/30 text-content-dark font-medium"
          >
            <option value="Clear">Clear Skies</option>
            <option value="Rain">Moderate Rain</option>
            <option value="Snow">Winter Snow</option>
            <option value="Thunderstorm">Severe Thunderstorm</option>
            <option value="Fog">Dense Fog / Low RVR</option>
            <option value="Windy">High Crosswinds</option>
          </select>
        </div>

        {/* Run Simulation Action Button */}
        <div className="flex items-end">
          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-royal to-lavender hover:opacity-95 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Scenario...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Recalculate Scenario
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
          {error}
        </div>
      )}

      {/* Comparison Results Card */}
      {comparison && (
        <div className="space-y-4 pt-2">
          {/* Side by side cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold uppercase text-content-muted block mb-1">
                Baseline Scheduled Flight
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-navy">
                  {comparison.original.sched_dep_hour.toString().padStart(2, '0')}:00 Departure
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    comparison.original.is_delayed
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {comparison.original.prediction_label}
                </span>
              </div>
              <div className="mt-3 flex justify-between text-xs text-content-muted border-t border-slate-200 pt-2">
                <span>Delay Prob: <strong>{(comparison.original.delay_probability * 100).toFixed(1)}%</strong></span>
                <span>Est Delay: <strong>{comparison.original.estimated_delay_minutes} min</strong></span>
              </div>
            </div>

            {/* Scenario Card */}
            <div className="p-4 rounded-xl bg-lavender-surface/60 border border-lavender/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold uppercase text-lavender block">
                  Simulated Alternative
                </span>
                <span className="text-[11px] text-content-muted">
                  {comparison.hour_difference > 0 ? `+${comparison.hour_difference}h later` : `${comparison.hour_difference}h earlier`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-navy">
                  {comparison.scenario.sched_dep_hour.toString().padStart(2, '0')}:00 ({scenarioWeather})
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    comparison.scenario.is_delayed
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {comparison.scenario.prediction_label}
                </span>
              </div>
              <div className="mt-3 flex justify-between text-xs text-content-muted border-t border-lavender/30 pt-2">
                <span>Delay Prob: <strong>{(comparison.scenario.delay_probability * 100).toFixed(1)}%</strong></span>
                <span>Est Delay: <strong>{comparison.scenario.estimated_delay_minutes} min</strong></span>
              </div>
            </div>
          </div>

          {/* Deltas & Dynamic Insight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-content-muted font-medium">Probability Shift:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  comparison.delay_probability_change < 0
                    ? 'text-teal'
                    : comparison.delay_probability_change > 0
                    ? 'text-amber-600'
                    : 'text-content-muted'
                }`}
              >
                {comparison.delay_probability_change < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                {(comparison.delay_probability_change * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-content-muted font-medium">Duration Variance:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  comparison.delay_minutes_change < 0
                    ? 'text-teal'
                    : comparison.delay_minutes_change > 0
                    ? 'text-amber-600'
                    : 'text-content-muted'
                }`}
              >
                {comparison.delay_minutes_change < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                {comparison.delay_minutes_change > 0 ? `+${comparison.delay_minutes_change}` : comparison.delay_minutes_change} mins
              </span>
            </div>
          </div>

          {/* Natural Language Summary Insight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-royal/5 to-lavender/10 border border-royal/20 text-xs text-navy flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-royal shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{comparison.summary_insight}</p>
          </div>
        </div>
      )}
    </div>
  );
};
