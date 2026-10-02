import React, { useState } from 'react';
import {
  PlaneTakeoff,
  Calendar,
  Clock,
  CloudSun,
  Send,
  RefreshCw,
  Sliders,
  ShieldCheck,
  MapPin,
  Building
} from 'lucide-react';
import { api } from '../services/api';
import { FlightPredictionResult } from '../types';
import { PredictionResultPanel } from '../components/predict/PredictionResultPanel';
import { WhatIfSimulator } from '../components/predict/WhatIfSimulator';

const AIRPORTS = [
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta (ATL)', city: 'Atlanta, GA' },
  { code: 'ORD', name: "Chicago O'Hare (ORD)", city: 'Chicago, IL' },
  { code: 'DFW', name: 'Dallas/Fort Worth (DFW)', city: 'Dallas, TX' },
  { code: 'DEN', name: 'Denver International (DEN)', city: 'Denver, CO' },
  { code: 'LAX', name: 'Los Angeles International (LAX)', city: 'Los Angeles, CA' },
  { code: 'JFK', name: 'New York JFK (JFK)', city: 'New York, NY' },
  { code: 'SFO', name: 'San Francisco International (SFO)', city: 'San Francisco, CA' },
  { code: 'SEA', name: 'Seattle-Tacoma (SEA)', city: 'Seattle, WA' },
  { code: 'MIA', name: 'Miami International (MIA)', city: 'Miami, FL' },
  { code: 'BOS', name: 'Boston Logan (BOS)', city: 'Boston, MA' },
  { code: 'MCO', name: 'Orlando International (MCO)', city: 'Orlando, FL' },
  { code: 'CLT', name: 'Charlotte Douglas (CLT)', city: 'Charlotte, NC' },
];

const AIRLINES = [
  { code: 'DL', name: 'Delta Air Lines (DL)' },
  { code: 'AA', name: 'American Airlines (AA)' },
  { code: 'UA', name: 'United Airlines (UA)' },
  { code: 'WN', name: 'Southwest Airlines (WN)' },
  { code: 'B6', name: 'JetBlue Airways (B6)' },
  { code: 'AS', name: 'Alaska Airlines (AS)' },
  { code: 'NK', name: 'Spirit Airlines (NK)' },
];

