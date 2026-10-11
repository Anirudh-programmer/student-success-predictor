"""
Comprehensive Model Benchmark, Tuning, and Evaluation Pipeline
IBM SkillsBuild – AICTE–BharatCares Machine Learning & Applied AI Internship
"""

import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, KFold, cross_val_score, RandomizedSearchCV
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import Ridge
from sklearn.ensemble import (
    RandomForestRegressor,
    ExtraTreesRegressor,
    GradientBoostingRegressor,
    HistGradientBoostingRegressor
)
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.inspection import permutation_importance

print("=" * 70)
print("1. LOADING & PARTITIONING DATASET")
print("=" * 70)

df = pd.read_csv("StudentPerformanceFactors.csv")
target_col = "Exam_Score"

# Ensure target is strictly excluded from inputs
feature_cols = [c for c in df.columns if c != target_col]
X = df[feature_cols]
y = df[target_col]

num_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
cat_features = [c for c in feature_cols if c not in num_features]

print(f"Total instances: {len(df)}")
print(f"Input features count: {len(feature_cols)} ({len(num_features)} numerical, {len(cat_features)} categorical)")
print(f"Target column: {target_col} (min={y.min()}, max={y.max()}, mean={y.mean():.2f})")

# Identical reproducible 80/20 train/test partition
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42
)
print(f"Training split: {X_train.shape[0]} samples")
print(f"Held-out test split: {X_test.shape[0]} samples (untouched until final testing)\n")

# -------------------------------------------------------------
# Preprocessing Pipelines
# -------------------------------------------------------------
# Standard pipeline (with scaling, for linear & tree models)
num_transformer_scaled = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

cat_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
])

preprocessor_scaled = ColumnTransformer([
    ('num', num_transformer_scaled, num_features),
    ('cat', cat_transformer, cat_features)
])

# Unscaled numerical transformer (standard trees work fine with or without scaling)
num_transformer_raw = Pipeline([
    ('imputer', SimpleImputer(strategy='median'))
])

preprocessor_tree = ColumnTransformer([
    ('num', num_transformer_raw, num_features),
    ('cat', cat_transformer, cat_features)
])

# -------------------------------------------------------------
# 2. BASELINE & CANDIDATE MODEL COMPARISON (5-Fold CV on Train Set)
# -------------------------------------------------------------
print("=" * 70)
print("2. 5-FOLD CROSS-VALIDATION ON TRAINING SET")
print("=" * 70)

cv = KFold(n_splits=5, shuffle=True, random_state=42)

candidate_models = {
    "Dummy (Mean Baseline)": Pipeline([
        ('preprocessor', preprocessor_scaled),
        ('model', DummyRegressor(strategy='mean'))
    ]),
    "Ridge Regression": Pipeline([
        ('preprocessor', preprocessor_scaled),
        ('model', Ridge(alpha=1.0, random_state=42))
    ]),
    "Random Forest": Pipeline([
        ('preprocessor', preprocessor_tree),
        ('model', RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=1))
    ]),
    "Extra Trees": Pipeline([
        ('preprocessor', preprocessor_tree),
        ('model', ExtraTreesRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=1))
    ]),
    "Gradient Boosting": Pipeline([
        ('preprocessor', preprocessor_tree),
        ('model', GradientBoostingRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42))
    ]),
    "HistGradientBoosting": Pipeline([
        ('preprocessor', preprocessor_tree),
        ('model', HistGradientBoostingRegressor(max_iter=100, max_depth=6, learning_rate=0.1, random_state=42))
    ])
}

cv_results = []

for name, pipeline in candidate_models.items():
    # Evaluate with 5-fold CV using negative MAE
    scores_mae = -cross_val_score(pipeline, X_train, y_train, cv=cv, scoring='neg_mean_absolute_error')
    scores_r2 = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring='r2')
    
    mean_mae = scores_mae.mean()
    std_mae = scores_mae.std()
    mean_r2 = scores_r2.mean()
    
    cv_results.append({
        "Model": name,
        "CV_MAE_Mean": round(mean_mae, 4),
        "CV_MAE_Std": round(std_mae, 4),
        "CV_R2_Mean": round(mean_r2, 4)
    })
    print(f"{name:25s} | CV MAE: {mean_mae:.4f} (±{std_mae:.4f}) | CV R²: {mean_r2:.4f}")

