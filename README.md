# 🎓 Student Success Predictor

A polished machine learning application built for the **IBM SkillsBuild – AICTE–BharatCares Machine Learning & Applied AI Internship**.

The project implements a rigorous, leakage-free Scikit-Learn regression pipeline trained on genuine student performance factor data (6,607 records) to predict expected examination scores and deliver actionable academic advisory guidance.

The system features:
1. **FastAPI Backend (`backend/`)**: High-performance RESTful API with Pydantic request validation and serialized Joblib model pipeline, ready for deployment on **Render**.
2. **React Frontend (`frontend/`)**: Production-ready React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, and Lucide React application with Veridian botanical design system, ready for deployment on **Vercel**.
3. **Streamlit Application (`app.py`)**: Interactive analytical dashboard running on port 8501 (preserved as a standalone local fallback).

---

## 🏆 Model Evaluation & Benchmark Summary

To establish trustworthy metrics and select the most accurate algorithm, multiple models were evaluated using identical 80/20 train/test partitions (`random_state=42`) with **5-fold cross-validation** strictly on the training partition:

| Model | 5-Fold CV MAE | Test MAE | Test RMSE | Test $R^2$ | Improvement vs. Baseline |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Tuned Ridge Regression ($\alpha=7.85$)** | **0.5081** | **0.4523** | **1.8042** | **0.7697** | **+83.98%** |
| Default Ridge Regression | 0.5082 | 0.4524 | 1.8044 | 0.7697 | +83.98% |
| Tuned Gradient Boosting | 0.7690 | 0.6911 | 1.9058 | 0.7430 | +75.52% |
| Default Gradient Boosting | 0.8248 | 0.7602 | 1.9365 | 0.7347 | +73.08% |
| HistGradientBoosting | 0.8442 | 0.7746 | 1.9439 | 0.7327 | +72.57% |
| Tuned Random Forest | 1.1536 | 1.0584 | 2.1181 | 0.6826 | +62.52% |
| Default Extra Trees | 1.2377 | 1.1497 | 2.1423 | 0.6753 | +59.28% |
| Default Random Forest | 1.2458 | 1.1518 | 2.1946 | 0.6593 | +59.21% |
| **DummyRegressor (Mean Baseline)** | 2.8525 | 2.8235 | 3.7611 | -0.0007 | 0.00% |

### Key Findings:
1. **Winning Algorithm**: **Tuned Ridge Regression** achieved the lowest error across both 5-fold cross-validation (MAE = 0.508) and held-out testing (MAE = 0.452), cutting error by **84.0%** relative to the naive baseline.
2. **Why Regularized Linear Regression Outperformed Tree Ensembles**: 
   In student performance data, variables like study hours, attendance rate, previous scores, and tutoring act in an additive, continuous linear fashion. Tree-based models (Random Forest, Extra Trees) approximate continuous functions through axis-aligned piecewise-constant step functions, introducing discretization error.
3. **Overfitting Audit**:
   - **Train MAE**: 0.4984 points
   - **Test MAE**: 0.4523 points
   - **Generalization Gap**: 0.0461 points (virtually identical, confirming zero overfitting).
4. **Accuracy Distribution**:
   - Over **98.6%** of held-out test predictions fall within **±1.0 point** of the true exam score.
   - Over **99.4%** fall within **±2.0 points**.
   - A tiny cluster (~0.5%) of outlier students who scored well above predicted habits accounts for the RMSE of 1.80.

---

## 🔍 Permutation Feature Importance (Held-Out Test Data)

Permutation importance measures the average degradation in test MAE when each feature's values are randomly shuffled:

1. **Attendance**: **+2.34 MAE** (Strongest statistical factor)
2. **Hours Studied**: **+1.70 MAE**
3. **Access to Resources**: **+0.55 MAE**
4. **Previous Scores**: **+0.54 MAE**
5. **Parental Involvement**: **+0.52 MAE**
6. **Tutoring Sessions**: **+0.44 MAE**
7. **Family Income**: **+0.21 MAE**
8. **Parental Education Level**: **+0.21 MAE**
9. **Peer Influence**: **+0.21 MAE**
10. **Motivation Level**: **+0.20 MAE**

