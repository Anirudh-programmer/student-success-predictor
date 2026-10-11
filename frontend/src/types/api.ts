/**
 * TypeScript API interfaces matching FastAPI Pydantic schemas
 */

export interface HealthResponse {
  status: string;
  model_ready: boolean;
  version: string;
  environment: string;
}

export interface MetricSummary {
  held_out_test_mae: number;
  held_out_test_rmse: number;
  held_out_test_r2: number;
  train_mae?: number;
  baseline_test_mae?: number;
  baseline_test_rmse?: number;
  mae_improvement_percent?: number;
  generalization_gap_mae?: number;
  [key: string]: number | undefined;
}

export interface NumericalRange {
  min: number;
  max: number;
  mean: number;
  median: number;
}

export interface ModelInfoResponse {
  model_name: string;
  algorithm: string;
  alpha: number;
  target_column: string;
  dataset_size: number;
  observed_target_min: number;
  observed_target_max: number;
  observed_target_mean: number;
  evaluation_metrics: MetricSummary;
  numerical_features: string[];
  categorical_features: string[];
  numerical_ranges: Record<string, NumericalRange>;
  categorical_options: Record<string, string[]>;
}

export type ParentalInvolvement = 'Low' | 'Medium' | 'High';
export type AccessToResources = 'Low' | 'Medium' | 'High';
export type ExtracurricularActivities = 'No' | 'Yes';
export type MotivationLevel = 'Low' | 'Medium' | 'High';
export type InternetAccess = 'No' | 'Yes';
export type FamilyIncome = 'Low' | 'Medium' | 'High';
export type TeacherQuality = 'Low' | 'Medium' | 'High';
export type SchoolType = 'Public' | 'Private';
export type PeerInfluence = 'Positive' | 'Neutral' | 'Negative';
export type LearningDisabilities = 'No' | 'Yes';
export type ParentalEducationLevel = 'High School' | 'College' | 'Postgraduate';
export type DistanceFromHome = 'Near' | 'Moderate' | 'Far';
export type Gender = 'Male' | 'Female';

export interface PredictRequest {
  Hours_Studied: number;
  Attendance: number;
  Sleep_Hours: number;
  Previous_Scores: number;
  Tutoring_Sessions: number;
  Physical_Activity: number;
  Parental_Involvement: ParentalInvolvement;
  Access_to_Resources: AccessToResources;
  Extracurricular_Activities: ExtracurricularActivities;
  Motivation_Level: MotivationLevel;
  Internet_Access: InternetAccess;
  Family_Income: FamilyIncome;
  Teacher_Quality: TeacherQuality;
  School_Type: SchoolType;
  Peer_Influence: PeerInfluence;
  Learning_Disabilities: LearningDisabilities;
  Parental_Education_Level: ParentalEducationLevel;
  Distance_from_Home: DistanceFromHome;
  Gender: Gender;
}

export interface PredictResponse {
  predicted_score: number;
  cohort_mean: number;
  observed_target_min: number;
  observed_target_max: number;
  delta_vs_mean: number;
  readiness_category: string;
  recommendations: string[];
  disclaimer: string;
  input_summary: Record<string, string | number>;
}

export interface FeatureImportanceItem {
  feature: string;
  importance_mae_increase: number;
  std: number;
}

export interface FeatureImportanceResponse {
  method: string;
  evaluation_split: string;
  importance_metric: string;
  disclaimer: string;
  features: FeatureImportanceItem[];
}

export interface ModelComparisonRow {
  Model?: string;
  model_name?: string;
  algorithm?: string;
  notes?: string;
  Train_MAE?: number;
  Test_MAE?: number;
  Test_RMSE?: number;
  Test_R2?: number;
  'MAE_Improvement_vs_Baseline_%'?: number;
  held_out_test_mae?: number;
  held_out_test_rmse?: number;
  held_out_test_r2?: number;
  is_selected?: boolean;
}

export interface MetricsResponse {
  selected_model: string;
  held_out_test_metrics: MetricSummary;
  model_comparison: ModelComparisonRow[];
}

export interface DistributionBin {
  bin_range: string;
  bin_start: number;
  bin_end: number;
  count: number;
  percentage: number;
}

export interface DistributionResponse {
  target_column: string;
  total_records: number;
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  iqr: number;
  bins: DistributionBin[];
}

export interface ColumnSummaryItem {
  column: string;
  type: string;
  missing_count: number;
  missing_pct: number;
  unique_count: number;
  sample_values: string[];
}

export interface DatasetSummaryResponse {
  total_rows: number;
  total_columns: number;
  target_column: string;
  columns: ColumnSummaryItem[];
  sample_rows: Record<string, string | number>[];
}
