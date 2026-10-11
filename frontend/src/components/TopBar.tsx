import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import type { NavTab } from './Sidebar';

interface TopBarProps {
  activeTab: NavTab;
  onOpenMobile: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isModelReady: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onOpenMobile,
  onRefresh,
  isRefreshing,
  isModelReady
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Academic Analytics & Cohort Benchmarks',
      subtitle: 'Verified score distributions, evaluation metrics, and institutional baseline indicators'
    },
    predict: {
      title: 'Student Success Scoring Engine',
      subtitle: 'Multi-pillar inference using 19 academic, behavioral, and environmental indicators'
    },
    insights: {
      title: 'Model Evaluation & Explainability',
      subtitle: 'Held-out test benchmarks, error distribution, and permutation feature importance'
    },
    dataset: {
      title: 'Dataset Architecture & Feature Dictionary',
      subtitle: 'Empirical data distributions, feature dictionary, and representative sample audits'
    }
  };

  const { title, subtitle } = titles[activeTab];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#E2E7E0] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 -ml-2 rounded-lg text-[#66736D] hover:text-[#202D29] hover:bg-[#F7F5EF] lg:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#102E27] tracking-tight m-0">{title}</h2>
          <p className="text-xs text-[#66736D] hidden sm:block m-0">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Connection Status Pill */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${
          isModelReady
            ? 'bg-[#EBF4EA] text-[#1E5136] border-[#CCE0CA]'
            : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isModelReady ? 'bg-[#1E5136] animate-pulse' : 'bg-[#991B1B]'}`}></span>
          <span>{isModelReady ? 'FastAPI Online' : 'Backend Degraded'}</span>
        </div>

        {/* Refresh / Sync Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCE4DB] bg-white hover:bg-[#F2F6F0] text-[#173F35] text-xs font-semibold shadow-2xs hover:shadow-xs transition-all duration-200 disabled:opacity-50 cursor-pointer"
          title="Refresh data from FastAPI"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#64866F] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
        </button>
      </div>
    </header>
  );
};
