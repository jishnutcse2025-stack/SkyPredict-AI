import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PredictPage } from './pages/PredictPage';
import { ModelComparisonPage } from './pages/ModelComparisonPage';
import { RouteAnalyticsPage } from './pages/RouteAnalyticsPage';
import { PredictionHistoryPage } from './pages/PredictionHistoryPage';
import { ReportsPage } from './pages/ReportsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="predict" element={<PredictPage />} />
          <Route path="models" element={<ModelComparisonPage />} />
          <Route path="routes" element={<RouteAnalyticsPage />} />
          <Route path="history" element={<PredictionHistoryPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