*Note: Feature importance represents statistical association within this dataset, not independent causal proof.*

---

## 📂 Project Structure

```text
student_success_predictor/
│
├── backend/                              # Production FastAPI Backend (Python 3.12)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                       # FastAPI application & routes
│   │   ├── schemas.py                    # Pydantic request/response schemas
│   │   └── ml_service.py                 # Pipeline loader & inference engine
│   ├── artifacts/                        # Serialized model artifacts
│   │   ├── model_pipeline.joblib         # Fitted Scikit-Learn Ridge pipeline
│   │   ├── model_metadata.json           # Model info, metrics & feature schema
│   │   ├── feature_importance.json       # Permutation importance rankings
│   │   ├── model_comparison.json         # Benchmark comparison data
│   │   ├── distribution.json             # Exam score histogram bins
│   │   └── dataset_summary.json          # Feature schema & sample data
│   ├── tests/
│   │   └── test_api.py                   # Pytest test suite (11 tests)
│   ├── train_and_export.py               # Reproducible model export script
│   ├── requirements.txt                  # Backend dependencies
│   ├── render.yaml                       # Render deployment configuration
│   └── .gitignore
│
├── frontend/                             # Production React Frontend (Vite + TS)
│   ├── src/
│   │   ├── components/                   # Reusable UI components (Sidebar, TopBar, KPICard)
│   │   ├── pages/                        # Overview, Predict, ModelInsights, DatasetExplorer
│   │   ├── lib/api.ts                    # Strongly typed API client
│   │   ├── types/api.ts                  # Pydantic-matched TypeScript interfaces
│   │   ├── App.tsx                       # Application shell & state routing
│   │   ├── index.css                     # Tailwind CSS v4 design system
│   │   └── main.tsx
│   ├── .env.example                      # VITE_API_BASE_URL example
│   ├── package.json                      # React 19, Recharts, Lucide, Tailwind v4
│   ├── vite.config.ts                    # Vite config
│   └── .gitignore
│
├── StudentPerformanceFactors.csv         # Real dataset (6,607 student profiles)
├── app.py                                # Streamlit dashboard (fallback UI)
├── evaluate_models.py                    # Standalone benchmark & CV evaluation script
├── model_comparison.csv                  # Benchmark metrics across all candidate models
├── feature_importance_permutation.csv    # Permutation importance scores on test data
├── requirements.txt                      # Root/Streamlit dependencies
├── README.md                             # Project documentation
├── render.yaml                           # Root Render Blueprint specification
└── concept_note.md                       # Internship concept document
```

---

## 🚀 FastAPI Backend: Local Setup & Endpoints

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Export / Retrain Model Artifact (Optional if artifacts exist)
```bash
python train_and_export.py
```
*(Fits the Ridge pipeline on `StudentPerformanceFactors.csv` and serializes `model_pipeline.joblib` and `model_metadata.json` into `backend/artifacts/`.)*

### 3. Run FastAPI Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API documentation will be available at: **`http://127.0.0.1:8000/docs`**.

### 4. Run Automated Test Suite
```bash
pytest tests/test_api.py -v
```

---

## 🌐 API Reference

### 1. `GET /health`
Returns service readiness and whether the ML model is loaded.
```json
{
  "status": "ok",
  "model_ready": true,
  "version": "1.0.0",
  "environment": "development"
}
```

### 2. `GET /api/v1/model-info`
Returns model specifications, continuous target scale bounds (55 to 101 points), held-out test evaluation metrics, and input feature constraints.

### 3. `POST /api/v1/predict`
Accepts all 19 input features, runs inference through the serialized pipeline, and returns the predicted score without clipping to 100.

**Sample Request Body:**
```json
{
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
```

**Sample Response Body:**
```json
{
  "predicted_score": 73.25,
  "cohort_mean": 67.24,
  "observed_target_min": 55.0,
  "observed_target_max": 101.0,
  "delta_vs_mean": 6.01,
  "readiness_category": "Proficient Standing (On Track)",
  "recommendations": [
    "Strong attendance habit (85%). Maintaining consistent classroom participation provides ongoing concept reinforcement."
  ],
  "disclaimer": "Responsible AI Notice: Predictions are statistical estimates derived from historical correlation. They are intended strictly for constructive academic advising and early mentorship, not automated grading or high-stakes admissions decisions.",
  "input_summary": { ... }
}
```

