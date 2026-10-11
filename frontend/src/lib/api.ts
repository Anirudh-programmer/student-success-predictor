import type {
  HealthResponse,
  ModelInfoResponse,
  PredictRequest,
  PredictResponse,
  FeatureImportanceResponse,
  MetricsResponse,
  DistributionResponse,
  DatasetSummaryResponse
} from '../types/api';

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options?.headers || {})
      }
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails: unknown = null;
      try {
        const errorJson = await response.json();
        errorDetails = errorJson;
        if (errorJson.detail) {
          if (Array.isArray(errorJson.detail)) {
            // Pydantic validation error list
            errorMessage = errorJson.detail
              .map((d: { loc: (string | number)[]; msg: string }) => `${d.loc.slice(-1)[0]}: ${d.msg}`)
              .join('; ');
          } else {
            errorMessage = String(errorJson.detail);
          }
        }
      } catch {
        // Response was not JSON
      }
      throw new ApiError(errorMessage, response.status, errorDetails);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown network failure';
    throw new ApiError(
      `Unable to reach backend at ${API_BASE_URL}. Ensure the FastAPI server is running. (${message})`
    );
  }
}

export const api = {
  getHealth: (): Promise<HealthResponse> => fetchJson<HealthResponse>('/health'),
  getModelInfo: (): Promise<ModelInfoResponse> => fetchJson<ModelInfoResponse>('/api/v1/model-info'),
  predict: (data: PredictRequest): Promise<PredictResponse> =>
    fetchJson<PredictResponse>('/api/v1/predict', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getFeatureImportance: (): Promise<FeatureImportanceResponse> =>
    fetchJson<FeatureImportanceResponse>('/api/v1/feature-importance'),
  getMetrics: (): Promise<MetricsResponse> => fetchJson<MetricsResponse>('/api/v1/metrics'),
  getDistribution: (): Promise<DistributionResponse> =>
    fetchJson<DistributionResponse>('/api/v1/distribution'),
  getDatasetSummary: (): Promise<DatasetSummaryResponse> =>
    fetchJson<DatasetSummaryResponse>('/api/v1/dataset-summary')
};
