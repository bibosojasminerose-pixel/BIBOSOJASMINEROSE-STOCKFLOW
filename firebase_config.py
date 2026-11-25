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

        firebase_json = os.getenv(
            "FIREBASE_SERVICE_ACCOUNT", ""
        ).strip()

        if firebase_json:

            service_account = json.loads(firebase_json)

            cred = credentials.Certificate(
                service_account
            )

        else:

            filename = os.getenv(
                "GOOGLE_APPLICATION_CREDENTIALS",
                "ServiceAccountKey.json"
            ).strip()

            key_path = Path(filename)

            if not key_path.is_absolute():
                key_path = BASE_DIR / key_path

            if not key_path.is_file():
                matches = [f for f in key_path.parent.glob("*.json")
                           if f.name.casefold() == key_path.name.casefold()]
                if len(matches) == 1:
                    key_path = matches[0]

            if not key_path.is_file():

                raise FileNotFoundError(
                    f"Firebase key not found: {key_path}"
                )

            cred = credentials.Certificate(
                str(key_path)
            )

        firebase_admin.initialize_app(cred)

    return firestore.client()