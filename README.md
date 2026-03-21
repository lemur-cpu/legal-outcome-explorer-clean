# PrecedentIQ

Legal outcome prediction engine for U.S. federal circuit court opinions.
Retrieves semantically similar precedents via vector + BM25 fusion and predicts
appeal outcome (affirmed / reversed) using a calibrated XGBoost classifier.

## Stack

- **Frontend**: Next.js 14, Tailwind CSS
- **API**: FastAPI + Uvicorn
- **Retrieval**: Qdrant (vector search) + BM25 + RRF fusion
- **Classifier**: XGBoost with Platt calibration, SMOTE oversampling
- **Data**: CourtListener v4 API (U.S. circuit courts)
- **Infra**: Docker (Postgres, Qdrant, Redis)

## Evaluation

Trained on 3,633 binary-labeled circuit court opinions (affirmed / reversed).
SMOTE oversampling applied to training set only to correct 8.5:1 class imbalance.

| Model               | F1     | AUC    | ECE    | Threshold |
|---------------------|--------|--------|--------|-----------|
| Logistic Regression | 0.5574 | 0.7191 | 0.3735 | 0.645     |
| XGBoost + Platt     | 0.5668 | 0.6735 | 0.0089 | 0.098     |

XGBoost deployed. Low threshold (0.098) reflects 8.5:1 class imbalance corrected
via SMOTE oversampling on training set only. LR excluded from deployment due to
ECE 0.37 (poorly calibrated).

## Quick Start

```bash
# 1. Start services
docker compose up -d

# 2. Install Python deps
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 3. Set environment
cp backend/.env.example backend/.env
# Add COURTLISTENER_API_KEY to backend/.env

# 4. Run ingestion pipeline
python3 -m pipelines.ingest.download --sample 500
python3 -m pipelines.ingest.parse
python3 -m pipelines.ingest.label

# 5. Embed and train
python3 -m pipelines.embed.batch_embed
python3 -m pipelines.train.build_features
python3 -m pipelines.train.train_classifier
python3 -m pipelines.train.evaluate

# 6. Start API
uvicorn backend.api.main:app --reload --port 8000

# 7. Start frontend
npm install && npm run dev
```

## API

```
GET  /health
POST /api/query   { "query": "..." }
GET  /api/analytics
```
