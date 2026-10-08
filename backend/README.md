# Masala World - FastAPI + MySQL Backend

Customer storefront (React, port 5173) + Admin app (React, port 5174) rendukkum serve pannum backend.
UUID ids · JWT admin login · ella list-layum pagination · order workflow · dashboard.

## 1. Run pannuradhu (Windows, VS Code terminal)

```bash
cd magic_masala
# indha folder-ah "backend" nu vechukonga (frontend, masala-admin pakkathula)
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

copy .env.example .env        # .env-la DATABASE_URL password maathunga
python seed.py                # database + tables + demo data (safe to re-run)
uvicorn app.main:app --reload --port 8000
```

- Swagger docs: http://localhost:8000/docs  (Authorize button -> admin email/password)
- MySQL-la `masala_store` database illana app thaane create pannum.
- Password-la `@` irundha `.env`-la `%40` nu ezhuthunga.
- Default admin: `admin@masalaworld.com` / `Admin@12345` (.env-la maathalaam)

## 2. Folder structure

```
backend/
  app/
    main.py          app start, CORS, router register
    config.py        .env settings
    database.py      MySQL engine, session
    models.py        tables (UUID primary keys)
    schemas.py       request/response (Pydantic)
    services.py      order pricing, coupon, stock, status flow
    security.py      bcrypt + JWT
    pagination.py    Page response + PageParams
    ratelimit.py     spam protection
    routers/         auth, categories, products, orders, coupons,
                     enquiries, reviews, recipes, dashboard, uploads
  seed.py            demo data
```

## 3. Pagination (ella list API-layum)

`GET /api/products?page=2&size=6`

```json
{ "items": [...], "total": 11, "page": 2, "size": 6, "pages": 2, "has_next": false, "has_prev": true }
```

## 4. Customer APIs (login venaam)

| Method | URL | Notes |
|---|---|---|
| GET | /api/products | search, category (slug), min_price, max_price, spice_level, featured, in_stock, sort (newest/price_asc/price_desc/rating/name), page, size |
| GET | /api/products/{uuid or slug} | single product |
| GET | /api/products/{key}/related | same category products |
| GET/POST | /api/products/{key}/reviews | POST -> admin approve pannina thaan theriyum |
| GET | /api/categories | with product_count |
| GET | /api/recipes, /api/recipes/{slug} | linked products-oda |
| POST | /api/orders | phone required, email optional, coupon_code optional |
| GET | /api/orders/track?order_number=&phone= | status + timeline |
| GET | /api/coupons/validate?code=&subtotal= | discount preview |
| POST | /api/enquiries | kind = bulk / export / contact |
| GET | /api/config | free_shipping_above, shipping_fee |

## 5. Admin APIs (Bearer token)

| Method | URL |
|---|---|
| POST | /api/admin/login (JSON) · /api/admin/token (Swagger form) · GET /api/admin/me |
| GET | /api/admin/dashboard - totals, orders by status, last 7 days sales, top products, low stock |
| CRUD | /api/admin/products (+ PATCH /{id}/stock, PATCH /{id}/toggle, ?low_stock=true) |
| CRUD | /api/admin/categories, /api/admin/coupons, /api/admin/recipes |
| GET/PATCH | /api/admin/orders (?status=&search=&date_from=&date_to=) · PATCH /{id}/items · PATCH /{id}/status |
| GET/PATCH/DELETE | /api/admin/reviews (?status=pending) · PATCH /{id}/moderate |
| GET/PATCH/DELETE | /api/admin/enquiries (?kind=&status=) |
| POST | /api/admin/uploads (image -> /uploads/xxx.png) |

## 6. Order flow

`placed -> under_review -> confirmed -> shipped -> delivered` (cancel before shipped).

- Price, discount, shipping ellam server-la calculate aagum.
- Order place pannum bodhu stock kuraiyum; cancel pannina thirumba varum.
- Admin items edit pannalaam (shipped aagura varaikkum) - stock & total auto adjust.
- Ovvoru status maatramum timeline-la save aagum (customer track page-layum theriyum).
- Product price maariyum order amount maaradhu (name + price snapshot).

## 7. Frontend-la maatha vendiyadhu

- Product `id` ippo UUID. Cart-la `product.id` anuppunga: `{ "product_id": "<uuid>", "quantity": 2 }`.
- Field names: `original_price`, `discount_percent`, `image`, `rating`, `category.name`.
- `src/data/products.js`-ku badhila `GET /api/products?size=50` call pannunga.
