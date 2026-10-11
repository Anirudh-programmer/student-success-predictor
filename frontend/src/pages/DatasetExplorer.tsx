import React, { useState } from 'react';
import {
  Database,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Layers,
  Search
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import type { DatasetSummaryResponse, ModelInfoResponse } from '../types/api';

interface DatasetExplorerProps {
  datasetSummary: DatasetSummaryResponse | null;
  modelInfo: ModelInfoResponse | null;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  datasetSummary,
  modelInfo
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState<string>('All');
  const [involvementFilter, setInvolvementFilter] = useState<string>('All');

  const columns = datasetSummary?.columns || [];
  const sampleRows = datasetSummary?.sample_rows || [];

  const filteredColumns = columns.filter((col) =>
    col.column.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSampleRows = sampleRows.filter((row) => {
    if (schoolTypeFilter !== 'All' && row.School_Type !== schoolTypeFilter) return false;
    if (involvementFilter !== 'All' && row.Parental_Involvement !== involvementFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-[#E2E7E0]">
        <h2 className="text-xl font-bold tracking-tight text-[#102E27] m-0">
          Dataset Structure & Feature Dictionary
        </h2>
        <p className="text-xs text-[#66736D] mt-0.5 m-0">
          Exploring the 6,607 records and 20 features from <code className="bg-[#FAF9F5] text-[#173F35] px-1 py-0.5 rounded text-[11px] border border-[#EBE7DC]">StudentPerformanceFactors.csv</code> via real backend summaries.
        </p>
      </div>

      {/* Dataset Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Observations"
          value={datasetSummary ? datasetSummary.total_rows.toLocaleString() : '6,607'}
          unit="rows"
          subtitle="Empirical student records"
          badge={{ text: 'Zero Duplicates', variant: 'forest' }}
          icon={<Database className="w-5 h-5 text-[#173F35]" />}
        />
        <KPICard
          title="Feature Count"
          value={datasetSummary ? datasetSummary.total_columns : 20}
          unit="columns"
          subtitle="6 numerical + 13 categorical + 1 target"
          badge={{ text: '19 Input Features', variant: 'sage' }}
          icon={<Layers className="w-5 h-5 text-[#64866F]" />}
        />
        <KPICard
          title="Target Scale"
          value="55 - 101"
          unit="pts"
          subtitle="Continuous Exam_Score"
          badge={{ text: 'High boundary verified', variant: 'neutral' }}
          icon={<CheckCircle2 className="w-5 h-5 text-[#8A9791]" />}
        />
        <KPICard
          title="Target Mean"
          value={modelInfo ? modelInfo.observed_target_mean.toFixed(2) : '67.24'}
          unit="pts"
          subtitle="Std dev: ±3.89 pts"
          badge={{ text: 'Median: 67.0', variant: 'gold' }}
          icon={<FileSpreadsheet className="w-5 h-5 text-[#C6A96B]" />}
        />
      </div>

      {/* Feature Dictionary & Schema Table */}
      <div className="bg-white rounded-2xl border border-[#E2E7E0] p-5 sm:p-6 shadow-2xs card-hover-lift space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F2EE]">
          <div>
            <h3 className="font-bold text-sm text-[#102E27] tracking-tight m-0">
              Feature Metadata & Data Integrity Audit
            </h3>
            <p className="text-xs text-[#66736D] mt-0.5 m-0">
              Complete inventory of the 20 attributes with missing rates and unique value cardinality.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8A9791] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search feature names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E2E7E0] bg-white text-[#202D29] placeholder-[#8A9791] focus:outline-hidden focus:ring-2 focus:ring-[#173F35]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E7E0] bg-[#FAF9F5] text-[#52605A] font-bold">
                <th className="py-2.5 px-3">Column Name</th>
                <th className="py-2.5 px-3">Data Type</th>
                <th className="py-2.5 px-3">Missing Values</th>
                <th className="py-2.5 px-3">Cardinality</th>
                <th className="py-2.5 px-3">Sample Observed Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2EE]">
              {filteredColumns.map((col) => (
                <tr key={col.column} className="hover:bg-[#FAF9F5]/70">
                  <td className="py-2.5 px-3 font-semibold text-[#102E27]">
                    {col.column}
                    {col.column === 'Exam_Score' && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#FAF6EC] text-[#8A6D2D] border border-[#EADFC7]">
                        TARGET
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        col.type === 'numerical'
                          ? 'bg-[#E6EEE5] text-[#173F35] border-[#CCDCCB]'
                          : 'bg-[#F0F4EF] text-[#3B5B44] border-[#DCE4DB]'
                      }`}
                    >
                      {col.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#52605A] font-tabular">
                    {col.missing_count > 0 ? (
                      <span className="text-[#92400E] font-medium">
                        {col.missing_count} ({col.missing_pct}%)
                      </span>
                    ) : (
                      <span className="text-[#8A9791]">0 (0%)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#52605A] font-tabular">
                    {col.unique_count} distinct
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#66736D] truncate max-w-xs">
                    {col.sample_values.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Preview Section (Real rows via FastAPI) */}
      <div className="bg-white rounded-2xl border border-[#E2E7E0] p-5 sm:p-6 shadow-2xs card-hover-lift space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F2EE]">
          <div>
            <h3 className="font-bold text-sm text-[#102E27] tracking-tight m-0">
              Representative Student Records Preview (Live API Sample)
            </h3>
            <p className="text-xs text-[#66736D] mt-0.5 m-0">
              Fetched dynamically via backend <code className="text-[11px] bg-[#FAF9F5] px-1 py-0.5 rounded border border-[#EBE7DC]">GET /api/v1/dataset-summary</code> to avoid exposing the raw 6,607-row CSV in the client bundle.
            </p>
          </div>

          {/* Interactive Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#64866F]" />
            <select
              value={schoolTypeFilter}
              onChange={(e) => setSchoolTypeFilter(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-[#E2E7E0] bg-white text-[#202D29] focus:outline-hidden focus:ring-1 focus:ring-[#173F35]"
            >
              <option value="All">School: All</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
            <select
              value={involvementFilter}
              onChange={(e) => setInvolvementFilter(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-[#E2E7E0] bg-white text-[#202D29] focus:outline-hidden focus:ring-1 focus:ring-[#173F35]"
            >
              <option value="All">Parental: All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E7E0] bg-[#FAF9F5] text-[#52605A] font-bold">
                <th className="py-2 px-2.5">#</th>
                <th className="py-2 px-2.5">Hours Studied</th>
                <th className="py-2 px-2.5">Attendance</th>
                <th className="py-2 px-2.5">Sleep Hours</th>
                <th className="py-2 px-2.5">Prev Score</th>
                <th className="py-2 px-2.5">Tutoring</th>
                <th className="py-2 px-2.5">Parental Inv.</th>
                <th className="py-2 px-2.5">Resources</th>
                <th className="py-2 px-2.5">School Type</th>
                <th className="py-2 px-2.5 bg-[#EAF4EC] text-[#173F35] font-bold">Exam Score (Target)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2EE] font-mono">
              {filteredSampleRows.slice(0, 15).map((row, idx) => (
                <tr key={idx} className="hover:bg-[#FAF9F5]/70 text-[#202D29]">
                  <td className="py-2 px-2.5 text-[#8A9791] font-tabular">{idx + 1}</td>
                  <td className="py-2 px-2.5 font-tabular">{row.Hours_Studied} hrs</td>
                  <td className="py-2 px-2.5 font-tabular">{row.Attendance}%</td>
                  <td className="py-2 px-2.5 font-tabular">{row.Sleep_Hours} hrs</td>
                  <td className="py-2 px-2.5 font-tabular">{row.Previous_Scores} pts</td>
                  <td className="py-2 px-2.5 font-tabular">{row.Tutoring_Sessions}</td>
                  <td className="py-2 px-2.5 font-sans">{row.Parental_Involvement}</td>
                  <td className="py-2 px-2.5 font-sans">{row.Access_to_Resources}</td>
                  <td className="py-2 px-2.5 font-sans">{row.School_Type}</td>
                  <td className="py-2 px-2.5 bg-[#EAF4EC]/60 text-[#102E27] font-bold font-tabular">
                    {row.Exam_Score} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture & Security Notice */}
      <div className="bg-[#FAF9F5] border border-[#EBE7DC] rounded-xl p-4 text-xs text-[#52605A] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#173F35] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#102E27] m-0">
            Privacy & Production Architecture Note
          </p>
          <p className="leading-relaxed m-0">
            In compliance with production data governance, the complete 6,607-row raw dataset is not bundled inside the client-side JavaScript bundle. 
            All feature statistics, cardinality summaries, and preview samples are served on-demand by FastAPI endpoints. 
            If full-table server-side pagination, sorting, or CSV export is required, a dedicated backend pagination endpoint can be connected.
          </p>
        </div>
      </div>
    </div>
  );
};
