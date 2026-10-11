"""
Model Training and Export Script
Exports fitted scikit-learn Ridge pipeline and metadata for FastAPI backend.
"""

import os
import json
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import Ridge
from sklearn.dummy import DummyRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.inspection import permutation_importance


def export_model(base_dir: Path):
    artifacts_dir = base_dir / "artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    
    # Locate dataset
    csv_candidates = [
        base_dir / "data" / "StudentPerformanceFactors.csv",
        base_dir / "StudentPerformanceFactors.csv",
        base_dir.parent / "StudentPerformanceFactors.csv"
    ]
    csv_path = None
    for p in csv_candidates:
        if p.exists():
            csv_path = p
            break
            
    if not csv_path:
        raise FileNotFoundError(f"Could not locate StudentPerformanceFactors.csv in {csv_candidates}")
        
    print(f"Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    
    target_col = "Exam_Score"
    feature_cols = [c for c in df.columns if c != target_col]
    
    num_features = df[feature_cols].select_dtypes(include=['int64', 'float64']).columns.tolist()
    cat_features = [c for c in feature_cols if c not in num_features]
    
    X = df[feature_cols]
    y = df[target_col]
    
    # Reproducible 80/20 train/test split (identical to benchmark)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    
    # Preprocessing pipelines
    num_pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    cat_pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(transformers=[
        ('num', num_pipeline, num_features),
        ('cat', cat_pipeline, cat_features)
    ])
    
    # Baseline evaluation
    dummy = Pipeline([
        ('preprocessor', preprocessor),
        ('model', DummyRegressor(strategy='mean'))
    ])
    dummy.fit(X_train, y_train)
    dummy_preds = dummy.predict(X_test)
    baseline_mae = mean_absolute_error(y_test, dummy_preds)
    baseline_rmse = np.sqrt(mean_squared_error(y_test, dummy_preds))
    
    # Winning Ridge pipeline (alpha=7.8476)
    ridge_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', Ridge(alpha=7.8476, random_state=42))
    ])
    
    # Fit strictly on training partition to avoid data leakage
    ridge_pipeline.fit(X_train, y_train)
    
    # Evaluate on held-out test split
    y_pred_train = ridge_pipeline.predict(X_train)
    y_pred_test = ridge_pipeline.predict(X_test)
    
    train_mae = mean_absolute_error(y_train, y_pred_train)
    test_mae = mean_absolute_error(y_test, y_pred_test)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    test_r2 = r2_score(y_test, y_pred_test)
    mae_improvement_pct = ((baseline_mae - test_mae) / baseline_mae) * 100
    
    print(f"Model fitted successfully.")
    print(f"Test MAE: {test_mae:.4f} | Test RMSE: {test_rmse:.4f} | Test R2: {test_r2:.4f}")
    print(f"Improvement over baseline: {mae_improvement_pct:.2f}%")
    
    # Save serialized pipeline
    model_artifact_path = artifacts_dir / "model_pipeline.joblib"
    joblib.dump(ridge_pipeline, model_artifact_path)
    print(f"Saved model artifact to: {model_artifact_path}")
    
    # Extract categorical unique values and numerical ranges
    categorical_options = {}
    for col in cat_features:
        categorical_options[col] = sorted(df[col].dropna().unique().tolist())
        
    numerical_ranges = {}
    for col in num_features:
        numerical_ranges[col] = {
            "min": float(df[col].min()),
            "max": float(df[col].max()),
            "mean": float(df[col].mean()),
            "median": float(df[col].median())
        }
        
    # Permutation feature importance on held-out test split
    perm = permutation_importance(
        ridge_pipeline,
        X_test,
        y_test,
        n_repeats=5,
        random_state=42,
        scoring='neg_mean_absolute_error',
        n_jobs=1
    )
    
    feature_importance_list = []
    for f_name, mean_imp, std_imp in zip(feature_cols, perm.importances_mean, perm.importances_std):
        feature_importance_list.append({
            "feature": f_name,
            "importance_mae_increase": round(float(mean_imp), 4),
            "std": round(float(std_imp), 4)
        })
    feature_importance_list.sort(key=lambda x: x["importance_mae_increase"], reverse=True)
    
    # Save feature importance JSON
    with open(artifacts_dir / "feature_importance.json", "w") as f:
        json.dump(feature_importance_list, f, indent=2)
        
    # Copy model comparison if available
    comparison_src = base_dir.parent / "model_comparison.csv"
    if not comparison_src.exists():
        comparison_src = base_dir / "model_comparison.csv"
    if comparison_src.exists():
        comp_df = pd.read_csv(comparison_src)
        comp_records = comp_df.to_dict(orient="records")
        with open(artifacts_dir / "model_comparison.json", "w") as f:
            json.dump(comp_records, f, indent=2)
            
    # Metadata dictionary
    metadata = {
        "model_name": "Tuned Ridge Regression",
        "algorithm": "Ridge",
        "alpha": 7.8476,
        "target_column": target_col,
        "dataset_size": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "observed_target_min": float(y.min()),
        "observed_target_max": float(y.max()),
        "observed_target_mean": float(y.mean()),
        "observed_target_median": float(y.median()),
        "evaluation_metrics": {
            "held_out_test_mae": round(test_mae, 4),
            "held_out_test_rmse": round(test_rmse, 4),
            "held_out_test_r2": round(test_r2, 4),
            "train_mae": round(train_mae, 4),
            "baseline_test_mae": round(baseline_mae, 4),
            "baseline_test_rmse": round(baseline_rmse, 4),
            "mae_improvement_percent": round(mae_improvement_pct, 2),
            "generalization_gap_mae": round(abs(test_mae - train_mae), 4)
        },
        "feature_schema": {
            "numerical_features": num_features,
            "categorical_features": cat_features,
            "numerical_ranges": numerical_ranges,
            "categorical_options": categorical_options
        }
    }
    
    with open(artifacts_dir / "model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Saved metadata to: {artifacts_dir / 'model_metadata.json'}")
    print("Export complete.")


if __name__ == "__main__":
    current_dir = Path(__file__).resolve().parent
    export_model(current_dir)
