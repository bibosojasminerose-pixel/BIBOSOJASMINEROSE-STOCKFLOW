from firebase_config import get_db

if __name__ == "__main__":
    db = get_db()
    print("Firebase project:", db.project)
    for name in ("categories", "products", "stock_transactions"):
        docs = list(db.collection(name).limit(1).stream(timeout=15))
        print(name, ": connected;", "records found" if docs else "empty")
    print("SUCCESS: Firestore read checks passed")
