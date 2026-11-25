import os
import json
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

        # Vercel Cloud Configuration
        firebase_json = os.getenv(
            "FIREBASE_SERVICE_ACCOUNT", ""
        ).strip()

        if firebase_json:

            try:
                service_account = json.loads(firebase_json)

                cred = credentials.Certificate(
                    service_account
                )

            except Exception as e:
                raise RuntimeError(
                    "Invalid Firebase service account configuration."
                ) from e

        else:

            # Local PyCharm Configuration
            filename = os.getenv(
                "GOOGLE_APPLICATION_CREDENTIALS",
                "Stockflow.json"
            ).strip()

            key_path = Path(filename)

            if not key_path.is_absolute():
                key_path = BASE_DIR / key_path

            if not key_path.is_file():
                raise FileNotFoundError(
                    f"Firebase key not found: {key_path}"
                )

            cred = credentials.Certificate(
                str(key_path)
            )

        firebase_admin.initialize_app(cred)

    return firestore.client()
