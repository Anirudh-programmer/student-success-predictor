import React from 'react';
import {
  Users,
  Target,
  Award,
  CheckCircle2,
  ArrowUpRight,
  Info,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { ResponsibleAIDisclaimer } from '../components/ResponsibleAIDisclaimer';
import { BrandLogo } from '../components/BrandLogo';
import type {
  ModelInfoResponse,
  DistributionResponse,
  FeatureImportanceResponse
} from '../types/api';

interface OverviewProps {
  modelInfo: ModelInfoResponse | null;
  distribution: DistributionResponse | null;
  featureImportance: FeatureImportanceResponse | null;
  onNavigateToPredict: () => void;
  onNavigateToInsights: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  modelInfo,
  distribution,
  featureImportance,
  onNavigateToPredict,
  onNavigateToInsights
}) => {
  const topFeatures = featureImportance?.features?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Luminous Ivory & Sage Hero Composition */}
      <div className="relative overflow-hidden rounded-2xl border border-[#DCE5DB] bg-gradient-to-br from-[#FAF8F2] via-[#F4F7F2] to-[#E9F2E8] p-6 sm:p-8 shadow-2xs">
        {/* Subtle decorative botanical ambient glow in corner */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#E2EDE0]/60 blur-3xl"></div>
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-[#FAF0DC]/50 blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            {/* Brand Signature Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#173F35] text-xs font-semibold border border-[#D2DDD0] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A96B]" />
              <span>Veridian Student Success Intelligence • IBM SkillsBuild</span>
            </div>

            <div className="flex items-center gap-3">
              <BrandLogo size={36} variant="icon" theme="light" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#102E27] m-0">
                Understand progress. Encourage potential.
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-[#4E5C56] leading-relaxed m-0">
              Equipping educators and students with evidence-based intelligence across 6,607 authentic records 
              to identify learning opportunities early, reinforce study habits, and build confident paths to achievement.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onNavigateToPredict}
              className="px-5 py-3 rounded-xl bg-[#173F35] hover:bg-[#102E27] text-white text-xs font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-2 border border-[#173F35]"
            >
              Predict Student Score
              <ArrowUpRight className="w-4 h-4 text-[#D4B87A]" />
            </button>
            <button
              onClick={onNavigateToInsights}
              className="px-4 py-3 rounded-xl bg-white/90 hover:bg-white text-[#173F35] text-xs font-semibold border border-[#D0DCD0] shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
            >
              Explore Model Insights
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Cohort Observations"
          value={modelInfo ? modelInfo.dataset_size.toLocaleString() : '6,607'}
          unit="students"
          subtitle="Genuine institutional records"
          badge={{ text: '80/20 Train-Test Split', variant: 'neutral' }}
          icon={<Users className="w-5 h-5 text-[#64866F]" />}
        />
        <KPICard
          title="Cohort Mean Score"
          value={modelInfo ? modelInfo.observed_target_mean.toFixed(1) : '67.2'}
          unit="pts"
          subtitle={`Observed range: ${modelInfo?.observed_target_min || 55} - ${modelInfo?.observed_target_max || 101}`}
          badge={{ text: 'Scale: 55 to 101 pts', variant: 'sage' }}
          icon={<Target className="w-5 h-5 text-[#173F35]" />}
        />
        <KPICard
          title="Held-out Test MAE"
          value={modelInfo ? `±${modelInfo.evaluation_metrics.held_out_test_mae.toFixed(4)}` : '±0.4523'}
          unit="pts"
          subtitle="Mean absolute error on test set"
          badge={{ text: '+83.98% vs Baseline', variant: 'forest' }}
          icon={<Award className="w-5 h-5 text-[#173F35]" />}
        />
        <KPICard
          title="Held-out Test R²"
          value={modelInfo ? modelInfo.evaluation_metrics.held_out_test_r2.toFixed(4) : '0.7697'}
          unit=""
          subtitle="Variance explained (not accuracy)"
          badge={{ text: 'Tuned Ridge Model', variant: 'gold' }}
          icon={<CheckCircle2 className="w-5 h-5 text-[#C6A96B]" />}
        />
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E7E0] p-5 sm:p-6 shadow-2xs card-hover-lift flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F0F2EE]">
              <div>
                <h3 className="font-bold text-sm text-[#102E27] tracking-tight m-0">
                  Exam Score Cohort Distribution
                </h3>
                <p className="text-xs text-[#66736D] mt-0.5 m-0">
                  Distribution of final examination scores across all 6,607 students in the dataset (55 to 101 points)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#66736D]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#64866F]"></span>
                  Student Frequency
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#C6A96B]"></span>
                  Cohort Mean (67.24)
                </span>
              </div>
            </div>

            <div className="h-72 w-full mt-4">
              {distribution && distribution.bins ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution.bins} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2EE" />
                    <XAxis
                      dataKey="bin_range"
                      tick={{ fill: '#66736D', fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      interval={1}
                    />
                    <YAxis tick={{ fill: '#66736D', fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-[#102E27] text-white text-xs rounded-xl p-3 shadow-lg border border-[#1E4E42]">
                              <p className="font-bold text-[#E0C994]">Score Range: {item.bin_range} pts</p>
                              <p className="mt-1 text-[#E5EFE9]">Count: <span className="font-bold text-white font-tabular">{item.count.toLocaleString()}</span> students</p>
                              <p className="text-[#A2BAAD]">Share: <span className="font-tabular">{item.percentage}%</span> of cohort</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      x="67-69"
                      stroke="#C6A96B"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      label={{
                        value: 'Cohort Mean (67.24)',
                        position: 'top',
                        fill: '#8A6D2D',
                        fontSize: 10,
                        fontWeight: 700
                      }}
                    />
                    <Bar dataKey="count" fill="#64866F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#8A9791]">
                  Loading score distribution from FastAPI...
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0F2EE] flex flex-wrap items-center justify-between gap-3 text-xs text-[#66736D]">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#64866F]" />
              Continuous bell-curve distribution with verified right boundary observation (1 student scored 101 pts).
            </span>
            <span className="font-semibold text-[#102E27] font-tabular">
              Std Dev: ±3.89 pts • IQR: 5.0 pts
            </span>
          </div>
        </div>

        {/* Feature Importance Preview Card */}
        <div className="bg-white rounded-2xl border border-[#E2E7E0] p-5 sm:p-6 shadow-2xs card-hover-lift flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2EE]">
              <div>
                <h3 className="font-bold text-sm text-[#102E27] tracking-tight m-0">
                  Top Predictive Drivers
                </h3>
                <p className="text-xs text-[#66736D] mt-0.5 m-0">
                  Permutation test MAE degradation impact
                </p>
              </div>
              <button
                onClick={onNavigateToInsights}
                className="text-[#173F35] hover:text-[#102E27] text-xs font-semibold cursor-pointer underline decoration-[#8BA894]"
              >
                All 19 &rarr;
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {topFeatures.map((feat, idx) => {
                const maxVal = topFeatures[0]?.importance_mae_increase || 2.5;
                const pct = Math.min(100, Math.max(5, (feat.importance_mae_increase / maxVal) * 100));
                return (
                  <div key={feat.feature} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#202D29] flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#8A9791] w-3.5">{idx + 1}.</span>
                        {feat.feature.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#173F35] font-tabular">
                        +{feat.importance_mae_increase.toFixed(4)} MAE
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F0F2EE] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#173F35] to-[#64866F] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#F0F2EE] text-[11px] text-[#66736D] leading-normal">
            Attendance and Hours Studied account for over 85% of total predictive power on the held-out test evaluation.
          </div>
        </div>
      </div>

      {/* Model Specification & Architecture Overview */}
      <div className="bg-white rounded-2xl border border-[#E2E7E0] p-5 sm:p-6 shadow-2xs">
        <h3 className="font-bold text-sm text-[#102E27] tracking-tight mb-3 m-0">
          Model Specification & Training Integrity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EBE7DC] space-y-1.5">
            <p className="font-bold text-[#102E27] m-0">Selected Architecture</p>
            <p className="text-[#52605A] leading-relaxed m-0">
              Tuned Ridge Regression (L2 regularization α=7.8476). Selected over Linear Regression, Random Forest, and Gradient Boosting through 5-fold cross-validation on the training set.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EBE7DC] space-y-1.5">
            <p className="font-bold text-[#102E27] m-0">Data Preprocessing Pipeline</p>
            <p className="text-[#52605A] leading-relaxed m-0">
              Median imputation & StandardScaler for 6 numerical features; most-frequent imputation & OneHotEncoder for 13 categorical features. Fitted strictly on training set to prevent data leakage.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EBE7DC] space-y-1.5">
            <p className="font-bold text-[#102E27] m-0">Evaluation Rigor</p>
            <p className="text-[#52605A] leading-relaxed m-0">
              Generalization gap is only 0.0461 MAE between train (0.4984) and test (0.4523), confirming strong regularized generalization with zero overfitting.
            </p>
          </div>
        </div>
      </div>

      {/* Responsible AI Disclaimer */}
      <ResponsibleAIDisclaimer />
    </div>
  );
};
