import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Home,
  Heart,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  TrendingUp,
  Award,
  Compass,
  Zap,
  Target,
  CalendarCheck,
  Activity
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type {
  PredictRequest,
  PredictResponse,
  ModelInfoResponse,
  ParentalInvolvement,
  AccessToResources,
  ExtracurricularActivities,
  MotivationLevel,
  InternetAccess,
  FamilyIncome,
  TeacherQuality,
  SchoolType,
  PeerInfluence,
  LearningDisabilities,
  ParentalEducationLevel,
  DistanceFromHome,
  Gender
} from '../types/api';

const DEFAULT_PREDICT_FORM: PredictRequest = {
  Hours_Studied: 20,
  Attendance: 80,
  Sleep_Hours: 7,
  Previous_Scores: 75,
  Tutoring_Sessions: 1,
  Physical_Activity: 3,
  Parental_Involvement: 'Medium',
  Access_to_Resources: 'Medium',
  Extracurricular_Activities: 'No',
  Motivation_Level: 'Medium',
  Internet_Access: 'Yes',
  Family_Income: 'Medium',
  Teacher_Quality: 'Medium',
  School_Type: 'Public',
  Peer_Influence: 'Neutral',
  Learning_Disabilities: 'No',
  Parental_Education_Level: 'College',
  Distance_from_Home: 'Moderate',
  Gender: 'Female'
};

const PRESET_PROFILES: Record<string, { label: string; description: string; values: PredictRequest }> = {
  high: {
    label: 'High Achiever Profile',
    description: 'Strong attendance & high revision hours',
    values: {
      Hours_Studied: 35,
      Attendance: 95,
      Sleep_Hours: 8,
      Previous_Scores: 90,
      Tutoring_Sessions: 3,
      Physical_Activity: 4,
      Parental_Involvement: 'High',
      Access_to_Resources: 'High',
      Extracurricular_Activities: 'Yes',
      Motivation_Level: 'High',
      Internet_Access: 'Yes',
      Family_Income: 'High',
      Teacher_Quality: 'High',
      School_Type: 'Public',
      Peer_Influence: 'Positive',
      Learning_Disabilities: 'No',
      Parental_Education_Level: 'Postgraduate',
      Distance_from_Home: 'Near',
      Gender: 'Female'
    }
  },
  average: {
    label: 'Cohort Average Profile',
    description: 'Median student habits across dataset',
    values: { ...DEFAULT_PREDICT_FORM }
  },
  support: {
    label: 'Growth Support Profile',
    description: 'Identifies opportunities for improvement',
    values: {
      Hours_Studied: 8,
      Attendance: 62,
      Sleep_Hours: 5,
      Previous_Scores: 55,
      Tutoring_Sessions: 0,
      Physical_Activity: 1,
      Parental_Involvement: 'Low',
      Access_to_Resources: 'Low',
      Extracurricular_Activities: 'No',
      Motivation_Level: 'Low',
      Internet_Access: 'No',
      Family_Income: 'Low',
      Teacher_Quality: 'Low',
      School_Type: 'Public',
      Peer_Influence: 'Negative',
      Learning_Disabilities: 'Yes',
      Parental_Education_Level: 'High School',
      Distance_from_Home: 'Far',
      Gender: 'Male'
    }
  }
};

interface PredictProps {
  modelInfo: ModelInfoResponse | null;
}

