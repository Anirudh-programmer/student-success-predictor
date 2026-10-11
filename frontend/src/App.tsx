import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from './lib/api';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ConnectionBanner } from './components/ConnectionBanner';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { Overview } from './pages/Overview';
import { Predict } from './pages/Predict';
import { ModelInsights } from './pages/ModelInsights';
import { DatasetExplorer } from './pages/DatasetExplorer';
import type {
  ModelInfoResponse,
  DistributionResponse,
  FeatureImportanceResponse,
  MetricsResponse,
  DatasetSummaryResponse
} from './types/api';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  // API State
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [distribution, setDistribution] = useState<DistributionResponse | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportanceResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [datasetSummary, setDatasetSummary] = useState<DatasetSummaryResponse | null>(null);

  const [isModelReady, setIsModelReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    setApiError(null);

    try {
      // First check health
      const health = await api.getHealth();
      setIsModelReady(health.model_ready);

      // Fetch all required data concurrently
      const [infoRes, distRes, featRes, metricsRes, datasetRes] = await Promise.all([
        api.getModelInfo(),
        api.getDistribution(),
        api.getFeatureImportance(),
        api.getMetrics(),
        api.getDatasetSummary()
      ]);

      setModelInfo(infoRes);
      setDistribution(distRes);
      setFeatureImportance(featRes);
      setMetrics(metricsRes);
      setDatasetSummary(datasetRes);
      setIsModelReady(true);
      setApiError(null);
    } catch (err) {
      setIsModelReady(false);
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        const msg = err instanceof Error ? err.message : 'Unknown communication error';
        setApiError(`Failed to load model resources from FastAPI backend: ${msg}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#202D29] flex">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isModelReady={isModelReady}
        isOpenMobile={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Slim Top Bar */}
        <TopBar
          activeTab={activeTab}
          onOpenMobile={() => setMobileOpen(true)}
          onRefresh={() => loadData(true)}
          isRefreshing={refreshing}
          isModelReady={isModelReady}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* Connection error banner if API is unreachable */}
          {apiError && (
            <ConnectionBanner
              error={apiError}
              onRetry={() => loadData(false)}
              isRetrying={loading || refreshing}
            />
          )}

          {/* Initial Loading Skeleton */}
          {loading && !modelInfo ? (
            <LoadingSkeleton rows={5} />
          ) : (
            <>
              {activeTab === 'overview' && (
                <Overview
                  modelInfo={modelInfo}
                  distribution={distribution}
                  featureImportance={featureImportance}
                  onNavigateToPredict={() => setActiveTab('predict')}
                  onNavigateToInsights={() => setActiveTab('insights')}
                />
              )}

              {activeTab === 'predict' && (
                <Predict modelInfo={modelInfo} />
              )}

              {activeTab === 'insights' && (
                <ModelInsights
                  metrics={metrics}
                  featureImportance={featureImportance}
                  modelInfo={modelInfo}
                />
              )}

              {activeTab === 'dataset' && (
                <DatasetExplorer
                  datasetSummary={datasetSummary}
                  modelInfo={modelInfo}
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#E2E7E0] bg-white py-4 px-6 text-center text-xs text-[#66736D]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              <strong className="text-[#102E27]">Student Success Predictor</strong> — Veridian Student Success Intelligence • IBM SkillsBuild – AICTE–BharatCares Machine Learning & Applied AI Internship
            </span>
            <span className="text-[11px] text-[#8A9791] font-mono">
              FastAPI + React 19 + TypeScript + Vite + Tailwind CSS
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
