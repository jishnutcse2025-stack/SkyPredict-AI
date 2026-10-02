import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { ROCCurvePoint } from '../../types';

interface ROCCurveViewProps {
  rocCurve: ROCCurvePoint[];
  auc: number | null;
  modelName: string;
}

export const ROCCurveView: React.FC<ROCCurveViewProps> = ({ rocCurve, auc, modelName }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-navy">Receiver Operating Characteristic (ROC)</h4>
          <p className="text-xs text-content-muted">True Positive Rate vs. False Positive Rate</p>
        </div>
        <div className="px-3 py-1 rounded-lg bg-royal/10 border border-royal/20 text-xs font-bold text-royal">
          AUC-ROC: {auc !== null ? auc.toFixed(4) : 'N/A'}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rocCurve} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="fpr"
              domain={[0, 1]}
              type="number"
              tickFormatter={(v) => v.toFixed(1)}
              label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#5A6E85' }}
              tick={{ fontSize: 10, fill: '#5A6E85' }}
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v) => v.toFixed(1)}
              label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 10, fill: '#5A6E85' }}
              tick={{ fontSize: 10, fill: '#5A6E85' }}
            />
            <Tooltip
              formatter={(value: any) => [
                typeof value === 'number' ? value.toFixed(4) : value,
                'True Positive Rate'
              ]}
              labelFormatter={(label) => `FPR: ${Number(label).toFixed(4)}`}
            />
            {/* Reference Random Baseline Diagonal Line */}
            <ReferenceLine
              segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
              stroke="#CBD5E1"
              strokeDasharray="4 4"
              label={{ value: 'Random Guess (AUC=0.50)', fill: '#94A3B8', fontSize: 9 }}
            />
            {/* Model ROC Curve */}
            <Line
              type="monotone"
              dataKey="tpr"
              stroke="#2878D4"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#10264A' }}
              activeDot={{ r: 5, fill: '#2878D4' }}
              name="tpr"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-content-subtle italic text-center">
        Higher curve arc toward upper left reflects stronger discriminatory capability across varying classification thresholds.
      </p>
    </div>
  );
};
