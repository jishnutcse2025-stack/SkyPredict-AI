/**
 * SkyPredict AI - Resilient Frontend API Client Service
 * Connects seamlessly via Vite proxy (/api) with automatic fallback to direct backend
 * (http://127.0.0.1:8000/api or http://localhost:8000/api).
 */

import {
  DashboardData,
  FlightPredictionResult,
  WhatIfComparison,
  ModelsMetadataResponse,
  RouteInsightsData,
  HistoryQueryResponse,
  PredictionHistoryItem
} from '../types';

// Determine candidate base URLs
const getCandidateBases = (): string[] => {
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase) {
    return [envBase.replace(/\/$/, '')];
  }
  // Try relative proxy first, then direct local endpoints
  return [
    '/api',
    'http://127.0.0.1:8000/api',
    'http://localhost:8000/api'
  ];
};

/**
 * Executes a resilient API request across candidate base URLs.
 */
async function requestApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const candidates = getCandidateBases();
  let lastError: Error = new Error('No candidate base URLs configured');

  for (const base of candidates) {
    const url = `${base}${cleanEndpoint}`;
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...(options.headers || {})
        }
      });

      // If response is successful, parse JSON
      if (res.ok) {
        return await res.json();
      }

      // If backend returned a JSON error payload (e.g. 400, 404, 422), extract detail
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await res.json().catch(() => null);
        const detail = errorData?.detail || `HTTP ${res.status}: ${res.statusText}`;
        // If it's a real backend 4xx error (validation, not found), don't retry other bases
        if (res.status >= 400 && res.status < 500) {
          throw new Error(detail);
        }
        lastError = new Error(detail);
      } else {
        lastError = new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      // If proxy returned 502 / 504 / 500, attempt direct fallback
    } catch (err: any) {
      lastError = err;
      // Continue to next candidate URL
    }
  }

  throw lastError;
}

export const api = {
  // 1. Health
  async getHealth() {
    return requestApi<any>('/health');
  },

  // 2. Dashboard
  async getDashboard(): Promise<DashboardData> {
    return requestApi<DashboardData>('/dashboard');
  },

  // 3. Predictions
  async predictFlight(payload: {
    airline: string;
    origin: string;
    dest: string;
    flight_date: string;
    sched_dep_hour: number;
    flight_number?: string;
    weather_condition?: string;
    temp_c?: number;
    wind_speed_kts?: number;
    visibility_miles?: number;
    model_key?: string;
  }): Promise<FlightPredictionResult> {
    return requestApi<FlightPredictionResult>('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // 4. What-If Simulator
  async simulateWhatIf(payload: {
    original: any;
    scenario_sched_dep_hour: number;
    scenario_weather_condition?: string;
    scenario_airline?: string;
    scenario_model_key?: string;
  }): Promise<WhatIfComparison> {
    return requestApi<WhatIfComparison>('/predict/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // 5. Models & Evaluation Metrics
  async getModelsOverview() {
    return requestApi<any>('/models');
  },

  async getModelMetrics(): Promise<ModelsMetadataResponse> {
    return requestApi<ModelsMetadataResponse>('/models/metrics');
  },

  async selectModel(modelKey: string) {
    return requestApi<any>('/models/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_key: modelKey }),
    });
  },

  // 6. Route Analytics
  async getRouteAnalytics(params?: { origin?: string; dest?: string; airline?: string }): Promise<RouteInsightsData> {
    const query = new URLSearchParams();
    if (params?.origin) query.append('origin', params.origin);
    if (params?.dest) query.append('dest', params.dest);
    if (params?.airline) query.append('airline', params.airline);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return requestApi<RouteInsightsData>(`/analytics/routes${qs}`);
  },

  // 7. Prediction History
  async getHistory(params?: {
    origin?: string;
    dest?: string;
    airline?: string;
    is_delayed?: boolean;
    model_used?: string;
    limit?: number;
    offset?: number;
  }): Promise<HistoryQueryResponse> {
    const query = new URLSearchParams();
    if (params?.origin) query.append('origin', params.origin);
    if (params?.dest) query.append('dest', params.dest);
    if (params?.airline) query.append('airline', params.airline);
    if (params?.is_delayed !== undefined) query.append('is_delayed', String(params.is_delayed));
    if (params?.model_used) query.append('model_used', params.model_used);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return requestApi<HistoryQueryResponse>(`/history${qs}`);
  },

  async getHistoryItem(id: string): Promise<PredictionHistoryItem> {
    return requestApi<PredictionHistoryItem>(`/history/${id}`);
  },

  async deleteHistoryItem(id: string) {
    return requestApi<any>(`/history/${id}`, { method: 'DELETE' });
  },

  async reconcileHistoryItem(id: string, payload: { actual_delay_min: number; actual_outcome: string }) {
    return requestApi<any>(`/history/${id}/reconcile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // 8. Reports
  async getReportSummary(params: { report_type: string; origin?: string; dest?: string }) {
    const query = new URLSearchParams();
    query.append('report_type', params.report_type);
    if (params.origin) query.append('origin', params.origin);
    if (params.dest) query.append('dest', params.dest);
    return requestApi<any>(`/reports/summary?${query.toString()}`);
  },

  async downloadPdfReport(payload: {
    report_type: string;
    title?: string;
    route_origin?: string;
    route_dest?: string;
    prediction_id?: string;
    model_key?: string;
    include_disclaimer?: boolean;
  }) {
    const candidates = getCandidateBases();
    let blob: Blob | null = null;

    for (const base of candidates) {
      try {
        const res = await fetch(`${base}/reports/pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          blob = await res.blob();
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (!blob) {
      throw new Error('Failed to generate PDF report from any endpoint');
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkyPredict_Report_${payload.report_type}_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  downloadCsvUrl(dataType: 'history' | 'routes') {
    // Return relative URL by default, or direct backend
    return `/api/reports/csv?data_type=${dataType}`;
  }
};
