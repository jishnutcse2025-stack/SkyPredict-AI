import React from 'react';
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
import { FeatureImportanceItem } from '../../types';

interface FeatureImportanceViewProps {
  features: FeatureImportanceItem[];
  modelName: string;
}

const formatFeatureName = (feat: string) => {
  const map: Record<string, string> = {
    sched_dep_hour: 'Departure Hour',
    weather_condition: 'Weather Dynamics',
    origin: 'Origin Airport Hub',
    dest: 'Destination Airspace',
    airline: 'Carrier Profile',
    wind_speed_kts: 'Wind Velocity',
    visibility_miles: 'Visibility Miles',
    distance_miles: 'Route Distance',
    day_of_week: 'Day of Week',
    month: 'Season / Month',
    temp_c: 'Temperature °C',
    sched_elapsed_min: 'Scheduled Duration'
  };
  return map[feat] || feat.replace(/_/g, ' ');
};

export const FeatureImportanceView: React.FC<FeatureImportanceViewProps> = ({ features, modelName }) => {
  const chartData = features.slice(0, 8).map((f) => ({
    name: formatFeatureName(f.feature),
    rawFeature: f.feature,
    pct: Number((f.importance * 100).toFixed(1)),
  }));

  const colors = ['#2878D4', '#8B7CF6', '#24B8A6', '#69B7FF', '#F5A34D', '#1B3B6F', '#6366F1', '#0EA5E9'];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-navy">Global Feature Importance</h4>
          <p className="text-xs text-content-muted">Relative Gini / information gain attribution</p>
        </div>
        <span className="text-[11px] font-semibold text-lavender px-2.5 py-0.5 rounded-full bg-lavender-light">
          {modelName}
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
            <XAxis type="number" unit="%" tick={{ fontSize: 10, fill: '#5A6E85' }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: '#17365D', fontWeight: 500 }}
              width={110}
            />
            <Tooltip
              formatter={(val: any) => [`${val}%`, 'Relative Weight']}
              labelStyle={{ color: '#10264A', fontWeight: 'bold' }}
            />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-content-subtle italic text-center">
        Identifies top predictive signals utilized across split nodes without causal imputation.
      </p>
    </div>
  );
};
