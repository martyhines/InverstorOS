# InvestorOS Monorepo (MVP scaffold)

## Apps
- apps/mobile (Expo React Native, TS)
- services/ai (FastAPI service)
- infra/firebase (Firebase config)

## Getting started

### Mobile (Expo)
```bash
cd apps/mobile
npm i
cp .env.example .env # put your API URL and Firebase keys
npm run ios # or: npm run android / npm run web
```

### AI Service (FastAPI)
```bash
cd services/ai
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Health: http://localhost:8000/healthz

### Firebase (manual init)
- Login: `npm i -g firebase-tools && firebase login`
- Initialize (optional now): `firebase use investoros-dev`
- Emulators: `firebase emulators:start` (after you run `firebase init` in `infra/firebase` if desired)

### Env
- Mobile uses `apps/mobile/.env` loaded by `app.config.ts` and exposed in `extra`.
- Set `EXPO_PUBLIC_API_URL` for device testing (e.g., `http://YOUR_LAN_IP:8000`).
- Add Firebase web app keys to enable Auth.

## Next
- Wire mobile app to call `/ai/deals/underwrite`
- Add uploads pipeline and paywall
