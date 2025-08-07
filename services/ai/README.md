# InvestorOS AI Service (FastAPI)

## Local dev

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check: http://localhost:8000/healthz

## Docker

```bash
docker build -t investoros-ai:local .
docker run --rm -p 8000:8000 investoros-ai:local
```