# -------------------------------------------------------------
# 3. HYPERPARAMETER TUNING ON BEST CANDIDATES (Train Partition Only)
# -------------------------------------------------------------
print("\n" + "=" * 70)
print("3. HYPERPARAMETER TUNING (RandomizedSearchCV on Training Split)")
print("=" * 70)

# 1. Tuning Ridge (often linear relationships are very clean in performance datasets)
ridge_param_dist = {
    'model__alpha': np.logspace(-2, 3, 20)
}
search_ridge = RandomizedSearchCV(
    candidate_models["Ridge Regression"],
    param_distributions=ridge_param_dist,
    n_iter=15,
    cv=cv,
    scoring='neg_mean_absolute_error',
    random_state=42,
    n_jobs=1
)
search_ridge.fit(X_train, y_train)
best_ridge_mae = -search_ridge.best_score_
print(f"Tuned Ridge: Best CV MAE = {best_ridge_mae:.4f} with {search_ridge.best_params_}")

# 2. Tuning GradientBoostingRegressor
gbr_param_dist = {
    'model__n_estimators': [75, 100, 150],
    'model__max_depth': [3, 4, 5],
    'model__learning_rate': [0.05, 0.08, 0.1, 0.15],
    'model__subsample': [0.8, 0.9, 1.0]
}
search_gbr = RandomizedSearchCV(
    candidate_models["Gradient Boosting"],
    param_distributions=gbr_param_dist,
    n_iter=12,
    cv=cv,
    scoring='neg_mean_absolute_error',
    random_state=42,
    n_jobs=1
)
search_gbr.fit(X_train, y_train)
best_gbr_mae = -search_gbr.best_score_
print(f"Tuned Gradient Boosting: Best CV MAE = {best_gbr_mae:.4f} with {search_gbr.best_params_}")

# 3. Tuning RandomForestRegressor
rf_param_dist = {
    'model__n_estimators': [100, 150, 200],
    'model__max_depth': [8, 10, 12, 14],
    'model__min_samples_split': [2, 5, 10],
    'model__min_samples_leaf': [1, 2, 4]
}
search_rf = RandomizedSearchCV(
    candidate_models["Random Forest"],
    param_distributions=rf_param_dist,
    n_iter=10,
    cv=cv,
    scoring='neg_mean_absolute_error',
    random_state=42,
    n_jobs=1
)
search_rf.fit(X_train, y_train)
best_rf_mae = -search_rf.best_score_
print(f"Tuned Random Forest: Best CV MAE = {best_rf_mae:.4f} with {search_rf.best_params_}")

# Select the winning model based on best CV MAE
candidate_tuned = [
    ("Tuned Ridge", search_ridge.best_estimator_, best_ridge_mae),
    ("Tuned Gradient Boosting", search_gbr.best_estimator_, best_gbr_mae),
    ("Tuned Random Forest", search_rf.best_estimator_, best_rf_mae)
]
candidate_tuned.sort(key=lambda x: x[2])
winner_name, best_pipeline, winner_cv_mae = candidate_tuned[0]
print(f"\n>>> WINNING MODEL SELECTED BY 5-FOLD CV: {winner_name} (CV MAE = {winner_cv_mae:.4f})")

# -------------------------------------------------------------
# 4. FINAL TEST EVALUATION ACROSS ALL CANDIDATES
# -------------------------------------------------------------
print("\n" + "=" * 70)
print("4. FINAL EVALUATION ON UNTOUCHED HELD-OUT TEST SET (N = 1,322)")
print("=" * 70)

# Evaluate each candidate model on held-out test set
comparison_rows = []

# Add baseline first
dummy = candidate_models["Dummy (Mean Baseline)"]
dummy.fit(X_train, y_train)
y_pred_dummy = dummy.predict(X_test)
dummy_mae = mean_absolute_error(y_test, y_pred_dummy)
dummy_rmse = np.sqrt(mean_squared_error(y_test, y_pred_dummy))
dummy_r2 = r2_score(y_test, y_pred_dummy)

all_eval_models = {
    "Dummy (Mean Baseline)": dummy,
    "Ridge Regression (Default)": candidate_models["Ridge Regression"].fit(X_train, y_train),
    "Ridge Regression (Tuned)": search_ridge.best_estimator_,
    "Random Forest (Default)": candidate_models["Random Forest"].fit(X_train, y_train),
    "Random Forest (Tuned)": search_rf.best_estimator_,
    "Extra Trees (Default)": candidate_models["Extra Trees"].fit(X_train, y_train),
    "HistGradientBoosting": candidate_models["HistGradientBoosting"].fit(X_train, y_train),
    "Gradient Boosting (Default)": candidate_models["Gradient Boosting"].fit(X_train, y_train),
    "Gradient Boosting (Tuned)": search_gbr.best_estimator_
}

