/**
 * SkyPredict AI - TypeScript Domain Interfaces
 */

export interface FeatureContribution {
  feature: string;
  display_name: string;
  input_value: string;
  contribution_score: number;
  importance_pct: number;
  direction: 'increases_delay_risk' | 'supports_on_time';
}

export interface FlightPredictionResult {
  prediction_id?: string;
  flight_number: string;
  airline: string;
  airline_name: string;
  origin: string;
  origin_city: string;
  dest: string;
  dest_city: string;
  flight_date: string;
  sched_dep_hour: number;
  distance_miles: number;
  prediction_label: 'Likely Delayed' | 'Likely On-Time';
  is_delayed: boolean;
  delay_probability: number;
  estimated_delay_minutes: number;
  risk_level: 'Low' | 'Moderate' | 'High';
  model_used: string;
  contributions: FeatureContribution[];
  disclaimer: string;
}

export interface WhatIfComparison {
  original: FlightPredictionResult;
  scenario: FlightPredictionResult;
  hour_difference: number;
  delay_probability_change: number;
  delay_minutes_change: number;
  summary_insight: string;
}

export interface ConfusionMatrixData {
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
  true_positives: number;
  matrix: number[][];
  total_tested: number;
}

export interface ROCCurvePoint {
  fpr: number;
  tpr: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface ClassificationMetrics {
  model_key: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number | null;
  confusion_matrix: ConfusionMatrixData;
  roc_curve: ROCCurvePoint[];
}

export interface ClassificationModelDetail {
  key: string;
  display_name: string;
  model_type: string;
  metrics: ClassificationMetrics;
  feature_importance: FeatureImportanceItem[];
  artifact_path: string;
}

export interface RegressionModelDetail {
  key: string;
  display_name: string;
  metrics: {
    model_key: string;
    mae: number;
    rmse: number;
    r2_score: number;
  };
  artifact_path: string;
}

export interface ModelsMetadataResponse {
  trained_at: string;
  dataset_records: number;
  train_samples: number;
  test_samples: number;
  default_classification_model: string;
  default_regression_model: string;
  classification_models: Record<string, ClassificationModelDetail>;
  regression_models: Record<string, RegressionModelDetail>;
}

export interface DashboardStats {
  total_flights_analyzed: number;
  delayed_flights: number;
  on_time_flights: number;
  delay_rate_pct: number;
  average_delay_minutes: number;
  dataset_type: string;
}

export interface HourlyDelayTrend {
  hour: number;
  hour_label: string;
  total_flights: number;
  delayed_flights: number;
  delay_rate_pct: number;
  avg_delay_min: number;
}

export interface AirlineDelayStat {
  airline: string;
  airline_name: string;
  total_flights: number;
  delayed_flights: number;
  delay_rate_pct: number;
  avg_delay_min: number;
}

export interface RouteDelayStat {
  origin: string;
  dest: string;
  route: string;
  total_flights: number;
  delayed_flights: number;
  delay_rate_pct: number;
  avg_delay_min: number;
  distance_miles: number;
}

export interface DelayCauseBreakdown {
  cause: string;
  flights: number;
  pct: number;
  avg_minutes: number;
}

export interface DashboardData {
  stats: DashboardStats;
  hourly_trends: HourlyDelayTrend[];
  airline_delays: AirlineDelayStat[];
  top_delayed_routes: RouteDelayStat[];
  delay_causes: DelayCauseBreakdown[];
  recent_predictions: PredictionHistoryItem[];
}

export interface RouteInsightsData {
  route_stats: RouteDelayStat[];
  origin_stats: Array<{
    airport: string;
    total_flights: number;
    delayed_flights: number;
    delay_rate_pct: number;
    avg_delay_min: number;
  }>;
  dest_stats: Array<{
    airport: string;
    total_flights: number;
    delayed_flights: number;
    delay_rate_pct: number;
    avg_delay_min: number;
  }>;
  dataset_avg_delay_rate: number;
  dataset_avg_delay_min: number;
  insights: string[];
}

export interface PredictionHistoryItem {
  id: string;
  flight_number: string;
  airline: string;
  airline_name?: string;
  origin: string;
  origin_city?: string;
  dest: string;
  dest_city?: string;
  flight_date: string;
  sched_dep_hour: number;
  day_of_week?: number;
  month?: number;
  weather_condition: string;
  distance_miles: number;
  prediction_label: 'Likely Delayed' | 'Likely On-Time';
  is_delayed: boolean;
  delay_probability: number;
  estimated_delay_minutes: number;
  risk_level: string;
  model_used: string;
  contributions: FeatureContribution[];
  actual_delay_min?: number | null;
  actual_outcome?: string | null;
  evaluation_status?: string;
  created_at: string;
}

export interface HistoryQueryResponse {
  total: number;
  offset: number;
  limit: number;
  items: PredictionHistoryItem[];
}