export const PredictPage: React.FC = () => {
  // Form State
  const [origin, setOrigin] = useState<string>('ATL');
  const [dest, setDest] = useState<string>('ORD');
  const [airline, setAirline] = useState<string>('DL');
  const [flightDate, setFlightDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [schedDepHour, setSchedDepHour] = useState<number>(17);
  const [flightNumber, setFlightNumber] = useState<string>('DL1480');
  const [weatherCondition, setWeatherCondition] = useState<string>('Clear');
  const [modelKey, setModelKey] = useState<string>('xgboost');

  // Request State
  const [loading, setLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<FlightPredictionResult | null>(null);
  const [lastSubmittedInputs, setLastSubmittedInputs] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Derived calendar info
  const dateObj = new Date(flightDate + 'T00:00:00');
  const dayName = isNaN(dateObj.getTime())
    ? 'Friday'
    : dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = isNaN(dateObj.getTime())
    ? 'July'
    : dateObj.toLocaleDateString('en-US', { month: 'long' });

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (origin === dest) {
      setError('Origin and Destination airports must be distinct.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      origin,
      dest,
      airline,
      flight_date: flightDate,
      sched_dep_hour: schedDepHour,
      flight_number: flightNumber.trim() || undefined,
      weather_condition: weatherCondition,
      model_key: modelKey,
    };

    try {
      const res = await api.predictFlight(payload);
      setPredictionResult(res);
      setLastSubmittedInputs(payload);
    } catch (err: any) {
      setError(err.message || 'Prediction failed. Please verify input fields.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(dest);
    setDest(temp);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-pale-border gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-light text-royal text-xs font-semibold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> High-Fidelity Machine Learning
          </div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Predict Flight Disruption & Delay</h1>
          <p className="text-xs text-content-muted mt-0.5">
            Evaluate departure delay propensity and expected minutes based on trained historical operational data.
          </p>
        </div>

        {/* Selected Model Indicator */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm text-xs">
          <Sliders className="w-4 h-4 text-royal" />
          <span className="text-content-muted">Evaluating Model:</span>
          <select
            value={modelKey}
            onChange={(e) => setModelKey(e.target.value)}
            className="font-bold text-navy bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="xgboost">XGBoost Classifier</option>
            <option value="random_forest">Random Forest Classifier</option>
            <option value="decision_tree">Decision Tree Classifier</option>
            <option value="logistic_regression">Logistic Regression</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Flight Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white/95 rounded-2xl p-6 border border-blue-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <PlaneTakeoff className="w-4 h-4 text-royal" /> Flight Operation Parameters
            </h3>
            <span className="text-[11px] text-content-subtle">Required Inputs</span>
          </div>

          <form onSubmit={handlePredict} className="space-y-4 text-xs">
            {/* Origin & Destination */}
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-content-dark block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-royal" /> Origin Airport (IATA)
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3 py-2 bg-pale-bg/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 font-medium text-navy"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code} disabled={a.code === dest}>
                      {a.name} - {a.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-content-muted text-[10px] font-semibold transition-colors"
                >
                  ⇅ Swap Airports
                </button>
              </div>

              <div>
                <label className="font-semibold text-content-dark block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-lavender" /> Destination Airport (IATA)
                </label>
                <select
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  className="w-full px-3 py-2 bg-pale-bg/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 font-medium text-navy"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code} disabled={a.code === origin}>
                      {a.name} - {a.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Carrier & Flight Number */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-content-dark block mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-teal" /> Airline Carrier
                </label>
                <select
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  className="w-full px-3 py-2 bg-pale-bg/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 font-medium text-navy"
                >
                  {AIRLINES.map((al) => (
                    <option key={al.code} value={al.code}>
                      {al.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-content-dark block mb-1">
                  Flight Number (Optional)
                </label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. AA1042"
                  className="w-full px-3 py-2 bg-pale-bg/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 font-medium text-navy placeholder:text-content-muted"
                />
              </div>
            </div>

            {/* Date & Departure Hour */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-content-dark block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-royal" /> Departure Date
                </label>
                <input
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="w-full px-3 py-2 bg-pale-bg/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 font-medium text-navy"
                />
              </div>

              <div>
                <label className="font-semibold text-content-dark block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-lavender" /> Scheduled Hour
                </label>
                <select
                  value={schedDepHour}
                  onChange={(e) => setSchedDepHour(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-pale-bg/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 font-medium text-navy"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, '0')}:00 {h >= 12 ? 'PM' : 'AM'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Auto-derived Date Indicators */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex justify-between text-[11px] text-content-muted">
              <span>Day: <strong className="text-navy">{dayName}</strong></span>
              <span>Month: <strong className="text-navy">{monthName}</strong></span>
              <span>Peak Window: <strong className="text-navy">{schedDepHour >= 16 && schedDepHour <= 20 ? 'Yes (Congested)' : 'Normal'}</strong></span>
            </div>

            {/* Weather Condition */}
            <div>
              <label className="font-semibold text-content-dark block mb-1 flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5 text-amber" /> Forecasted Weather Condition
              </label>
              <select
                value={weatherCondition}
                onChange={(e) => setWeatherCondition(e.target.value)}
                className="w-full px-3 py-2 bg-pale-bg/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 font-medium text-navy"
              >
                <option value="Clear">Clear / VFR Standard Conditions</option>
                <option value="Rain">Precipitation / Moderate Rain</option>
                <option value="Snow">Winter Freezing / Snow Conditions</option>
                <option value="Thunderstorm">Severe Convective Thunderstorms</option>
                <option value="Fog">Dense Fog / Low Visibility Runway</option>
                <option value="Windy">High Crosswinds (&gt; 25 kts)</option>
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                {error}
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-royal hover:bg-royal-hover text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating ML Pipeline...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Run Flight Delay Prediction
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Prediction Result Panel & What-If Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {predictionResult ? (
            <>
              {/* Primary Prediction Result */}
              <PredictionResultPanel result={predictionResult} />

              {/* What-If Simulator Section */}
              <WhatIfSimulator
                originalResult={predictionResult}
                originalInputs={lastSubmittedInputs}
              />
            </>
          ) : (
            <div className="bg-white/80 rounded-2xl p-12 border border-dashed border-blue-200 text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-16 h-16 rounded-2xl bg-royal-light text-royal flex items-center justify-center mb-4 shadow-sm">
                <PlaneTakeoff className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-navy">Ready for Flight Inference</h3>
              <p className="text-xs text-content-muted max-w-sm mt-1.5 leading-relaxed">
                Configure your origin, destination, carrier, and scheduled departure time to calculate real-time delay probability, duration estimates, and transparent SHAP explanations.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-content-muted">
                  Classification & Regression
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-content-muted">
                  SHAP Explainability
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-content-muted">
                  What-If Simulation
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
