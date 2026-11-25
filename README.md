# Rosé Vanity
Flask and Firebase Firestore beauty inventory. Open this folder in PyCharm. Use a Python 3.10+ virtual environment. Copy your Firebase service account JSON into this folder as `ServiceAccountkey.json`, or update `.env` to match its actual filename. Enable Cloud Firestore in your Firebase project. Never commit the credential file.

```powershell
py -m pip install -r requirements.txt
py seed_data.py
py app.py
```
Open http://127.0.0.1:5000. Test http://127.0.0.1:5000/api/health. The seed script is optional and requires empty collections. It inserts 20 categories, 500 fictional products and 250 consistent stock movements. If interrupted, inspect the database before retrying. Product and category CRUD follows the original backend; stock transactions are append-only audit records. Linked records cannot be deleted. Reports and pagination are client-side. The original backend has no authentication; use locally, not as a public production service. Photography uses a remote Unsplash image and requires internet. Live Firebase operations have not been tested here.
