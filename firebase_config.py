import os
import json
import base64
from pathlib import Path
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


@lru_cache(maxsize=1)
def get_db():

    if not firebase_admin._apps:

        encoded = os.getenv(
            "FIREBASE_SERVICE_ACCOUNT_BASE64", ""
        ).strip()

        if encoded:
            data = base64.b64decode(
                encoded, validate=True
            ).decode("utf-8-sig")

            cred = credentials.Certificate(
                json.loads(data)
            )

        else:
            filename = os.getenv(
                "GOOGLE_APPLICATION_CREDENTIALS",
                "Stockflow.json"
            )

            path = Path(filename)

            if not path.is_absolute():
                path = BASE_DIR / path

            if not path.is_file():
                raise FileNotFoundError(
                    "Firebase credentials not found."
                )

            cred = credentials.Certificate(str(path))

        firebase_admin.initialize_app(cred)

    return firestore.client()
