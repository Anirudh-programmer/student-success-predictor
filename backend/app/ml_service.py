"""
ML Service: Loads serialized pipeline and handles predictions and metadata.
"""

import os
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import joblib


class MLService:
    def __init__(self, backend_dir: Optional[Path] = None):
        if backend_dir is None:
            # Default to parent of 'app' directory
            self.backend_dir = Path(__file__).resolve().parent.parent
        else:
            self.backend_dir = Path(backend_dir)
            
        self.artifacts_dir = self.backend_dir / "artifacts"
        self.model_path = self.artifacts_dir / "model_pipeline.joblib"
        self.metadata_path = self.artifacts_dir / "model_metadata.json"
        self.importance_path = self.artifacts_dir / "feature_importance.json"
        self.comparison_path = self.artifacts_dir / "model_comparison.json"
        self.distribution_path = self.artifacts_dir / "distribution.json"
        self.dataset_summary_path = self.artifacts_dir / "dataset_summary.json"
        
        self.pipeline = None
        self.metadata = {}
        self.feature_importance = []
        self.model_comparison = []
        self.distribution = {}
        self.dataset_summary = {}
        
        self._load_or_initialize()

    def _load_or_initialize(self):
        """Loads artifacts from disk; generates them if missing."""
        if not self.model_path.exists() or not self.metadata_path.exists():
            print("Model artifacts not found on disk. Initializing training and export...")
            from train_and_export import export_model
            export_model(self.backend_dir)
            
        # Load serialized pipeline
        self.pipeline = joblib.load(self.model_path)
        
        # Load metadata
        if self.metadata_path.exists():
            with open(self.metadata_path, "r") as f:
                self.metadata = json.load(f)
                
        # Load permutation importance
        if self.importance_path.exists():
            with open(self.importance_path, "r") as f:
                self.feature_importance = json.load(f)
                
        # Load model comparison
        if self.comparison_path.exists():
            with open(self.comparison_path, "r") as f:
                self.model_comparison = json.load(f)

        # Load distribution
        if self.distribution_path.exists():
            with open(self.distribution_path, "r") as f:
                self.distribution = json.load(f)

        # Load dataset summary
        if self.dataset_summary_path.exists():
            with open(self.dataset_summary_path, "r") as f:
                self.dataset_summary = json.load(f)

    @property
    def is_ready(self) -> bool:
        return self.pipeline is not None and bool(self.metadata)

    def get_model_info(self) -> Dict[str, Any]:
        """Returns model architecture, target scale, and feature schema."""
        if not self.is_ready:
            raise RuntimeError("ML model is not ready.")
            
        schema = self.metadata.get("feature_schema", {})
        return {
            "model_name": self.metadata.get("model_name", "Tuned Ridge Regression"),
            "algorithm": self.metadata.get("algorithm", "Ridge"),
            "alpha": self.metadata.get("alpha", 7.8476),
            "target_column": self.metadata.get("target_column", "Exam_Score"),
            "dataset_size": self.metadata.get("dataset_size", 6607),
            "observed_target_min": self.metadata.get("observed_target_min", 55.0),
            "observed_target_max": self.metadata.get("observed_target_max", 101.0),
            "observed_target_mean": self.metadata.get("observed_target_mean", 67.24),
            "evaluation_metrics": self.metadata.get("evaluation_metrics", {}),
            "numerical_features": schema.get("numerical_features", []),
            "categorical_features": schema.get("categorical_features", []),
            "numerical_ranges": schema.get("numerical_ranges", {}),
            "categorical_options": schema.get("categorical_options", {})
        }

    def get_feature_importance(self) -> Dict[str, Any]:
        """Returns held-out test set permutation importance."""
        return {
            "method": "Permutation Importance (sklearn.inspection.permutation_importance)",
            "evaluation_split": "Held-Out Test Partition (20% split, N=1,322)",
            "importance_metric": "Mean increase in Test MAE when feature is permuted (5 repeats)",
            "disclaimer": "Permutation importance reflects statistical predictive association within this observational dataset, not independent causal proof.",
            "features": self.feature_importance
        }

    def get_metrics(self) -> Dict[str, Any]:
        """Returns actual held-out test metrics and model comparison benchmark."""
        return {
            "selected_model": self.metadata.get("model_name", "Tuned Ridge Regression"),
            "held_out_test_metrics": self.metadata.get("evaluation_metrics", {}),
            "model_comparison": self.model_comparison
        }

    def get_distribution(self) -> Dict[str, Any]:
        """Returns exam score distribution histogram bins and cohort stats."""
        if not self.distribution:
            raise RuntimeError("Score distribution data not available.")
        return self.distribution

    def get_dataset_summary(self) -> Dict[str, Any]:
        """Returns dataset column metadata and representative preview sample."""
        if not self.dataset_summary:
            raise RuntimeError("Dataset summary data not available.")
        return self.dataset_summary


    def predict(self, input_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Executes inference using the fitted Ridge pipeline without clipping to 100."""
        if not self.is_ready:
            raise RuntimeError("ML model is not ready.")
            
        # Convert dictionary to single-row DataFrame matching training feature columns
        df_input = pd.DataFrame([input_dict])
        raw_pred = float(self.pipeline.predict(df_input)[0])
        predicted_score = round(raw_pred, 2)
        
        cohort_mean = float(self.metadata.get("observed_target_mean", 67.24))
        target_min = float(self.metadata.get("observed_target_min", 55.0))
        target_max = float(self.metadata.get("observed_target_max", 101.0))
        delta_vs_mean = round(predicted_score - cohort_mean, 2)
        
        # Categorize readiness standing
        if predicted_score >= 80.0:
            readiness_category = "Exemplary Standing (High Readiness)"
        elif predicted_score >= 70.0:
            readiness_category = "Proficient Standing (On Track)"
        elif predicted_score >= 62.0:
            readiness_category = "Moderate Standing (Targeted Support Beneficial)"
        else:
            readiness_category = "Priority Academic Support Recommended"
            
        # Contextual study recommendations
        recommendations = self._generate_recommendations(input_dict, predicted_score)
        
        disclaimer = (
            "Responsible AI Notice: Predictions are statistical estimates derived from historical correlation. "
            "They are intended strictly for constructive academic advising and early mentorship, not automated grading or high-stakes admissions decisions."
        )
        
        return {
            "predicted_score": predicted_score,
            "cohort_mean": cohort_mean,
            "observed_target_min": target_min,
            "observed_target_max": target_max,
            "delta_vs_mean": delta_vs_mean,
            "readiness_category": readiness_category,
            "recommendations": recommendations,
            "disclaimer": disclaimer,
            "input_summary": input_dict
        }

    def _generate_recommendations(self, inputs: Dict[str, Any], predicted_score: float) -> List[str]:
        recommendations = []
        att = inputs.get("Attendance", 80)
        hours = inputs.get("Hours_Studied", 20)
        tutoring = inputs.get("Tutoring_Sessions", 0)
        sleep = inputs.get("Sleep_Hours", 7)
        resources = inputs.get("Access_to_Resources", "Medium")
        internet = inputs.get("Internet_Access", "Yes")
        
        if att < 80:
            recommendations.append(
                f"Classroom attendance is currently {att}%. In model permutation evaluation, attendance is the single strongest factor (+2.34 MAE impact). Increasing attendance to 85%+ provides significant academic gains."
            )
        else:
            recommendations.append(
                f"Strong attendance habit ({att}%). Maintaining consistent classroom participation provides ongoing concept reinforcement."
            )
            
        if hours < 18:
            recommendations.append(
                f"Logged study time is {hours} hrs/week (cohort mean is 20 hrs). Scheduling structured daily revision blocks can improve concept retention."
            )
        elif hours > 32:
            recommendations.append(
                f"High study volume ({hours} hrs/week). Balance with active-recall techniques and scheduled breaks to avoid cognitive burnout."
            )
            
        if tutoring == 0 and predicted_score < 70:
            recommendations.append(
                "Student currently attends 0 tutoring sessions. Joining faculty mentoring hours or peer study circles can help resolve challenging curriculum topics."
            )
            
        if sleep < 7:
            recommendations.append(
                f"Reported sleep duration is {sleep} hours. Adequate nightly rest is essential for memory consolidation and exam stamina."
            )
            
        if resources == "Low" or internet == "No":
            recommendations.append(
                "Resource or connectivity limitations detected. Leverage campus library facilities, offline notes, and computer labs to bridge learning material gaps."
            )
            
        return recommendations


# Global singleton instance
ml_service = MLService()
