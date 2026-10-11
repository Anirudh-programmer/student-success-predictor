"""
Pydantic Schemas for Student Success Predictor API
"""

from typing import Literal, Dict, Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class PredictRequest(BaseModel):
    """
    Request payload containing the 19 student performance factor features.
    Values are validated against dataset boundaries and valid categories.
    """
    # 6 Numerical Features
    Hours_Studied: int = Field(
        ...,
        ge=1,
        le=50,
        description="Hours studied per week outside regular classes (dataset observed: 1-44)"
    )
    Attendance: int = Field(
        ...,
        ge=50,
        le=100,
        description="Classroom attendance percentage (dataset observed: 60-100)"
    )
    Sleep_Hours: int = Field(
        ...,
        ge=3,
        le=12,
        description="Average hours of sleep per night (dataset observed: 4-10)"
    )
    Previous_Scores: int = Field(
        ...,
        ge=35,
        le=100,
        description="Previous exam score percentage (dataset observed: 40-100)"
    )
    Tutoring_Sessions: int = Field(
        ...,
        ge=0,
        le=10,
        description="Tutoring sessions attended per month (dataset observed: 0-8)"
    )
    Physical_Activity: int = Field(
        ...,
        ge=0,
        le=8,
        description="Hours of physical activity per week (dataset observed: 0-6)"
    )

    # 13 Categorical Features
    Parental_Involvement: Literal["Low", "Medium", "High"] = Field(
        ..., description="Degree of parental academic involvement"
    )
    Access_to_Resources: Literal["Low", "Medium", "High"] = Field(
        ..., description="Availability of learning resources and materials"
    )
    Extracurricular_Activities: Literal["No", "Yes"] = Field(
        ..., description="Participation in extracurricular activities"
    )
    Motivation_Level: Literal["Low", "Medium", "High"] = Field(
        ..., description="Student motivation and academic drive"
    )
    Internet_Access: Literal["No", "Yes"] = Field(
        ..., description="Home internet connectivity"
    )
    Family_Income: Literal["Low", "Medium", "High"] = Field(
        ..., description="Household income bracket"
    )
    Teacher_Quality: Literal["Low", "Medium", "High"] = Field(
        ..., description="Quality of teaching and faculty support"
    )
    School_Type: Literal["Public", "Private"] = Field(
        ..., description="Type of educational institution"
    )
    Peer_Influence: Literal["Positive", "Neutral", "Negative"] = Field(
        ..., description="Academic influence of peer group"
    )
    Learning_Disabilities: Literal["No", "Yes"] = Field(
        ..., description="Formally identified learning support need"
    )
    Parental_Education_Level: Literal["High School", "College", "Postgraduate"] = Field(
        ..., description="Highest parental education level"
    )
    Distance_from_Home: Literal["Near", "Moderate", "Far"] = Field(
        ..., description="Commute distance from home to campus"
    )
    Gender: Literal["Male", "Female"] = Field(
        ..., description="Student gender demographic"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "Hours_Studied": 22,
                "Attendance": 85,
                "Sleep_Hours": 7,
                "Previous_Scores": 75,
                "Tutoring_Sessions": 2,
                "Physical_Activity": 3,
                "Parental_Involvement": "High",
                "Access_to_Resources": "High",
                "Extracurricular_Activities": "Yes",
                "Motivation_Level": "High",
                "Internet_Access": "Yes",
                "Family_Income": "Medium",
                "Teacher_Quality": "High",
                "School_Type": "Public",
                "Peer_Influence": "Positive",
                "Learning_Disabilities": "No",
                "Parental_Education_Level": "College",
                "Distance_from_Home": "Near",
                "Gender": "Female"
            }
        }
    )


class PredictResponse(BaseModel):
    """Prediction outcome and contextual advisory payload."""
    predicted_score: float = Field(..., description="Estimated exam score in continuous points")
    cohort_mean: float = Field(..., description="Historical cohort mean exam score")
    observed_target_min: float = Field(..., description="Observed minimum score in dataset")
    observed_target_max: float = Field(..., description="Observed maximum score in dataset (101)")
    delta_vs_mean: float = Field(..., description="Score difference relative to cohort mean")
    readiness_category: str = Field(..., description="Academic standing categorization")
    recommendations: List[str] = Field(..., description="Data-informed study suggestions")
    disclaimer: str = Field(..., description="Responsible AI estimation advisory note")
    input_summary: Dict[str, Any] = Field(..., description="Echo of evaluated student input")


class HealthResponse(BaseModel):
    status: str
    model_ready: bool
    version: str
    environment: str


class ModelInfoResponse(BaseModel):
    model_name: str
    algorithm: str
    alpha: float
    target_column: str
    dataset_size: int
    observed_target_min: float
    observed_target_max: float
    observed_target_mean: float
    evaluation_metrics: Dict[str, Any]
    numerical_features: List[str]
    categorical_features: List[str]
    numerical_ranges: Dict[str, Dict[str, float]]
    categorical_options: Dict[str, List[str]]


class FeatureImportanceItem(BaseModel):
    feature: str
    importance_mae_increase: float
    std: float


class FeatureImportanceResponse(BaseModel):
    method: str
    evaluation_split: str
    importance_metric: str
    disclaimer: str
    features: List[FeatureImportanceItem]


class MetricsResponse(BaseModel):
    selected_model: str
    held_out_test_metrics: Dict[str, Any]
    model_comparison: List[Dict[str, Any]]


class DistributionBin(BaseModel):
    bin_range: str
    bin_start: float
    bin_end: float
    count: int
    percentage: float


class DistributionResponse(BaseModel):
    target_column: str
    total_records: int
    mean: float
    median: float
    std: float
    min: float
    max: float
    iqr: float
    bins: List[DistributionBin]


class ColumnSummaryItem(BaseModel):
    column: str
    type: str
    missing_count: int
    missing_pct: float
    unique_count: int
    sample_values: List[str]


class DatasetSummaryResponse(BaseModel):
    total_rows: int
    total_columns: int
    target_column: str
    columns: List[ColumnSummaryItem]
    sample_rows: List[Dict[str, Any]]

