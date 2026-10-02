import React from 'react';
import { ConfusionMatrixData } from '../../types';

interface ConfusionMatrixViewProps {
  data: ConfusionMatrixData;
  modelName: string;
}

export const ConfusionMatrixView: React.FC<ConfusionMatrixViewProps> = ({ data, modelName }) => {
  const { true_negatives, false_positives, false_negatives, true_positives, total_tested } = data;

  const tnPct = ((true_negatives / total_tested) * 100).toFixed(1);
  const fpPct = ((false_positives / total_tested) * 100).toFixed(1);
  const fnPct = ((false_negatives / total_tested) * 100).toFixed(1);
  const tpPct = ((true_positives / total_tested) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-navy">Confusion Matrix Analysis</h4>
          <p className="text-xs text-content-muted">
            Evaluated on held-out test cohort: <strong>{total_tested.toLocaleString()}</strong> verified flights
          </p>
        </div>
        <span className="text-[11px] font-semibold text-royal px-2.5 py-0.5 rounded-full bg-royal-light">
          {modelName}
        </span>
      </div>

      {/* 2x2 Matrix Grid */}
      <div className="relative pt-6 pl-8">
        {/* Top Header Label (Predicted) */}
        <div className="absolute top-0 left-28 text-center text-xs font-bold text-navy uppercase tracking-wider">
          Predicted Condition
        </div>

        {/* Left Side Label (Actual) */}
        <div className="absolute left-0 top-24 -rotate-90 -translate-x-4 text-xs font-bold text-navy uppercase tracking-wider">
          Actual
        </div>

        {/* Column Subheaders */}
        <div className="grid grid-cols-2 gap-3 mb-2 text-center text-xs font-semibold text-content-muted">
          <span>Predicted On-Time (0)</span>
          <span>Predicted Delayed (1)</span>
        </div>

        {/* Matrix Cells */}
        <div className="grid grid-cols-2 gap-3">
          {/* True Negative */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-center flex flex-col justify-center">
            <span className="text-xs text-teal-800 font-semibold">True Negative (TN)</span>
            <span className="text-2xl font-bold text-teal-900 mt-1">{true_negatives.toLocaleString()}</span>
            <span className="text-[11px] text-teal-700 mt-0.5">{tnPct}% of test set</span>
          </div>

          {/* False Positive (Type I Error) */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center flex flex-col justify-center">
            <span className="text-xs text-amber-800 font-semibold">False Positive (FP)</span>
            <span className="text-2xl font-bold text-amber-900 mt-1">{false_positives.toLocaleString()}</span>
            <span className="text-[11px] text-amber-700 mt-0.5">{fpPct}% (Type I Error)</span>
          </div>

          {/* False Negative (Type II Error) */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center flex flex-col justify-center">
            <span className="text-xs text-red-800 font-semibold">False Negative (FN)</span>
            <span className="text-2xl font-bold text-red-900 mt-1">{false_negatives.toLocaleString()}</span>
            <span className="text-[11px] text-red-700 mt-0.5">{fnPct}% (Missed Delays)</span>
          </div>

          {/* True Positive */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-center flex flex-col justify-center">
            <span className="text-xs text-teal-800 font-semibold">True Positive (TP)</span>
            <span className="text-2xl font-bold text-teal-900 mt-1">{true_positives.toLocaleString()}</span>
            <span className="text-[11px] text-teal-700 mt-0.5">{tpPct}% of test set</span>
          </div>
        </div>
      </div>
    </div>
  );
};
