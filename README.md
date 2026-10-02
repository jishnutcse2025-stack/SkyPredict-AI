# SkyPredict AI — Intelligent Flight Delay Prediction & Aviation Analytics System

> **Smarter Predictions. Smoother Journeys.**

SkyPredict AI is an end-to-end full-stack flight delay prediction and aviation intelligence web application. Designed for airlines, operations research analysts, and passengers, it integrates historical operational flight data with multiple machine learning algorithms to predict departure delay risks, estimate delay durations, provide transparent feature attribution (SHAP/importance), compare model algorithms, analyze route corridors, maintain prediction audit histories, and generate downloadable executive PDF and CSV reports.

---

## Key Features

1. **Operations Command Center (Dashboard)**
   - High-level flight operations metrics (Total Flights, Delays, On-Time Cleared, Mean Delay Minutes).
   - Dynamic Recharts visualizations: 24-hour departure hour delay trends, reliability pie distributions, carrier delay rankings, most delayed routes, and BTS taxonomy delay root-cause breakdowns.
   - Live stream of recent flight predictions with quick navigation actions.

2. **Predict Flight & Counterfactual What-If Simulator**
   - Interactive flight submission form (Origin, Destination, Carrier, Departure Date, Departure Hour, Weather Conditions).
   - Multi-algorithm inference (XGBoost, Random Forest, Decision Tree, Logistic Regression) and continuous delay duration estimation.
   - Transparent SHAP/Attribution drivers showing relative percentage impact and directional propensity.
   - **What-If Simulator**: Adjust departure hours and weather dynamics to simulate alternative schedules and compare probability shifts and duration deltas.

3. **Multi-Model Benchmark & Diagnostics**
   - Head-to-head evaluation across 4 classification models and 3 regression models trained and tested on 15,000 operations.
   - Complete metric matrix: Accuracy, Precision, Recall, F1-Score, and ROC-AUC.
   - Deep-dive diagnostic inspector featuring genuine 2×2 Confusion Matrices (TN, FP, FN, TP), ROC curves with reference baselines, and horizontal Feature Importance bar charts.
   - One-click model switching to activate any trained model as the live inference engine.

4. **Route Operations & Network Intelligence**
   - Corridor performance directory with origin, destination, and airline filtering.
   - Origin hub departure friction and destination airspace congestion charts.
   - **Route Delay Insights**: Empirical, data-backed findings comparing specific corridor delay rates to dataset baselines with sample sizes and peak disruption hours.

5. **Prediction History & Audit Log**
   - Persistent database audit log powered by SQLite (with seamless PostgreSQL support).
   - Search and filter by origin, destination, airline, outcome, and model.
   - Full prediction detail modal and one-click record deletion.
   - Verified outcome reconciliation allowing actual flight departure delays to be entered and compared against model predictions.
   - Direct CSV audit export.

6. **Automated Intelligence Reports**
   - Real, on-demand PDF report generation compiled using ReportLab.
   - Styled with SkyPredict AI's aviation palette (Deep Navy, Royal Blue, Sky Blue, Lavender).
   - Includes executive summaries, comparative metric tables, corridor friction insights, and formal FAA/DOT methodology and statistical limitation disclosures.
   - Direct CSV export for historical logs and route analytics.

---

## Design System & Color Palette

- **Deep Navy**: `#10264A` (Sidebar, primary brand headers, emphasized typography)
- **Royal Blue**: `#2878D4` (Primary actions, key charts, focus rings)
- **Sky Blue**: `#69B7FF` (Accents, highlights, sub-badges)
- **Lavender**: `#8B7CF6` (Analytical surfaces, regression metrics, badges)
- **Teal**: `#24B8A6` (On-time status indicators, positive impacts, cleared flights)
- **Warm Amber**: `#F5A34D` (Delayed status indicators, elevated risk alerts)
- **Cool Pale Blue**: `#EAF2FF` (Clean background surface)
- **Dark Text**: `#17365D` (High-contrast typography in Inter)

---

## Project Structure

```text
Skypredict AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── analytics.py      # Route analytics and delay breakdown
│   │   │   │   ├── dashboard.py      # Operations command center summary
│   │   │   │   ├── history.py        # Prediction audit CRUD & reconciliation
│   │   │   │   ├── models_api.py     # Model benchmark metrics & model switcher
│   │   │   │   ├── predict.py        # Flight prediction & What-If simulator
│   │   │   │   └── reports.py        # PDF (ReportLab) & CSV downloads
│   │   │   └── api_router.py
│   │   ├── core/
│   │   │   └── config.py             # App settings & CORS configuration
│   │   ├── database/
│   │   │   ├── database.py           # SQLAlchemy engine & session factory
│   │   │   └── models.py             # PredictionRecord ORM model
│   │   ├── schemas/
│   │   │   ├── analytics_schema.py
│   │   │   ├── flight.py
│   │   │   ├── model_schema.py
│   │   │   └── report_schema.py
│   │   ├── services/
│   │   │   ├── analytics_service.py  # Empirical dataset aggregations & insights
│   │   │   ├── ml_service.py         # Prediction pipeline & What-If comparison
│   │   │   └── report_service.py     # ReportLab PDF & CSV builder
│   │   └── main.py                   # FastAPI application & startup lifecycle
│   ├── ml/
│   │   ├── artifacts/                # Trained pipelines & model_metrics.json
│   │   ├── data/                     # flights.csv dataset storage
│   │   ├── dataset_generator.py      # US BTS calibrated benchmark dataset generator
│   │   ├── evaluate.py               # Authentic metric computation (Acc, F1, ROC, CM)
│   │   ├── inference.py              # Cached pipeline inference & SHAP explainability
│   │   ├── preprocess.py             # ColumnTransformer & feature definitions
│   │   └── train.py                  # Multi-model training pipeline script
│   ├── tests/
│   │   ├── test_api.py               # End-to-end API integration tests
│   │   ├── test_ml.py                # Pipeline and inference unit tests
│   │   └── test_reports.py           # ReportLab PDF and CSV unit tests
│   ├── requirements.txt              # Backend Python dependencies
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Sidebar, Topbar, StatCard, Loading, Error
│   │   │   ├── models/               # ConfusionMatrix, ROCCurve, FeatureImportance
│   │   │   └── predict/              # PredictionResultPanel, WhatIfSimulator
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx        # Responsive layout wrapper
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx     # Page 1: Dashboard
│   │   │   ├── PredictPage.tsx       # Page 2: Predict Flight & Simulator
│   │   │   ├── ModelComparisonPage.tsx # Page 3: Model Comparison
│   │   │   ├── RouteAnalyticsPage.tsx  # Page 4: Route Analytics & Insights
│   │   │   ├── PredictionHistoryPage.tsx # Page 5: Prediction History
│   │   │   └── ReportsPage.tsx       # Page 6: Intelligence Reports
│   │   ├── services/
│   │   │   └── api.ts                # Typed fetch API client
│   │   ├── types/
│   │   │   └── index.ts              # Domain TypeScript interfaces
│   │   ├── App.tsx                   # React Router definition
│   │   ├── index.css                 # Tailwind v4 theme and styling
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── README.md
└── .gitignore
```

