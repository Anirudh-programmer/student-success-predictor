import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  LineChart,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export type NavTab = 'overview' | 'predict' | 'insights' | 'dataset';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isModelReady: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isModelReady,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      description: 'Cohort metrics & distributions',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'predict' as NavTab,
      label: 'Predict Student Score',
      description: '19-factor academic inference',
      icon: <GraduationCap className="w-4 h-4" />
    },
    {
      id: 'insights' as NavTab,
      label: 'Model Insights',
      description: 'Permutation importance & tests',
      icon: <LineChart className="w-4 h-4" />
    },
    {
      id: 'dataset' as NavTab,
      label: 'Dataset Explorer',
      description: 'Feature schema & samples',
      icon: <Database className="w-4 h-4" />
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-[#0A1D18]/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gradient-to-b from-[#102E27] via-[#12332B] to-[#0E2922] text-white flex flex-col border-r border-[#1B443A] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1D4A3E]/70 bg-[#0F2A23]/60">
          <BrandLogo size={36} variant="full" theme="dark" />
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#163D34] text-[10px] font-semibold text-[#B5CCC0] border border-[#235347]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6A96B] animate-pulse"></span>
            IBM SkillsBuild • ML & Applied AI
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#799487] mb-2">
            Intelligence Navigation
          </p>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#1C4D40] text-white shadow-xs border border-[#2B6858]'
                    : 'text-[#B0C4B8] hover:bg-[#163D34] hover:text-white'
                }`}
              >
                <span className={`transition-colors ${isActive ? 'text-[#E0C994]' : 'text-[#819E90]'}`}>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="leading-tight font-semibold">{item.label}</div>
                  <div
                    className={`text-[10px] truncate transition-colors ${
                      isActive ? 'text-[#C7DDD1]' : 'text-[#7D9B8D]'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Empirical Evidence Spotlight & Benchmark Card */}
          <div className="pt-3 pb-2 px-1">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#143D32] to-[#0E2922] border border-[#235848] p-3 text-white space-y-2.5 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.35)] group transition-all duration-200 hover:border-[#2D735F]">
              {/* Subtle top ambient sheen */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#86EFAC]/40 to-transparent"></div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3BDB0] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4B87A] animate-pulse"></span>
                  Key Empirical Levers
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1A4B3D] text-[#86EFAC] border border-[#235F4E]">
                  Top Impact
                </span>
              </div>

              {/* Proportional Impact Levers */}
              <div className="space-y-1.5 text-[11px]">
                {/* 1. Attendance */}
                <div className="p-2 rounded-lg bg-[#0D261F]/70 border border-[#194437] space-y-1 transition-colors hover:bg-[#113128]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#C7DCD1] font-medium text-[11px]">1. Attendance Rate</span>
                    <span className="font-bold text-[#86EFAC] font-tabular">+2.34 MAE</span>
                  </div>
                  <div className="w-full h-1 bg-[#173F33] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#64866F] to-[#86EFAC] rounded-full w-full"></div>
                  </div>
                </div>

                {/* 2. Hours Studied */}
                <div className="p-2 rounded-lg bg-[#0D261F]/70 border border-[#194437] space-y-1 transition-colors hover:bg-[#113128]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#C7DCD1] font-medium text-[11px]">2. Hours Studied</span>
                    <span className="font-bold text-[#86EFAC] font-tabular">+1.70 MAE</span>
                  </div>
                  <div className="w-full h-1 bg-[#173F33] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#64866F] to-[#86EFAC] rounded-full w-[73%]"></div>
                  </div>
                </div>

                {/* 3. Resource Access */}
                <div className="p-2 rounded-lg bg-[#0D261F]/70 border border-[#194437] space-y-1 transition-colors hover:bg-[#113128]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#C7DCD1] font-medium text-[11px]">3. Resource Access</span>
                    <span className="font-bold text-[#D4B87A] font-tabular">+0.55 MAE</span>
                  </div>
                  <div className="w-full h-1 bg-[#173F33] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#A38A52] to-[#D4B87A] rounded-full w-[24%]"></div>
                  </div>
                </div>
              </div>

              {/* Cohort Footprint Pill */}
              <div className="flex items-center justify-between text-[10px] text-[#7A988A] pt-1.5 border-t border-[#1C473A]">
                <span>Cohort Baseline:</span>
                <span className="font-semibold text-white font-tabular">6,607 students (67.2 pts mean)</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom Model Status */}
        <div className="p-4 border-t border-[#1B443A] bg-[#0C241F] text-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold text-[#8DAA9B]">Inference Engine</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                isModelReady
                  ? 'bg-[#153F32] text-[#86EFAC] border-[#20634E]'
                  : 'bg-[#3B1717] text-[#FCA5A5] border-[#5A2525]'
              }`}
            >
              {isModelReady ? (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5" /> Online
                </>
              ) : (
                <>
                  <AlertCircle className="w-2.5 h-2.5" /> Degraded
                </>
              )}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#7D9B8D]">Algorithm:</span>
              <span className="font-semibold text-white">Ridge (α=7.85)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7D9B8D]">Held-out MAE:</span>
              <span className="font-semibold text-[#86EFAC] font-tabular">±0.4523 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7D9B8D]">Test R²:</span>
              <span className="font-semibold text-[#D4B87A] font-tabular">0.7697</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
