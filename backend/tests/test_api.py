"""
Comprehensive API and Inference Test Suite for FastAPI Backend
"""

import pytest
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.ml_service import ml_service

client = TestClient(app)

# Standard valid test payload based on real dataset records
VALID_STUDENT_PAYLOAD = {
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


def test_health_endpoint():
    """Verify health endpoint returns status 200 and model readiness."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_ready"] is True
    assert data["version"] == "1.0.0"


def test_model_info_endpoint():
    """Verify model info returns accurate architecture and feature metadata."""
    response = client.get("/api/v1/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == "Tuned Ridge Regression"
    assert data["target_column"] == "Exam_Score"
    assert data["dataset_size"] == 6607
    assert data["observed_target_min"] == 55.0
    assert data["observed_target_max"] == 101.0
    assert len(data["numerical_features"]) == 6
    assert len(data["categorical_features"]) == 13
    assert "held_out_test_mae" in data["evaluation_metrics"]
    assert data["evaluation_metrics"]["held_out_test_mae"] == 0.4523


def test_valid_prediction():
    """Verify inference pipeline processes a valid student profile properly."""
    response = client.post("/api/v1/predict", json=VALID_STUDENT_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    
    assert "predicted_score" in data
    assert isinstance(data["predicted_score"], float)
    assert 55.0 <= data["predicted_score"] <= 101.0
    assert data["observed_target_min"] == 55.0
    assert data["observed_target_max"] == 101.0
    assert "readiness_category" in data
    assert isinstance(data["recommendations"], list)
    assert len(data["recommendations"]) > 0
    assert "Responsible AI" in data["disclaimer"]


def test_prediction_matches_direct_pipeline():
    """Verify that the API prediction matches the direct fitted pipeline prediction exactly."""
    response = client.post("/api/v1/predict", json=VALID_STUDENT_PAYLOAD)
    assert response.status_code == 200
    api_predicted_score = response.json()["predicted_score"]
    
    # Run direct inference through ml_service pipeline
    df_direct = pd.DataFrame([VALID_STUDENT_PAYLOAD])
    direct_score = round(float(ml_service.pipeline.predict(df_direct)[0]), 2)
    
    assert api_predicted_score == pytest.approx(direct_score, rel=1e-4)


def test_missing_required_fields():
    """Verify that omitting required features produces an HTTP 422 Validation Error."""
    incomplete_payload = VALID_STUDENT_PAYLOAD.copy()
    del incomplete_payload["Attendance"]
    del incomplete_payload["Hours_Studied"]
    
    response = client.post("/api/v1/predict", json=incomplete_payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    missing_fields = [err["loc"][-1] for err in errors]
    assert "Attendance" in missing_fields
    assert "Hours_Studied" in missing_fields


def test_invalid_numerical_values():
    """Verify that numerical features outside valid ranges produce HTTP 422."""
    # Test Attendance > 100
    invalid_payload_1 = VALID_STUDENT_PAYLOAD.copy()
    invalid_payload_1["Attendance"] = 150
    resp1 = client.post("/api/v1/predict", json=invalid_payload_1)
    assert resp1.status_code == 422

    # Test negative hours studied
    invalid_payload_2 = VALID_STUDENT_PAYLOAD.copy()
    invalid_payload_2["Hours_Studied"] = -5
    resp2 = client.post("/api/v1/predict", json=invalid_payload_2)
    assert resp2.status_code == 422


def test_unsupported_categorical_values():
    """Verify that unsupported categorical levels produce HTTP 422."""
    invalid_cat_payload = VALID_STUDENT_PAYLOAD.copy()
    invalid_cat_payload["Parental_Involvement"] = "SuperHigh"
    invalid_cat_payload["School_Type"] = "Homeschool"
    
    response = client.post("/api/v1/predict", json=invalid_cat_payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    invalid_fields = [err["loc"][-1] for err in errors]
    assert "Parental_Involvement" in invalid_fields
    assert "School_Type" in invalid_fields


def test_feature_importance_endpoint():
    """Verify held-out permutation importance response and disclaimer."""
    response = client.get("/api/v1/feature-importance")
    assert response.status_code == 200
    data = response.json()
    assert "method" in data
    assert "features" in data
    assert len(data["features"]) == 19
    # Top feature is Attendance
    assert data["features"][0]["feature"] == "Attendance"
    assert "causal" in data["disclaimer"].lower()


def test_metrics_endpoint():
    """Verify metrics endpoint returns held-out test metrics and benchmark comparison."""
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["selected_model"] == "Tuned Ridge Regression"
    assert "held_out_test_metrics" in data
    assert data["held_out_test_metrics"]["held_out_test_mae"] == 0.4523
    assert data["held_out_test_metrics"]["held_out_test_r2"] == 0.7697
    assert len(data["model_comparison"]) > 0


def test_distribution_endpoint():
    """Verify distribution endpoint returns accurate histogram bins and cohort stats."""
    response = client.get("/api/v1/distribution")
    assert response.status_code == 200
    data = response.json()
    assert data["target_column"] == "Exam_Score"
    assert data["total_records"] == 6607
    assert data["min"] == 55.0
    assert data["max"] == 101.0
    assert len(data["bins"]) > 0
    assert "bin_range" in data["bins"][0]


def test_dataset_summary_endpoint():
    """Verify dataset summary endpoint returns column info and sample rows."""
    response = client.get("/api/v1/dataset-summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_rows"] == 6607
    assert data["total_columns"] == 20
    assert len(data["columns"]) == 20
    assert len(data["sample_rows"]) > 0

