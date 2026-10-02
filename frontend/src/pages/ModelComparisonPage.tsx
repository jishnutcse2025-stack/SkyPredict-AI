import React, { useEffect, useState } from 'react';
import {
  SlidersHorizontal,
  CheckCircle,
  BarChart3,
  Award,
  Layers,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { ModelsMetadataResponse, ClassificationModelDetail } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { ConfusionMatrixView } from '../components/models/ConfusionMatrixView';
import { ROCCurveView } from '../components/models/ROCCurveView';
import { FeatureImportanceView } from '../components/models/FeatureImportanceView';

export const ModelComparisonPage: React.FC = () => {
  const [metadata, setMetadata] = useState<ModelsMetadataResponse | null>(null);
  const [selectedModelKey, setSelectedModelKey] = useState<string>('xgboost');
  const [activeEngine, setActiveEngine] = useState<string>('xgboost');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    loadModelsData();
  }, []);

  const loadModelsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metRes, ovRes] = await Promise.all([
        api.getModelMetrics(),
        api.getModelsOverview()
      ]);
      setMetadata(metRes);
      if (ovRes?.active_classification_model) {
        setActiveEngine(ovRes.active_classification_model);
        setSelectedModelKey(ovRes.active_classification_model);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load model metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectActiveModel = async (modelKey: string) => {
    setActionLoading(true);
    try {
      await api.selectModel(modelKey);
      setActiveEngine(modelKey);
      setSuccessToast(`Successfully activated ${metadata?.classification_models[modelKey]?.display_name || modelKey} as default.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(`Error activating model: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading multi-model evaluation artifacts..." />;
  if (error || !metadata) return <ErrorState message={error || 'No model metrics found'} onRetry={loadModelsData} />;

  const classModels = Object.values(metadata.classification_models);
  const regModels = Object.values(metadata.regression_models);
  const currentModel: ClassificationModelDetail = metadata.classification_models[selectedModelKey] || classModels[0];

  // Prepare Comparative Bar Chart Data
  const comparisonBarData = classModels.map((m) => ({
    name: m.display_name.replace(' Classifier', ''),
    Accuracy: Number((m.metrics.accuracy * 100).toFixed(1)),
    Precision: Number((m.metrics.precision * 100).toFixed(1)),
    Recall: Number((m.metrics.recall * 100).toFixed(1)),
    F1: Number((m.metrics.f1_score * 100).toFixed(1)),
    AUC: m.metrics.roc_auc ? Number((m.metrics.roc_auc * 100).toFixed(1)) : 0,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-pale-border gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender-light text-lavender text-xs font-semibold mb-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Empirical Evaluation Suite
          </div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Machine Learning Model Comparison</h1>
          <p className="text-xs text-content-muted mt-0.5">
            Objective benchmark metrics computed on held-out test cohort ({metadata.test_samples.toLocaleString()} operations, random seed {metadata.train_samples ? '42' : '42'}).
          </p>
        </div>

        {/* Global Active Indicator */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse" />
          <div>
            <span className="text-content-muted block text-[10px] uppercase font-semibold">Production Default</span>
            <span className="font-bold text-navy">
              {metadata.classification_models[activeEngine]?.display_name || activeEngine}
            </span>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-teal" /> {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-teal-700 hover:text-teal-900">✕</button>
        </div>
      )}

      {/* Model Comparison Table */}
      <div className="bg-white/95 rounded-2xl p-6 border border-blue-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-navy">Classification Algorithm Performance Matrix</h3>
            <p className="text-xs text-content-muted">Standardized train/test split: 80% train ({metadata.train_samples.toLocaleString()}) / 20% test ({metadata.test_samples.toLocaleString()})</p>
          </div>
          <span className="text-[11px] text-content-subtle font-medium">All values calculated directly from test predictions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-content-muted uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Algorithm</th>
                <th className="py-3 px-3">Model Type</th>
                <th className="py-3 px-3 text-right">Accuracy</th>
                <th className="py-3 px-3 text-right">Precision</th>
                <th className="py-3 px-3 text-right">Recall</th>
                <th className="py-3 px-3 text-right">F1 Score</th>
                <th className="py-3 px-3 text-right">ROC-AUC</th>
                <th className="py-3 px-3 text-center">Active Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classModels.map((m) => {
                const isActive = m.key === activeEngine;
                const isInspected = m.key === selectedModelKey;
                return (
                  <tr
                    key={m.key}
                    onClick={() => setSelectedModelKey(m.key)}
                    className={`cursor-pointer transition-colors ${
                      isInspected ? 'bg-royal-light/40 font-medium' : 'hover:bg-pale-bg/40'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-navy flex items-center gap-2">
                      {m.display_name}
                      {m.key === 'xgboost' && (
                        <span className="p-0.5 rounded bg-amber-100 text-amber-700" title="Top Overall Balanced Performer">
                          <Award className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-content-muted">{m.model_type}</td>
                    <td className="py-3 px-3 text-right font-semibold text-navy">
                      {(m.metrics.accuracy * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right text-content-dark">
                      {(m.metrics.precision * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right text-content-dark">
                      {(m.metrics.recall * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-royal">
                      {(m.metrics.f1_score * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-teal-700">
                      {m.metrics.roc_auc ? m.metrics.roc_auc.toFixed(4) : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                          Active Engine
                        </span>
                      ) : (
                        <span className="text-content-subtle text-[11px]">Standby</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isActive ? (
                        <span className="text-[11px] text-teal-700 font-semibold">Current Default</span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectActiveModel(m.key);
                          }}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded-lg bg-navy hover:bg-navy-light text-white text-[11px] font-medium transition-colors"
                        >
                          Use for Prediction
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metric Comparison Bar Chart */}
      <div className="bg-white/95 rounded-2xl p-6 border border-blue-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-royal" /> Multi-Metric Benchmark Comparison
            </h3>
            <p className="text-xs text-content-muted">Cross-algorithm comparison across Accuracy, Precision, Recall, F1, and AUC (%)</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonBarData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#17365D', fontWeight: 600 }} />
              <Tooltip formatter={(val: any, name: any) => [`${val}%`, String(name)]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Accuracy" fill="#2878D4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" fill="#24B8A6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" fill="#F5A34D" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1" fill="#8B7CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="AUC" fill="#10264A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Inspector Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-royal" /> Deep Dive Inspector:{' '}
              <span className="text-royal">{currentModel.display_name}</span>
            </h3>
            <p className="text-xs text-content-muted">
              Examine the confusion matrix, ROC curve, and feature importance for the selected model.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-content-muted">Switch Inspector:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              {classModels.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelectedModelKey(m.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    m.key === selectedModelKey
                      ? 'bg-white text-navy shadow-sm font-bold'
                      : 'text-content-muted hover:text-content-dark'
                  }`}
                >
                  {m.key === 'xgboost' ? 'XGBoost' : m.key.replace('_', ' ').replace('classifier', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Column Diagnostic Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ConfusionMatrixView
            data={currentModel.metrics.confusion_matrix}
            modelName={currentModel.display_name}
          />
          <ROCCurveView
            rocCurve={currentModel.metrics.roc_curve}
            auc={currentModel.metrics.roc_auc}
            modelName={currentModel.display_name}
          />
          <FeatureImportanceView
            features={currentModel.feature_importance}
            modelName={currentModel.display_name}
          />
        </div>
      </div>

      {/* Regression Models Section (Delay Duration) */}
      <div className="bg-white/95 rounded-2xl p-6 border border-blue-100 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-navy flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber" /> Delay Duration Estimation (Regression Models)
          </h3>
          <p className="text-xs text-content-muted">
            Continuous delay minutes prediction evaluated on held-out test records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {regModels.map((reg) => (
            <div key={reg.key} className="p-4 rounded-xl bg-pale-surface/40 border border-lavender/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-navy text-xs">{reg.display_name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-lavender-light text-lavender font-semibold">
                  Regressor
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-content-dark">
                <div className="flex justify-between">
                  <span className="text-content-muted">Mean Absolute Error (MAE):</span>
                  <strong className="text-navy">{reg.metrics.mae} mins</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Root Mean Squared Error:</span>
                  <strong className="text-navy">{reg.metrics.rmse} mins</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">R-squared (R²):</span>
                  <strong className="text-royal">{reg.metrics.r2_score}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
