# Masala World - Full Project

```
masala-ecommerce/
  frontend/      Customer storefront (React + Vite)   -> http://localhost:5173
  masala-admin/  Admin panel (React + Vite)           -> http://localhost:5174
  backend/       FastAPI + MySQL API                  -> http://localhost:8000/docs
```

## Run order
1. **backend**: `.env` create (copy `.env.example`), `pip install -r requirements.txt`, `python seed.py`, `uvicorn app.main:app --reload --port 8000`
2. **masala-admin**: `npm install`, `npm run dev`  (login: admin@masalaworld.com / Admin@12345)
3. **frontend**: `npm install`, `npm run dev`  (innum static data use pannudhu - API connect pannanum)

Details: `backend/README.md`, `masala-admin/README.md`
