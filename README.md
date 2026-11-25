# StockFlow – Rosé Vanity | Filipina Luxe Edition
Python Flask + Firebase Cloud Firestore. Responsive beauty inventory dashboard, product/category CRUD, append-only stock movements, search and CSV reports.

## Setup (Windows / PyCharm)
Use Python 3.10 or newer. Open this folder. Create Cloud Firestore (default database) in your Firebase project. Generate a NEW service account key, revoke the previously shared key, and save the new file as `ServiceAccountKey.json` beside app.py. Never commit it. The supplied `.env` uses port 5008.

```powershell
python -m pip install -r requirements.txt
python check_firebase.py
python seed_data.py
python app.py
```
Seeding is optional: up to 20 categories, 100 products, 50 movements, preserving existing records. Run only against your intended demo database. Open http://127.0.0.1:5008/ and http://127.0.0.1:5008/api/health. If records fail to load, inspect the terminal traceback and run the connection checker. No live Firebase test was performed during packaging.

## API
GET /api/health, /api/summary; GET/POST /api/products and /api/categories; GET/PUT/DELETE /api/products/<id> and /api/categories/<id>; GET /api/stock_transactions; POST /api/stock-transactions. Transactions are immutable audit records. Linked categories/products cannot be deleted.

## Deployment
This app has no authentication. Keep it local or behind access controls; do not expose real inventory or public write access. For a protected Vercel demo, configure FIREBASE_SERVICE_ACCOUNT as the complete new service account JSON in environment settings (never in Git), and redeploy. Vercel deployment is not verified.

## Filipina Luxe design
Collapsible sidebar, persistent light/dark preference, animated inventory movement bars, modal forms and delete confirmation, category filters, card/table layouts, and responsive CSS. Remote Pexels and Unsplash photographs and Google Fonts require internet. The portrait is an illustrative beauty stock photo; the model's nationality has not been verified. Product photos are decorative, not verified photos of the actual inventory items. Replace the URLs in templates/index.html and static/js/app.js with your own licensed Filipina campaign and product photographs if desired.