export const Predict: React.FC<PredictProps> = ({ modelInfo }) => {
  const [formData, setFormData] = useState<PredictRequest>(DEFAULT_PREDICT_FORM);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof PredictRequest, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyPreset = (key: string) => {
    if (PRESET_PROFILES[key]) {
      setFormData(PRESET_PROFILES[key].values);
      setError(null);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_PREDICT_FORM);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.predict(formData);
      setResult(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to execute prediction. Please verify that the FastAPI backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Supportive, non-judgmental standing badge styling
  const getReadinessBadge = (score: number) => {
    if (score >= 80) {
      return {
        badgeStyle: 'bg-[#EAF4EC] text-[#1E5136] border-[#BDE0CB]',
        badgeText: 'Exemplary Standing (High Readiness)'
      };
    }
    if (score >= 70) {
      return {
        badgeStyle: 'bg-[#E6EEE5] text-[#173F35] border-[#CCDCCB]',
        badgeText: 'Proficient Standing (On Track)'
      };
    }
    if (score >= 62) {
      return {
        badgeStyle: 'bg-[#FAF6EC] text-[#8C6D2B] border-[#EBDDBF]',
        badgeText: 'Steady Foundation (Targeted Guidance Beneficial)'
      };
    }
    // Encouraging growth phrasing without harsh alarming red
    return {
      badgeStyle: 'bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]',
      badgeText: 'Priority Growth Track (Proactive Mentorship Recommended)'
    };
  };

  // Notification when a what-if lever is applied
  const [appliedLeverNotice, setAppliedLeverNotice] = useState<string | null>(null);

  const handleApplyLever = (field: keyof PredictRequest, value: string | number, label: string) => {
    handleInputChange(field, value);
    setAppliedLeverNotice(`Applied: ${label}`);
    setTimeout(() => setAppliedLeverNotice(null), 3000);
  };

  // 1. Pillar Readiness Calculations from current formData
  const academicPillarScore = Math.min(100, Math.max(10, Math.round(
    ((formData.Hours_Studied / 40) * 0.35 +
     ((formData.Attendance - 60) / 40) * 0.40 +
     ((formData.Previous_Scores - 40) / 60) * 0.15 +
     (Math.min(formData.Tutoring_Sessions, 5) / 5) * 0.10) * 100
  )));

  const resourceMap: Record<string, number> = { Low: 35, Medium: 70, High: 100 };
  const envPillarScore = Math.min(100, Math.max(10, Math.round(
    ((resourceMap[formData.Access_to_Resources] || 70) * 0.35 +
     (resourceMap[formData.Teacher_Quality] || 70) * 0.35 +
     (formData.Internet_Access === 'Yes' ? 100 : 40) * 0.20 +
     (formData.Learning_Disabilities === 'No' ? 95 : 75) * 0.10)
  )));

  const sleepScore = formData.Sleep_Hours >= 7 && formData.Sleep_Hours <= 9 ? 100 : (formData.Sleep_Hours === 6 || formData.Sleep_Hours === 10 ? 80 : 55);
  const activityScore = Math.min(100, Math.round((formData.Physical_Activity / 5) * 100));
  const wellbeingPillarScore = Math.min(100, Math.max(10, Math.round(
    (sleepScore * 0.30 +
     activityScore * 0.20 +
     (resourceMap[formData.Motivation_Level] || 70) * 0.30 +
     (resourceMap[formData.Parental_Involvement] || 70) * 0.20)
  )));

  // 2. Cohort Percentile Estimate from predicted score
  const getCohortPercentile = (score: number) => {
    const z = (score - 67.24) / 3.89;
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (z > 0) p = 1 - p;
    return Math.min(99, Math.max(1, Math.round(p * 100)));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E7E0]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#102E27] m-0">
            Student Academic Pathway Planner
          </h2>
          <p className="text-xs text-[#66736D] mt-0.5 m-0">
            Simulate how academic habits, learning resources, and lifestyle factors combine to support exam achievement (Cohort Mean: {modelInfo?.observed_target_mean.toFixed(1) || '67.2'} pts).
          </p>
        </div>

        {/* Preset quick buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#66736D] font-medium hidden sm:inline">Quick presets:</span>
          {Object.entries(PRESET_PROFILES).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#DCE4DB] bg-white hover:bg-[#F2F6F0] text-[#173F35] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              title={item.description}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-[#66736D] hover:text-[#102E27] rounded-lg hover:bg-[#F2F6F0] transition-colors cursor-pointer"
            title="Reset to default form values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 text-[#991B1B] flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold m-0">Connection Request Notice</p>
            <p className="mt-0.5 text-[#B91C1C] m-0">{error}</p>
          </div>
        </div>
      )}

      {/* Form and Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (7 cols on desktop) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pillar 1: Academic Habits */}
            <div className="bg-white rounded-2xl border border-[#E2E7E0] p-5 sm:p-6 shadow-2xs card-hover-lift space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#F0F2EE]">
                <div className="p-1.5 rounded-lg bg-[#EBF3EA] text-[#173F35]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#102E27] m-0">
                    1. Academic Habits & Revision Commitment
                  </h3>
                  <p className="text-[11px] text-[#66736D] m-0">Direct learning engagement metrics with highest predictive impact</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Hours Studied */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <label className="font-semibold text-[#202D29]">Weekly Study Hours</label>
                    <span className="font-mono font-bold text-[#173F35] text-xs font-tabular">
                      {formData.Hours_Studied} hrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={formData.Hours_Studied}
                    onChange={(e) => handleInputChange('Hours_Studied', parseInt(e.target.value))}
                    className="w-full accent-[#173F35] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A9791] mt-0.5 font-medium">
                    <span>1 hr</span>
                    <span>Cohort mean: 20 hrs</span>
                    <span>50 hrs</span>
                  </div>
                </div>

                {/* Attendance */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <label className="font-semibold text-[#202D29]">Class Attendance %</label>
                    <span className="font-mono font-bold text-[#173F35] text-xs font-tabular">
                      {formData.Attendance}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={formData.Attendance}
                    onChange={(e) => handleInputChange('Attendance', parseInt(e.target.value))}
                    className="w-full accent-[#173F35] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A9791] mt-0.5 font-medium">
                    <span>50%</span>
                    <span>Cohort mean: 80%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Previous Scores */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <label className="font-semibold text-[#202D29]">Previous Benchmark Score</label>
                    <span className="font-mono font-bold text-[#173F35] text-xs font-tabular">
                      {formData.Previous_Scores} pts
                    </span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="100"
                    step="1"
                    value={formData.Previous_Scores}
                    onChange={(e) => handleInputChange('Previous_Scores', parseInt(e.target.value))}
                    className="w-full accent-[#173F35] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A9791] mt-0.5 font-medium">
                    <span>35 pts</span>
                    <span>Cohort mean: 75 pts</span>
                    <span>100 pts</span>
                  </div>
                </div>

                {/* Tutoring Sessions */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <label className="font-semibold text-[#202D29]">Tutoring Sessions / Month</label>
                    <span className="font-mono font-bold text-[#173F35] text-xs font-tabular">
                      {formData.Tutoring_Sessions} sessions
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={formData.Tutoring_Sessions}
                    onChange={(e) => handleInputChange('Tutoring_Sessions', parseInt(e.target.value))}
                    className="w-full accent-[#173F35] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A9791] mt-0.5 font-medium">
                    <span>0</span>
                    <span>Mean: 1.5</span>
                    <span>10 sessions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2: Learning Environment */}
            <div className="bg-white rounded-2xl border border-[#E2E7E0] p-5 sm:p-6 shadow-2xs card-hover-lift space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#F0F2EE]">
                <div className="p-1.5 rounded-lg bg-[#EBF3EA] text-[#64866F]">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#102E27] m-0">
                    2. Learning Environment & Campus Support
                  </h3>
                  <p className="text-[11px] text-[#66736D] m-0">Institutional infrastructure, faculty quality, and accessibility</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-1">
                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">Access to Resources</label>
                  <select
                    value={formData.Access_to_Resources}
                    onChange={(e) => handleInputChange('Access_to_Resources', e.target.value as AccessToResources)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">Teacher Quality</label>
                  <select
                    value={formData.Teacher_Quality}
                    onChange={(e) => handleInputChange('Teacher_Quality', e.target.value as TeacherQuality)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">Internet Connectivity</label>
                  <select
                    value={formData.Internet_Access}
                    onChange={(e) => handleInputChange('Internet_Access', e.target.value as InternetAccess)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">School Type</label>
                  <select
                    value={formData.School_Type}
                    onChange={(e) => handleInputChange('School_Type', e.target.value as SchoolType)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">Campus Proximity</label>
                  <select
                    value={formData.Distance_from_Home}
                    onChange={(e) => handleInputChange('Distance_from_Home', e.target.value as DistanceFromHome)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="Near">Near</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Far">Far</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">Identified Learning Need</label>
                  <select
                    value={formData.Learning_Disabilities}
                    onChange={(e) => handleInputChange('Learning_Disabilities', e.target.value as LearningDisabilities)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pillar 3: Personal & Social Context */}
            <div className="bg-white rounded-2xl border border-[#E2E7E0] p-5 sm:p-6 shadow-2xs card-hover-lift space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#F0F2EE]">
                <div className="p-1.5 rounded-lg bg-[#EBF3EA] text-[#64866F]">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#102E27] m-0">
                    3. Personal Wellbeing & Socioeconomic Context
                  </h3>
                  <p className="text-[11px] text-[#66736D] m-0">Rest, physical stamina, family encouragement, and motivation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Sleep Hours */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <label className="font-semibold text-[#202D29]">Nightly Sleep Duration</label>
                    <span className="font-mono font-bold text-[#173F35] text-xs font-tabular">
                      {formData.Sleep_Hours} hrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="1"
                    value={formData.Sleep_Hours}
                    onChange={(e) => handleInputChange('Sleep_Hours', parseInt(e.target.value))}
                    className="w-full accent-[#173F35] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A9791] mt-0.5 font-medium">
                    <span>3 hrs</span>
                    <span>Cohort mean: 7 hrs</span>
                    <span>12 hrs</span>
                  </div>
                </div>

                {/* Physical Activity */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <label className="font-semibold text-[#202D29]">Weekly Physical Activity</label>
                    <span className="font-mono font-bold text-[#173F35] text-xs font-tabular">
                      {formData.Physical_Activity} hrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={formData.Physical_Activity}
                    onChange={(e) => handleInputChange('Physical_Activity', parseInt(e.target.value))}
                    className="w-full accent-[#173F35] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A9791] mt-0.5 font-medium">
                    <span>0 hrs</span>
                    <span>Cohort mean: 3 hrs</span>
                    <span>8 hrs</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-1">
                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">Motivation Level</label>
                  <select
                    value={formData.Motivation_Level}
                    onChange={(e) => handleInputChange('Motivation_Level', e.target.value as MotivationLevel)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">Parental Involvement</label>
                  <select
                    value={formData.Parental_Involvement}
                    onChange={(e) => handleInputChange('Parental_Involvement', e.target.value as ParentalInvolvement)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">Parental Education</label>
                  <select
                    value={formData.Parental_Education_Level}
                    onChange={(e) => handleInputChange('Parental_Education_Level', e.target.value as ParentalEducationLevel)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="High School">High School</option>
                    <option value="College">College</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">Household Income</label>
                  <select
                    value={formData.Family_Income}
                    onChange={(e) => handleInputChange('Family_Income', e.target.value as FamilyIncome)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">Peer Influence</label>
                  <select
                    value={formData.Peer_Influence}
                    onChange={(e) => handleInputChange('Peer_Influence', e.target.value as PeerInfluence)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">Extracurriculars</label>
                  <select
                    value={formData.Extracurricular_Activities}
                    onChange={(e) => handleInputChange('Extracurricular_Activities', e.target.value as ExtracurricularActivities)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202D29] mb-1">Gender</label>
                  <select
                    value={formData.Gender}
                    onChange={(e) => handleInputChange('Gender', e.target.value as Gender)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DCE4DB] bg-white text-[#202D29] text-xs focus:ring-2 focus:ring-[#173F35] focus:outline-hidden"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#173F35] hover:bg-[#102E27] text-white font-bold text-sm shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Synthesizing Insights via Veridian Engine...
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 text-[#D4B87A]" />
                    Generate Prediction & Advisory Pathway
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Post-Prediction Analytics on Left: Cohort Benchmark & Action Roadmap */}
          {result && (
            <div className="space-y-5 pt-1 animate-fade-rise">
              {/* Cohort Standing & Percentile Position Card */}
              <div className="bg-white rounded-2xl border border-[#DCE5DB] p-5 shadow-2xs card-hover-lift space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#102E27] tracking-tight flex items-center gap-1.5 m-0">
                    <Target className="w-4 h-4 text-[#173F35]" />
                    Cohort Benchmark Standing
                  </h4>
                  <span className="text-[11px] font-bold text-[#1E5136] bg-[#EAF4EC] px-2 py-0.5 rounded-full border border-[#BDE0CB]">
                    {getCohortPercentile(result.predicted_score)}th Percentile
                  </span>
                </div>

                <p className="text-xs text-[#52605A] leading-relaxed m-0">
                  Based on empirical distribution of 6,607 authentic records, a score of <strong>{result.predicted_score.toFixed(1)} pts</strong> places this student in the <strong>Top {Math.max(1, 100 - getCohortPercentile(result.predicted_score))}%</strong> of the cohort.
                </p>

                {/* Multi-tier benchmark track */}
                <div className="space-y-1.5 pt-1">
                  <div className="grid grid-cols-4 gap-1 text-[10px] font-semibold text-center text-[#66736D]">
                    <span className="py-1 rounded bg-[#F8F9F7] border border-[#E8ECE6]">Foundation (&lt;63)</span>
                    <span className="py-1 rounded bg-[#F8F9F7] border border-[#E8ECE6]">Core (63-70)</span>
                    <span className="py-1 rounded bg-[#F8F9F7] border border-[#E8ECE6]">Proficient (71-79)</span>
                    <span className="py-1 rounded bg-[#EAF4EC] text-[#1E5136] border border-[#CDE5D4] font-bold">Honors (80+)</span>
                  </div>
                  <div className="relative w-full h-2 bg-[#E6EEE5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#64866F] to-[#173F35] rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, ((result.predicted_score - 55) / (101 - 55)) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#8A9791] font-tabular">
                    <span>Min: 55 pts</span>
                    <span>Cohort Mean: 67.24 pts</span>
                    <span>Max: 101 pts</span>
                  </div>
                </div>
              </div>

              {/* Actionable 30-Day Personalized Mentorship Roadmap */}
              <div className="bg-white rounded-2xl border border-[#DCE5DB] p-5 shadow-2xs card-hover-lift space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#102E27] tracking-tight flex items-center gap-1.5 m-0">
                    <CalendarCheck className="w-4 h-4 text-[#64866F]" />
                    30-Day Pathway Action Plan
                  </h4>
                  <span className="text-[10px] font-bold text-[#8A6D2D] bg-[#FAF6EC] px-2 py-0.5 rounded-full border border-[#EADFC7]">
                    Milestones
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Phase 1 */}
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EBE7DC] space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#102E27]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#173F35] text-white flex items-center justify-center text-[10px]">1</span>
                        Days 1–10: Routine & Attendance Lock-in
                      </span>
                      <span className="text-[10px] text-[#64866F] font-semibold">Immediate</span>
                    </div>
                    <p className="text-[11px] text-[#52605A] leading-relaxed m-0 pl-5.5">
                      Target 95%+ class presence. Establish a fixed daily revision block to eliminate study procrastination.
                    </p>
                  </div>

                  {/* Phase 2 */}
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EBE7DC] space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#102E27]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#205548] text-white flex items-center justify-center text-[10px]">2</span>
                        Days 11–20: Active Practice & Tutoring
                      </span>
                      <span className="text-[10px] text-[#64866F] font-semibold">Concept Depth</span>
                    </div>
                    <p className="text-[11px] text-[#52605A] leading-relaxed m-0 pl-5.5">
                      Review previous assessment errors with teachers or tutoring sessions. Shift from passive reading to active practice problems.
                    </p>
                  </div>

                  {/* Phase 3 */}
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EBE7DC] space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#102E27]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#64866F] text-white flex items-center justify-center text-[10px]">3</span>
                        Days 21–30: Stamina & Exam Simulation
                      </span>
                      <span className="text-[10px] text-[#64866F] font-semibold">Consolidation</span>
                    </div>
                    <p className="text-[11px] text-[#52605A] leading-relaxed m-0 pl-5.5">
                      Protect consistent 7–8 hours of restorative nightly sleep. Conduct timed practice tests to solidify confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Prediction Results Display (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-5">
          {result ? (
            <div className="bg-white rounded-2xl border-2 border-[#CCDCCE] p-6 shadow-xs card-hover-lift space-y-6 animate-fade-rise result-highlight">
              {/* Score Header */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#66736D]">
                    Estimated Performance Horizon
                  </span>
                  {(() => {
                    const { badgeStyle, badgeText } = getReadinessBadge(result.predicted_score);
                    return (
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${badgeStyle}`}>
                        {badgeText}
                      </span>
                    );
                  })()}
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight text-[#102E27] font-tabular">
                    {result.predicted_score.toFixed(1)}
                  </span>
                  <span className="text-base font-semibold text-[#66736D]">points</span>
                </div>

                {/* Delta vs cohort mean */}
                <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold">
                  {result.delta_vs_mean >= 0 ? (
                    <span className="text-[#1E5136] flex items-center gap-1.5 font-tabular bg-[#EAF4EC] px-2.5 py-1 rounded-md border border-[#CDE5D4]">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{result.delta_vs_mean.toFixed(2)} pts ahead of cohort mean ({result.cohort_mean.toFixed(2)})
                    </span>
                  ) : (
                    <span className="text-[#92400E] flex items-center gap-1.5 font-tabular bg-[#FEF3C7] px-2.5 py-1 rounded-md border border-[#FDE68A]">
                      <TrendingUp className="w-3.5 h-3.5 rotate-180" />
                      {Math.abs(result.delta_vs_mean).toFixed(2)} pts targeted growth to meet cohort mean ({result.cohort_mean.toFixed(2)})
                    </span>
                  )}
                </div>
              </div>

              {/* Benchmark Scale Bar */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#FAF9F5] to-[#F3F7F2] border border-[#E4EAE2] space-y-2">
                <div className="flex justify-between text-[11px] text-[#66736D] font-medium font-tabular">
                  <span>Min: 55 pts</span>
                  <span className="text-[#8A6D2D] font-bold">Cohort Mean: 67.24 pts</span>
                  <span>Max: 101 pts</span>
                </div>
                <div className="relative w-full h-3 bg-[#E6EEE5] rounded-full overflow-hidden">
                  {/* Mean marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-[#C6A96B] z-10"
                    style={{ left: `${((67.24 - 55) / (101 - 55)) * 100}%` }}
                    title="Cohort Mean: 67.24"
                  ></div>
                  {/* Score bar */}
                  <div
                    className="h-full bg-gradient-to-r from-[#64866F] to-[#173F35] rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((result.predicted_score - 55) / (101 - 55)) * 100))}%`
                    }}
                  ></div>
                </div>
                <p className="text-[10px] text-[#8A9791] text-center m-0">
                  Continuous Exam Score Distribution (Observed: 55 to 101 Points)
                </p>
              </div>

              {/* Data-informed Recommendations from FastAPI */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#102E27] mb-2.5 flex items-center gap-1.5 m-0">
                  <Award className="w-3.5 h-3.5 text-[#173F35]" />
                  Constructive Next Steps & Recommendations
                </h4>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#F4F8F3] border border-[#D6E4D8] text-xs text-[#1B3B2B] flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#173F35] shrink-0 mt-0.5" />
                      <p className="leading-relaxed m-0 font-medium">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backend Disclaimer Echo */}
              <div className="pt-3 border-t border-[#F0F2EE] text-[11px] text-[#66736D] leading-relaxed">
                <p className="m-0">{result.disclaimer}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-[#D2DDD0] p-8 text-center space-y-3.5 card-hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-[#E6EEE5] text-[#173F35] flex items-center justify-center mx-auto shadow-2xs">
                <Sparkles className="w-6 h-6 text-[#173F35]" />
              </div>
              <h3 className="font-bold text-sm text-[#102E27] m-0">Awaiting Student Profile Input</h3>
              <p className="text-xs text-[#66736D] max-w-sm mx-auto leading-relaxed m-0">
                Tune any of the 19 factors on the left or select a quick profile, then click <strong>Generate Prediction & Advisory Pathway</strong>.
              </p>
              <div className="pt-2 text-[11px] text-[#8A9791]">
                Inference powered by trained Ridge model (α=7.85) served via FastAPI.
              </div>
            </div>
          )}

          {/* Interactive What-If Growth Levers Simulator */}
          <div className="bg-white rounded-2xl border border-[#DCE5DB] p-5 shadow-2xs card-hover-lift space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#102E27] tracking-tight flex items-center gap-1.5 m-0">
                  <Zap className="w-4 h-4 text-[#C6A96B]" />
                  What-If Growth Levers (Sensitivity Simulator)
                </h4>
                <p className="text-xs text-[#66736D] mt-0.5 m-0">
                  Simulate high-impact controllable adjustments based on Ridge model weights.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6EEE5] text-[#173F35] border border-[#CCDCCB] shrink-0">
                Interactive
              </span>
            </div>

            {appliedLeverNotice && (
              <div className="p-2.5 rounded-lg bg-[#EAF4EC] text-[#1E5136] text-xs font-semibold flex items-center gap-2 border border-[#BDE0CB] animate-fade-rise">
                <CheckCircle2 className="w-4 h-4 text-[#1E5136] shrink-0" />
                <span>{appliedLeverNotice} — Click "Generate Prediction" to calculate the updated score!</span>
              </div>
            )}

            <div className="space-y-2.5">
              {/* Lever 1: Attendance */}
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE6DC] flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-semibold text-[#102E27] flex items-center gap-1.5">
                    <span>Attendance Rate Boost (+10%)</span>
                    <span className="text-[10px] font-bold text-[#1E5136] bg-[#EAF4EC] px-1.5 py-0.2 rounded border border-[#CDE5D4]">
                      +2.1 pts lift
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66736D] mt-0.5 m-0 truncate">
                    Current: {formData.Attendance}% → Target: {Math.min(100, formData.Attendance + 10)}%
                  </p>
                </div>
                <button
                  type="button"
                  disabled={formData.Attendance >= 95}
                  onClick={() => handleApplyLever('Attendance', Math.min(100, formData.Attendance + 10), 'Attendance +10%')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#173F35] text-white hover:bg-[#102E27] disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                >
                  {formData.Attendance >= 95 ? 'Optimized' : 'Apply +10%'}
                </button>
              </div>

              {/* Lever 2: Study Hours */}
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE6DC] flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-semibold text-[#102E27] flex items-center gap-1.5">
                    <span>Add +5 Weekly Revision Hours</span>
                    <span className="text-[10px] font-bold text-[#1E5136] bg-[#EAF4EC] px-1.5 py-0.2 rounded border border-[#CDE5D4]">
                      +1.6 pts lift
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66736D] mt-0.5 m-0 truncate">
                    Current: {formData.Hours_Studied} hrs → Target: {Math.min(44, formData.Hours_Studied + 5)} hrs/wk
                  </p>
                </div>
                <button
                  type="button"
                  disabled={formData.Hours_Studied >= 35}
                  onClick={() => handleApplyLever('Hours_Studied', Math.min(44, formData.Hours_Studied + 5), 'Study Hours +5h')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#173F35] text-white hover:bg-[#102E27] disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                >
                  {formData.Hours_Studied >= 35 ? 'Optimized' : 'Apply +5h'}
                </button>
              </div>

              {/* Lever 3: Tutoring */}
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE6DC] flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-semibold text-[#102E27] flex items-center gap-1.5">
                    <span>Add +2 Tutoring Sessions</span>
                    <span className="text-[10px] font-bold text-[#1E5136] bg-[#EAF4EC] px-1.5 py-0.2 rounded border border-[#CDE5D4]">
                      +0.9 pts lift
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66736D] mt-0.5 m-0 truncate">
                    Current: {formData.Tutoring_Sessions} sessions → Target: {Math.min(8, formData.Tutoring_Sessions + 2)} sessions
                  </p>
                </div>
                <button
                  type="button"
                  disabled={formData.Tutoring_Sessions >= 4}
                  onClick={() => handleApplyLever('Tutoring_Sessions', Math.min(8, formData.Tutoring_Sessions + 2), 'Tutoring +2 sessions')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#173F35] text-white hover:bg-[#102E27] disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                >
                  {formData.Tutoring_Sessions >= 4 ? 'Optimized' : 'Apply +2'}
                </button>
              </div>

              {/* Lever 4: High Motivation */}
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE6DC] flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-semibold text-[#102E27] flex items-center gap-1.5">
                    <span>Cultivate High Motivation Mindset</span>
                    <span className="text-[10px] font-bold text-[#1E5136] bg-[#EAF4EC] px-1.5 py-0.2 rounded border border-[#CDE5D4]">
                      +0.8 pts lift
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66736D] mt-0.5 m-0 truncate">
                    Current: {formData.Motivation_Level} → Target: High
                  </p>
                </div>
                <button
                  type="button"
                  disabled={formData.Motivation_Level === 'High'}
                  onClick={() => handleApplyLever('Motivation_Level', 'High', 'Motivation Level: High')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#173F35] text-white hover:bg-[#102E27] disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                >
                  {formData.Motivation_Level === 'High' ? 'Optimized' : 'Set High'}
                </button>
              </div>
            </div>
          </div>

          {/* 3-Pillar Holistic Equilibrium Index Card */}
          <div className="bg-white rounded-2xl border border-[#DCE5DB] p-5 shadow-2xs card-hover-lift space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#102E27] tracking-tight flex items-center gap-1.5 m-0">
                  <Activity className="w-4 h-4 text-[#173F35]" />
                  3-Pillar Profile Equilibrium
                </h4>
                <p className="text-xs text-[#66736D] mt-0.5 m-0">
                  Live synthesized balance across academic, environment, and personal pillars.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {/* Academic Pillar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#102E27] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#173F35]" />
                    Academic Habits & Foundations
                  </span>
                  <span className="font-bold text-[#173F35] font-tabular">{academicPillarScore}%</span>
                </div>
                <div className="w-full h-2 bg-[#E6EEE5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#173F35] rounded-full transition-all duration-500"
                    style={{ width: `${academicPillarScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#66736D]">
                  <span>Study {formData.Hours_Studied}h • Attend {formData.Attendance}%</span>
                  <span>{academicPillarScore >= 75 ? 'Strong Foundation' : academicPillarScore >= 50 ? 'Steady Progress' : 'Growth Priority'}</span>
                </div>
              </div>

              {/* Environment Pillar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#102E27] flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-[#64866F]" />
                    Learning Environment & Faculty
                  </span>
                  <span className="font-bold text-[#64866F] font-tabular">{envPillarScore}%</span>
                </div>
                <div className="w-full h-2 bg-[#E6EEE5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#64866F] rounded-full transition-all duration-500"
                    style={{ width: `${envPillarScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#66736D]">
                  <span>Resources: {formData.Access_to_Resources} • Faculty: {formData.Teacher_Quality}</span>
                  <span>{envPillarScore >= 75 ? 'Enabling Setting' : 'Moderate Support'}</span>
                </div>
              </div>

              {/* Wellbeing Pillar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#102E27] flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#C6A96B]" />
                    Wellbeing & Personal Context
                  </span>
                  <span className="font-bold text-[#8A6D2D] font-tabular">{wellbeingPillarScore}%</span>
                </div>
                <div className="w-full h-2 bg-[#FAF6EC] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C6A96B] rounded-full transition-all duration-500"
                    style={{ width: `${wellbeingPillarScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#66736D]">
                  <span>Sleep {formData.Sleep_Hours}h • Motivation: {formData.Motivation_Level}</span>
                  <span>{wellbeingPillarScore >= 75 ? 'Restorative Balance' : 'Attention Recommended'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pre-Prediction Cohort Benchmark Card when awaiting profile */}
          {!result && (
            <div className="bg-[#FAF9F5] border border-[#EBE7DC] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#64866F]" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#102E27] m-0">
                  Cohort Empirical Baseline Reference
                </h4>
              </div>
              <p className="text-xs text-[#52605A] leading-relaxed m-0">
                The Ridge regression model evaluated across 6,607 students demonstrated that <strong>Attendance</strong> (+2.34 MAE) and <strong>Study Hours</strong> (+1.70 MAE) yield the strongest positive predictions.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-white border border-[#E2E7E0]">
                  <span className="text-[#66736D] block">Cohort Mean Score:</span>
                  <span className="font-bold text-[#102E27] text-sm">67.24 pts</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-[#E2E7E0]">
                  <span className="text-[#66736D] block">Interquartile Range:</span>
                  <span className="font-bold text-[#102E27] text-sm">65 – 70 pts</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