### 4. `GET /api/v1/feature-importance`
Returns the 19 permutation feature importances measured on held-out test data.

### 5. `GET /api/v1/metrics`
Returns actual held-out test evaluation metrics and the multi-model comparison table.

### 6. `GET /api/v1/distribution`
Returns 23 empirical histogram bins and cohort stats from the genuine 6,607 records.

### 7. `GET /api/v1/dataset-summary`
Returns column metadata, missing value percentages, and representative student records preview without exposing raw microdata in public client bundles.

---

## 💻 Running the Applications Locally

You can run the full decoupled stack simultaneously using two terminal windows:

### Terminal 1: FastAPI Backend
```bash
cd backend
py -3.12 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### Terminal 2: React + Vite Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173/`

### Optional: Streamlit Fallback
```bash
py -3.12 -m streamlit run app.py
```
- Fallback UI: `http://localhost:8501`

---

---

# 🚀 Complete Deployment Guide: GitHub → Render → Vercel

This guide provides exhaustive, beginner-friendly, click-by-click instructions tailored specifically to the **Student Success Predictor — Veridian Education Intelligence** repository. Follow each step sequentially.

---

## Part A — Final Local Checks

Before publishing to GitHub, verify that both the backend and frontend run locally without issues.

### 1. Open the Project Folder in VS Code
1. Launch **Visual Studio Code**.
2. Click **File → Open Folder...** (or press `Ctrl+K Ctrl+O`).
3. Select your project folder: `student_success_predictor`.
4. Ensure the file tree shows `backend/`, `frontend/`, `app.py`, `README.md`, and `StudentPerformanceFactors.csv`.

### 2. Open Two Terminals in VS Code
- Open the integrated terminal (`Ctrl+\`` or **Terminal → New Terminal**).
- Rename the first terminal tab to **"Backend"**.
- Click the **+** or split button to open a second terminal tab, and rename it to **"Frontend"**.

### 3. Verify Local Backend Execution (Terminal 1)
```powershell
# Navigate into backend directory
cd backend

# Install dependencies if not already installed
py -3.12 -m pip install -r requirements.txt

# Run automated test suite (must pass 11/11 tests)
py -3.12 -m pytest tests/test_api.py -v

# Start FastAPI server
py -3.12 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- Open your browser to `http://127.0.0.1:8000/health`. You should receive:
  ```json
  {"status":"ok","model_ready":true,"version":"1.0.0","environment":"development"}
  ```
- Open Swagger documentation at `http://127.0.0.1:8000/docs` to test endpoints interactively.

### 4. Verify Local Frontend Execution (Terminal 2)
```powershell
# Navigate into frontend directory
cd frontend

# Install Node dependencies
npm install

# Run production build check (verifies TypeScript types & bundling)
npm run build

# Start local Vite development server
npm run dev
```
- Open `http://localhost:5173/` in your browser.
- Verify that the green connection indicator shows **"Veridian Engine Online (Ridge α=7.85)"**.
- Test navigating between **Overview**, **Predict Student Score**, **Model Insights**, and **Dataset Explorer**.
- On the **Predict Student Score** page, click **High Achiever Profile**, then click **Generate Prediction & Advisory Pathway**. Verify that a real score (~81.6 pts) and advisory recommendations appear.

### 5. Troubleshooting Local Issues
- **`Port 8000 already in use`**: Run `netstat -ano | findstr :8000` to find the PID, or kill existing uvicorn processes via Task Manager.
- **`ModuleNotFoundError: No module named 'fastapi'`**: Ensure you are using `py -3.12` and installed dependencies into the correct Python environment.
- **Frontend shows `Backend Connection Notice`**: Verify Terminal 1 is actively running without crash errors.

---

## Part B — Create the GitHub Repository

