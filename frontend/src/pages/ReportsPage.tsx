import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle,
  RefreshCw,
  Compass,
  SlidersHorizontal,
  Layers,
  Plane,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingState } from '../components/common/LoadingState';

const AIRPORTS = ['ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'JFK', 'SFO', 'SEA', 'MIA', 'BOS', 'MCO', 'CLT'];

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<string>('overall');
  const [routeOrigin, setRouteOrigin] = useState<string>('ATL');
  const [routeDest, setRouteDest] = useState<string>('ORD');
  const [includeDisclaimer, setIncludeDisclaimer] = useState<boolean>(true);

  const [summaryData, setSummaryData] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummaryPreview();
  }, [reportType, routeOrigin, routeDest]);

  const fetchSummaryPreview = async () => {
    setLoadingSummary(true);
    setError(null);
    try {
      const res = await api.getReportSummary({
        report_type: reportType,
        origin: reportType === 'route' ? routeOrigin : undefined,
        dest: reportType === 'route' ? routeDest : undefined,
      });
      setSummaryData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load report summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfGenerating(true);
    try {
      await api.downloadPdfReport({
        report_type: reportType,
        title: `SkyPredict AI ${reportType.replace('_', ' ').toUpperCase()} Intelligence Report`,
        route_origin: reportType === 'route' ? routeOrigin : undefined,
        route_dest: reportType === 'route' ? routeDest : undefined,
        include_disclaimer: includeDisclaimer,
      });
    } catch (err: any) {
      alert(`PDF Generation Error: ${err.message}`);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleDownloadCsv = (type: 'history' | 'routes') => {
    window.location.href = api.downloadCsvUrl(type);
  };

  const reportCategories = [
    {
      id: 'overall',
      title: 'Historical Aviation Operations Report',
      desc: 'Complete statistical synthesis of all analyzed flights, delay distributions, root cause taxonomies, and carrier punctuality rankings.',
      icon: Layers,
      color: 'text-royal'
    },
    {
      id: 'route',
      title: 'Corridor Route Intelligence Report',
      desc: 'Deep-dive analysis of a specific origin-to-destination flight corridor, peak congestion hours, and historical delay frequencies.',
      icon: Compass,
      color: 'text-teal'
    },
    {
      id: 'model_evaluation',
      title: 'Machine Learning Benchmark Report',
      desc: 'Technical algorithmic evaluation including cross-model accuracy, precision, recall, F1, ROC-AUC, and delay regression error metrics.',
      icon: SlidersHorizontal,
      color: 'text-lavender'
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-pale-border gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-light text-royal text-xs font-semibold mb-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Automated Report Generation
          </div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Intelligence & Operations Reports</h1>
          <p className="text-xs text-content-muted mt-0.5">
            Download production-ready PDF documentation compiled by ReportLab with complete audit statistics and methodology notes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white/95 rounded-2xl p-6 border border-blue-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-navy">Select Report Template</h3>
            <p className="text-xs text-content-muted">Choose your analytics domain and parameters</p>
          </div>

          {/* Template Selection Radio Cards */}
          <div className="space-y-3">
            {reportCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = reportType === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setReportType(cat.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-royal-light/30 border-royal ring-1 ring-royal shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-white border border-slate-200 ${cat.color} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy text-xs">{cat.title}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-royal" />}
                      </div>
                      <p className="text-[11px] text-content-muted mt-1 leading-snug">{cat.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conditional Route Filter Options */}
          {reportType === 'route' && (
            <div className="p-4 rounded-xl bg-pale-bg border border-blue-100 space-y-3 text-xs">
              <span className="font-semibold text-navy block">Configure Corridor:</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-content-muted mb-1 font-medium">Origin</label>
                  <select
                    value={routeOrigin}
                    onChange={(e) => setRouteOrigin(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-navy font-semibold"
                  >
                    {AIRPORTS.map((a) => (
                      <option key={a} value={a} disabled={a === routeDest}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-content-muted mb-1 font-medium">Destination</label>
                  <select
                    value={routeDest}
                    onChange={(e) => setRouteDest(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-navy font-semibold"
                  >
                    {AIRPORTS.map((a) => (
                      <option key={a} value={a} disabled={a === routeOrigin}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Include Methodology Disclaimer Option */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="disclaimer-chk"
              checked={includeDisclaimer}
              onChange={(e) => setIncludeDisclaimer(e.target.checked)}
              className="w-4 h-4 rounded text-royal focus:ring-royal/30 accent-royal cursor-pointer"
            />
            <label htmlFor="disclaimer-chk" className="text-xs text-content-muted cursor-pointer font-medium">
              Include FAA / DOT methodology and statistical limitations disclosure
            </label>
          </div>

          {/* Download Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleDownloadPdf}
              disabled={pdfGenerating}
              className="w-full py-3 px-4 rounded-xl bg-royal hover:bg-royal-hover text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {pdfGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Compiling Document via ReportLab...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download Official PDF Report
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDownloadCsv('history')}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-content-dark font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-royal" /> Export History CSV
              </button>
              <button
                onClick={() => handleDownloadCsv('routes')}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-content-dark font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-teal" /> Export Routes CSV
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Report Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white/95 rounded-2xl p-6 border border-blue-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] text-content-muted uppercase tracking-wider font-semibold">
                Live Document Synthesis
              </span>
              <h3 className="text-base font-bold text-navy">Report Metadata & Executive Preview</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-content-muted text-[11px] font-semibold">
              PDF Spec v2.4
            </span>
          </div>

          {loadingSummary ? (
            <LoadingState message="Generating document preview..." />
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {error}
            </div>
          ) : summaryData ? (
            <div className="space-y-5 text-xs">
              {/* Highlight summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-pale-bg border border-blue-100">
                  <span className="text-content-muted block text-[11px]">Analyzed Operations</span>
                  <span className="text-base font-bold text-navy">{summaryData.total_samples.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-pale-bg border border-blue-100">
                  <span className="text-content-muted block text-[11px]">Delay Incidence</span>
                  <span className="text-base font-bold text-amber-700">{summaryData.summary_metrics.delay_rate_pct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-pale-bg border border-blue-100">
                  <span className="text-content-muted block text-[11px]">Mean Delay</span>
                  <span className="text-base font-bold text-navy">{summaryData.summary_metrics.average_delay_minutes}m</span>
                </div>
                <div className="p-3 rounded-xl bg-pale-bg border border-blue-100">
                  <span className="text-content-muted block text-[11px]">On-Time Record</span>
                  <span className="text-base font-bold text-teal-700">
                    {(100 - summaryData.summary_metrics.delay_rate_pct).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Dynamic Highlights List */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h4 className="font-bold text-navy flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal" /> Generated Executive Findings
                </h4>
                <div className="space-y-2">
                  {summaryData.preview_highlights.map((h: string, idx: number) => (
                    <p key={idx} className="flex items-start gap-2 text-content-dark font-medium leading-relaxed">
                      <span className="text-royal font-bold">•</span>
                      <span>{h}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Report Structure Notice */}
              <div className="p-4 rounded-xl bg-pale-surface/50 border border-lavender/30 text-content-muted space-y-1.5">
                <h4 className="font-bold text-navy">Included Document Sections in PDF:</h4>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>SkyPredict AI official aviation header, timestamp and system metadata</li>
                  <li>Executive operations overview and verified delay benchmarks</li>
                  <li>Comparative multi-algorithm evaluation matrix (Accuracy, F1, ROC-AUC)</li>
                  <li>Detailed corridor friction metrics or root cause taxonomy</li>
                  <li>Methodology disclosure and non-causal statistical disclaimers</li>
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
