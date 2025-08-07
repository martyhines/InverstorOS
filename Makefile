.PHONY: mobile ios web api

mobile:
	cd apps/mobile && npm start

ios:
	cd apps/mobile && npm run ios

web:
	cd apps/mobile && npm run web

api:
	cd services/ai && . .venv/bin/activate || python3 -m venv .venv && . .venv/bin/activate; \
	pip install -r requirements.txt; \
	uvicorn app.main:app --reload --port 8000