### 1. Create Repository on GitHub
1. Open [https://github.com/](https://github.com/) in your browser.
2. Sign in with your GitHub account (or click **Sign up** to create a free account).
3. In the top-right corner, click the **+** (plus icon) and select **New repository**.
4. Set **Repository name** to: `student-success-predictor`.
5. Set **Description** to: `Student Success Predictor — Veridian Education Intelligence (FastAPI + React + Ridge Regression)`.
6. Select **Public** *(Recommended for student portfolios and IBM SkillsBuild internship submission so evaluators can inspect your code)*.
7. **DO NOT** check "Add a README file", "Add .gitignore", or "Choose a license" (we already have these files locally).
8. Click the green **Create repository** button.
9. Keep this page open. Note the HTTPS URL: `https://github.com/<YOUR-GITHUB-USERNAME>/student-success-predictor.git`.

### 2. Stage and Commit Your Code Locally
Open a third terminal in VS Code at the **root project directory** (`student_success_predictor`):

```powershell
# Check git status (if not initialized, initialize it)
git status
```
*If Git displays `fatal: not a git repository`, initialize it:*
```powershell
git init
git branch -M main
```

Verify that the `.gitignore` file exists in the root folder. Check what files will be tracked:
```powershell
git status
```

> [!IMPORTANT]
> **Safety Check**: Verify that `.env`, `node_modules`, `dist`, `.pytest_cache`, and virtual environments (`.venv/`) are **NOT** listed in untracked files.
> Ensure that `backend/artifacts/model_pipeline.joblib` and `backend/artifacts/*.json` **ARE** listed, as the backend on Render requires these files for instant inference without retraining.

Stage and commit the files:
```powershell
git add .
git commit -m "feat: complete student success predictor with FastAPI backend, React frontend, and Veridian design system"
```

Link your remote GitHub repository and push:
```powershell
# Replace <YOUR-GITHUB-USERNAME> with your actual GitHub username
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/student-success-predictor.git

# Push code to main branch
git push -u origin main
```

Refresh your GitHub repository in your browser. Confirm that `backend/`, `frontend/`, `README.md`, and `StudentPerformanceFactors.csv` are visible.

---

## Part C — Deploy the FastAPI Backend to Render

Render will host the FastAPI service on its free cloud tier.

### 1. Log In to Render
1. Open [https://render.com/](https://render.com/).
2. Click **Get Started for Free** or **Log In**.
3. Choose **GitHub** to sign in directly with your GitHub credentials.

### 2. Create New Web Service
1. On your Render dashboard, click the blue **New +** button in the top navigation bar.
2. Select **Web Service**.
3. Choose **Build and deploy from a Git repository**, then click **Next**.
4. In the list of repositories, locate `student-success-predictor` and click **Connect**.
   *(If your repository is not listed, click "Configure access" on GitHub and grant Render permission to your repository).*

### 3. Configure the Web Service Settings
Fill in the exact fields as follows:

| Setting | Value to Enter | Explanation |
| :--- | :--- | :--- |
| **Name** | `student-success-predictor-api` | Name of your Render service |
| **Region** | `Singapore` or `Frankfurt` or `Oregon` | Choose region closest to you |
| **Branch** | `main` | Branch Render watches for deploys |
| **Root Directory** | `backend` | **CRITICAL**: Tells Render to run commands inside `backend/` |
| **Runtime** | `Python 3` | Python runtime |
| **Build Command** | `pip install -r requirements.txt` | Installs FastAPI, Scikit-learn, Pandas, etc. |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` | Starts production ASGI server binding to Render's dynamic `$PORT` |
| **Instance Type** | `Free` (0.1 CPU, 512 MB RAM) | Free tier is fully sufficient (our pre-fitted model pipeline is only 7.8 KB) |

### 4. Advanced Settings (Environment Variables & Health Path)
Click **Advanced** at the bottom:
1. **Health Check Path**: Enter `/health`.
2. Under **Environment Variables**, click **Add Environment Variable**:
   - Key: `PYTHON_VERSION`
   - Value: `3.12.0`
   - Key: `ENVIRONMENT`
   - Value: `production`
   - Key: `CORS_ORIGINS`
   - Value: `http://localhost:5173,http://localhost:3000` *(We will append your live Vercel URL in Part D)*

### 5. Deploy & Verify
1. Click the blue **Create Web Service** button.
2. Watch the deployment event log. You should see:
   - `==> Installing dependencies...`
   - `==> Successfully installed fastapi scikit-learn ...`
   - `==> Starting service with 'uvicorn app.main:app --host 0.0.0.0 --port 10000'`
   - `==> Loading Scikit-Learn model pipeline from artifacts/model_pipeline.joblib...`
   - `==> Model pipeline loaded successfully (Ridge, alpha=7.8476)`
   - `==> Application startup complete.`
   - `==> Your service is live 🎉`
3. Copy your live Render URL from the top of the dashboard page (format: `https://student-success-predictor-api-XXXX.onrender.com`).
4. Test the health endpoint in your browser:
   `https://YOUR-RENDER-SERVICE.onrender.com/health`
   You should receive:
   ```json
   {"status":"ok","model_ready":true,"version":"1.0.0","environment":"production"}
   ```
5. Test the docs endpoint: `https://YOUR-RENDER-SERVICE.onrender.com/docs`.

> [!NOTE]
> **Free Tier Sleep Notice**: Render free instances automatically spin down after 15 minutes of inactivity. When a new request arrives, Render spins the container back up in 40–50 seconds. The frontend includes automatic retry messaging explaining this behavior.

---

## Part D — Deploy the React Frontend to Vercel

Vercel will build and host your modern React + TypeScript + Vite application on high-speed global edge networks.

### 1. Log In to Vercel
1. Open [https://vercel.com/](https://vercel.com/).
2. Click **Log In** or **Sign Up**.
3. Choose **Continue with GitHub**.

### 2. Import Project
1. In the Vercel dashboard, click **Add New...** → **Project**.
2. Find `student-success-predictor` in the list of GitHub repositories and click **Import**.

### 3. Configure Project Settings
Configure the exact deployment options:

| Setting | Selection | Explanation |
| :--- | :--- | :--- |
| **Project Name** | `student-success-predictor` | Your Vercel URL will be based on this |
| **Framework Preset** | `Vite` | Auto-detected |
| **Root Directory** | Click **Edit**, select `frontend`, and click **Continue** | **CRITICAL**: Tells Vercel the React app is located in `frontend/` |
| **Build Command** | `npm run build` | Default Vite build |
| **Output Directory** | `dist` | Default Vite output directory |

### 4. Set Environment Variables
Under the **Environment Variables** section:
- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://YOUR-RENDER-SERVICE.onrender.com` *(Paste your actual Render backend URL without trailing slash)*
- Ensure **Production**, **Preview**, and **Development** checkboxes are all checked.
- Click **Add**.

> [!IMPORTANT]
> Vite bakes `VITE_*` environment variables directly into the static bundle during `npm run build`. If you change `VITE_API_BASE_URL` later, you must trigger a new Vercel deployment for the change to take effect.

### 5. Deploy
1. Click the blue **Deploy** button.
2. Vercel will clone the repo, run `npm install`, compile TypeScript (`tsc -b`), run `vite build`, and deploy the output.
3. Upon completion, you will see congratulations confetti and a preview of your application!
4. Note your live production URL (e.g., `https://student-success-predictor.vercel.app` or `https://student-success-predictor-xxxx.vercel.app`).

---

## Part E — Configure Production CORS on Render

Now that your live Vercel URL is known, configure Render to allow browser requests originating from Vercel:

1. Return to your Render dashboard: [https://dashboard.render.com/](https://dashboard.render.com/).
2. Click on your `student-success-predictor-api` web service.
3. In the left sidebar, click **Environment**.
4. Locate the `CORS_ORIGINS` variable (or click **Add Environment Variable** if not present).
5. Set the value to include your local development and your exact Vercel URL:
   ```text
   http://localhost:5173,http://localhost:3000,https://YOUR-VERCEL-DOMAIN.vercel.app
   ```
   *(Replace `https://YOUR-VERCEL-DOMAIN.vercel.app` with your actual Vercel URL, omitting any trailing slash)*.
6. Click **Save Changes**.
7. Render will automatically redeploy the service with updated CORS headers in ~30 seconds.

---

## Part F — Complete the Connection & End-to-End Verification

1. Open your live Vercel URL in a browser tab.
2. Check the top bar: verify that the connection status badge displays **"Veridian Engine Online (Ridge α=7.85)"**.
3. **Overview Page**:
   - Check the 4 KPI cards (6,607 students, 67.2 pts mean, ±0.4523 MAE, 0.7697 R²).
   - Verify the Exam Score Cohort Distribution chart renders with cohort mean reference line (67.2 pts).
4. **Predict Student Score Page**:
   - Click the preset **"High Achiever Profile"**.
   - Click **"Generate Prediction & Advisory Pathway"**.
   - Verify that the result card smoothly fades in, showing an estimated score (~81.6 pts), an **"Exemplary Standing"** badge, cohort comparison (+14.4 pts vs mean), and customized advisory recommendations.
5. **Model Insights Page**:
   - Verify all benchmark figures load from the backend: MAE 0.4523, RMSE 1.8042, R² 0.7697.
   - Verify the Permutation Feature Importance bar chart renders with Attendance (+2.34 MAE) and Hours Studied (+1.70 MAE) leading.
6. **Dataset Explorer Page**:
   - Verify the 20-feature data dictionary and representative student records table render correctly.
7. **Direct URL Refresh Check**:
   - Navigate to `https://YOUR-VERCEL-DOMAIN.vercel.app/` and refresh the browser.
   - Thanks to `frontend/vercel.json`, single-page routing does not produce a 404 error.

---

## Part G — Final Deployment Acceptance Checklist

- [ ] **GitHub Repository**: All files pushed; `.gitignore` prevents `.env`, `node_modules`, and temporary cache files from uploading.
- [ ] **Model Artifacts Tracked**: `backend/artifacts/model_pipeline.joblib` and `backend/artifacts/*.json` are checked into Git.
- [ ] **Render Backend Live**: `https://<YOUR-RENDER-SERVICE>.onrender.com/health` returns `{"status":"ok","model_ready":true}`.
- [ ] **Backend CORS Configured**: `CORS_ORIGINS` on Render contains your Vercel URL.
- [ ] **Vercel Frontend Live**: `VITE_API_BASE_URL` points to your Render backend.
- [ ] **Live Prediction Verified**: Form submits and returns calculated Ridge predictions without errors.
- [ ] **Metrics Verified**: Real empirical metrics displayed (Held-out Test MAE 0.4523, R² 0.7697).
- [ ] **Responsive Design Checked**: Application displays cleanly on desktop (1440px), tablet (768px), and mobile (390px).
- [ ] **Browser Console Clean**: Zero application-breaking errors in browser developer tools.
- [ ] **Streamlit Fallback Intact**: `app.py` remains runnable locally via `py -3.12 -m streamlit run app.py`.

---

## Part H — Exact Commands, Dashboard URLs & Environment Variables Quick Reference

### 1. Dashboard Links
- **GitHub**: [https://github.com/new](https://github.com/new)
- **Render Dashboard**: [https://dashboard.render.com/](https://dashboard.render.com/)
- **Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)

### 2. Exact Render Configuration
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`
- **Environment Variables**:
  - `PYTHON_VERSION`: `3.12.0`
  - `ENVIRONMENT`: `production`
  - `CORS_ORIGINS`: `http://localhost:5173,https://YOUR-VERCEL-DOMAIN.vercel.app`

### 3. Exact Vercel Configuration
- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://YOUR-RENDER-SERVICE.onrender.com`

### 4. Local Commands Summary
```powershell
# Run backend tests
py -3.12 -m pytest backend/tests/test_api.py -v

# Run local FastAPI backend
py -3.12 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend

# Build frontend for production
cd frontend
npm run build

# Run local Vite frontend
npm run dev

# Run Streamlit fallback
py -3.12 -m streamlit run app.py
```

---

## ⚖️ Responsible AI Principles
- **No Automated Grading or High-Stakes Decisions**: Predictions represent statistical estimations based on historical correlations.
- **Empowering Students & Mentors**: Designed exclusively as an early advisory indicator to guide positive study habits and resource allocation.


