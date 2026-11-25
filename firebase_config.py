import os
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')
_db = None

def get_db():
    global _db
    if _db is None:
        path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', '').strip()
        if not path:
            raise RuntimeError('Set GOOGLE_APPLICATION_CREDENTIALS in .env')
        key = Path(path)
        if not key.is_absolute():
            key = BASE_DIR / key
        if not key.is_file():
            raise FileNotFoundError(f'Firebase service account not found: {key}')
        if not firebase_admin._apps:
            firebase_admin.initialize_app(credentials.Certificate(str(key)))
        _db = firestore.client()
    return _db