for m_name, m_pipe in all_eval_models.items():
    y_pred_test = m_pipe.predict(X_test)
    y_pred_train = m_pipe.predict(X_train)
    
    train_mae = mean_absolute_error(y_train, y_pred_train)
    test_mae = mean_absolute_error(y_test, y_pred_test)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    test_r2 = r2_score(y_test, y_pred_test)
    pct_improvement = ((dummy_mae - test_mae) / dummy_mae) * 100
    
    comparison_rows.append({
        "Model": m_name,
        "Train_MAE": round(train_mae, 4),
        "Test_MAE": round(test_mae, 4),
        "Test_RMSE": round(test_rmse, 4),
        "Test_R2": round(test_r2, 4),
        "MAE_Improvement_vs_Baseline_%": round(pct_improvement, 2)
    })
    print(f"{m_name:30s} | Test MAE: {test_mae:.4f} | Test RMSE: {test_rmse:.4f} | Test R²: {test_r2:.4f} | +{pct_improvement:.1f}% vs baseline")

comparison_df = pd.DataFrame(comparison_rows).sort_values(by="Test_MAE")
comparison_df.to_csv("model_comparison.csv", index=False)
print("\nSaved comparison table to 'model_comparison.csv' successfully.")

# -------------------------------------------------------------
# 5. DIAGNOSTICS & RESIDUAL ANALYSIS FOR WINNER
# -------------------------------------------------------------
print("\n" + "=" * 70)
print(f"5. RESIDUAL DIAGNOSTICS FOR SELECTED FINAL MODEL: {winner_name}")
print("=" * 70)

y_pred_final = best_pipeline.predict(X_test)
residuals = y_test - y_pred_final

print(f"Residuals Mean: {residuals.mean():.4f} (close to 0 indicates unbiased predictions)")
print(f"Residuals Std:  {residuals.std():.4f}")
print(f"Residuals Min:  {residuals.min():.4f}, Max: {residuals.max():.4f}")
print(f"Residuals 25%:  {residuals.quantile(0.25):.4f}, 75%: {residuals.quantile(0.75):.4f}")

# Check train vs test error to assess overfitting
final_train_mae = mean_absolute_error(y_train, best_pipeline.predict(X_train))
final_test_mae = mean_absolute_error(y_test, y_pred_final)
print(f"Train MAE: {final_train_mae:.4f} vs Test MAE: {final_test_mae:.4f}")
print(f"Train/Test MAE Gap: {abs(final_test_mae - final_train_mae):.4f}")
if abs(final_test_mae - final_train_mae) < 0.15:
    print("Assessment: Minimal generalization gap. The model is NOT overfitting!")
else:
    print("Assessment: Noticeable generalization gap detected.")

# -------------------------------------------------------------
# 6. PERMUTATION IMPORTANCE ANALYSIS (Held-Out Test Set)
# -------------------------------------------------------------
print("\n" + "=" * 70)
print("6. PERMUTATION IMPORTANCE ANALYSIS (On Held-Out Test Data)")
print("=" * 70)

perm_result = permutation_importance(
    best_pipeline,
    X_test,
    y_test,
    n_repeats=10,
    random_state=42,
    scoring='neg_mean_absolute_error',
    n_jobs=1
)

perm_df = pd.DataFrame({
    'Feature': feature_cols,
    'Importance_Mean': perm_result.importances_mean,
    'Importance_Std': perm_result.importances_std
}).sort_values(by='Importance_Mean', ascending=False).reset_index(drop=True)

print("Top 10 Features by Permutation Importance (Increase in Test MAE when permuted):")
for idx, row in perm_df.head(10).iterrows():
    print(f"  {row['Feature']:28s}: {row['Importance_Mean']:.4f} (±{row['Importance_Std']:.4f})")

perm_df.to_csv("feature_importance_permutation.csv", index=False)
print("\nSaved permutation feature importance to 'feature_importance_permutation.csv'")
print("=" * 70)
print("ALL BENCHMARKING COMPLETE.")
print("=" * 70)