---

## Step-by-Step Setup & Running Guide (Windows PowerShell)

### Prerequisites

- **Python 3.10+** (Python 3.11, 3.12, 3.13, or 3.14)
- **Node.js 18+** & **npm**

---

### Step 1: Backend Setup & Virtual Environment

Open a Windows PowerShell terminal in the project directory:

```powershell
cd "c:\Users\jishnu\Downloads\Skypredict AI\backend"

# (Optional but recommended) Create and activate a Python virtual environment:
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install tested backend dependencies:
python -m pip install -r requirements.txt
```

---

### Step 2: Dataset & Machine Learning Training

The system comes with an automated dataset workflow that generates a 15,000-record historical flight dataset calibrated to US Department of Transportation / Bureau of Transportation Statistics (BTS) industry dynamics if no external file is supplied.

You can also place any external BTS or Kaggle flight operations CSV directly at `backend/ml/data/flights.csv`.

To train all 4 classification models and 3 regression models and calculate authentic evaluation metrics:

```powershell
# From the backend directory:
python -m ml.train
```

This will:
1. Load `backend/ml/data/flights.csv` (or auto-generate it).
2. Clean and preprocess features using `ColumnTransformer` (OneHotEncoding for categoricals, StandardScaler for numericals).
3. Split data into 80% train (12,000 flights) and 20% test (3,000 flights) with random state seed 42.
4. Train **Logistic Regression**, **Decision Tree**, **Random Forest**, and **XGBoost Classifier**.
5. Train **Linear Regression**, **Random Forest Regressor**, and **XGBoost Regressor** for delay duration in minutes.
6. Evaluate held-out test predictions and save serialized models (`*.joblib`) and `model_metrics.json` into `backend/ml/artifacts/`.

---

### Step 3: Run Backend Tests

Verify that all API endpoints, database operations, inference logic, and ReportLab PDF compilation work properly:

```powershell
# From the backend directory:
python -m pytest tests/ -v
```

All 13 test suites will execute and pass.

---

### Step 4: Start the FastAPI Backend Server

```powershell
# From the backend directory:
python -m uvicorn app.main:app --reload --port 8000
```

- API Base: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs (Swagger): `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

---

### Step 5: Frontend Installation & Launch

Open a second PowerShell window:

```powershell
cd "c:\Users\jishnu\Downloads\Skypredict AI\frontend"

# Install frontend dependencies:
npm install

# Start the Vite development server:
npm run dev
```

Open your browser to:
**`http://localhost:5173`**

The Vite development server is configured with an automatic proxy to forward `/api` requests to `http://127.0.0.1:8000`.

---

### Step 6: Frontend Production Build (Optional)

To create an optimized production build:

```powershell
cd "c:\Users\jishnu\Downloads\Skypredict AI\frontend"
npm run build
```

The production assets will be built cleanly into `frontend/dist/`.

---

## Machine Learning Methodology & Target Definition

- **Target Variable (Classification)**: `is_delayed = 1` if departure delay is $\ge 15$ minutes, `0` otherwise (standard US FAA / BTS delay threshold).
- **Target Variable (Regression)**: `dep_delay_min` (continuous departure delay minutes).
- **Input Features Available Pre-Departure (No Target Leakage)**:
  - `origin`, `dest`, `airline`, `sched_dep_hour`, `day_of_week`, `month`, `distance_miles`, `sched_elapsed_min`, `weather_condition`, `temp_c`, `wind_speed_kts`, `visibility_miles`.
  - Actual arrival delay or airborne times are strictly excluded from input features.
- **Model Attribution**: Feature contributions are extracted from trained tree splits and coefficient modulations to explain delay risk direction and magnitude without claiming unverified causal relationships.

---

## Technical Stack Summary

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React, React Router v7 |
| **Backend** | Python 3.14 / 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2, SQLite, ReportLab 5 |
| **Machine Learning** | scikit-learn, XGBoost, SHAP, joblib, pandas, NumPy |
| **Testing** | pytest, pytest-asyncio, httpx, TestClient |

---

## License

SkyPredict AI is developed as an educational and analytical aviation operations intelligence project.
