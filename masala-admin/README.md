# Masala World - Admin App (React + Vite)

Backend: `../backend` (FastAPI). Idhu separate app - port **5174**.

```bash
cd masala-admin
npm install
npm run dev
```

`.env`-la backend URL:
```
VITE_API_URL=http://localhost:8000
VITE_STOREFRONT_URL=http://localhost:5173
```
(`VITE_STOREFRONT_URL` = seed products-oda `/images/...` thumbnails storefront-la irundhu kaattrathukku.)

Login: `admin@masalaworld.com` / `Admin@12345` (backend `.env`-la maathalaam).

## Pages
Dashboard · Orders (status tabs, search, pagination) · Order detail (edit items, status flow, timeline) ·
Products (add/edit/stock/hide/image upload) · Categories · Coupons · Reviews (approve) · Enquiries.

Ella list-layum backend pagination use aagudhu (`?page=&size=`).
