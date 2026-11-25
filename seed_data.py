"""
ROSÉ VANITY COSMETICS INVENTORY
Automatic Firestore Sample Data Generator

20 Categories
100 Cosmetics Products
50 Stock Transactions

Preserves existing records.
"""

from datetime import datetime, timezone, timedelta
from firebase_config import get_db
import random


CATEGORIES = [
    "Lipstick",
    "Lip Gloss",
    "Lip Balm",
    "Foundation",
    "Concealer",
    "Face Powder",
    "Blush",
    "Bronzer",
    "Highlighter",
    "Eyeshadow",
    "Eyeliner",
    "Mascara",
    "Brow Products",
    "Primer",
    "Setting Spray",
    "Cleanser",
    "Moisturizer",
    "Serum",
    "Sunscreen",
    "Beauty Tools"
]


COLLECTION_NAMES = [
    "Velvet Rose",
    "Bloom Beauty",
    "Pearl Glow",
    "Silk Elegance",
    "Luxe Vanity"
]


def main():

    db = get_db()

    rng = random.Random(42)

    now = datetime.now(timezone.utc)

    stamp = (
        now - timedelta(days=30)
    ).isoformat()

    writes = []

    category_count = 0
    product_count = 0
    transaction_count = 0

    print("=" * 50)
    print("ROSÉ VANITY BEAUTY INVENTORY")
    print("=" * 50)

    print(f"Firebase Project: {db.project}")

    print("\nChecking existing Firestore records...")

    # ==========================================
    # GET EXISTING RECORDS
    # ==========================================

    existing_categories = {
        doc.to_dict().get("name", "").strip().lower(): doc.id
        for doc in db.collection("categories").stream()
    }

    existing_products = {
        doc.id: doc.to_dict()
        for doc in db.collection("products").stream()
    }

    existing_skus = {
        str(record.get("sku", "")).upper()
        for record in existing_products.values()
    }

    existing_transactions = {
        doc.id
        for doc in db.collection("stock_transactions").stream()
    }

    # ==========================================
    # CREATE CATEGORIES
    # ==========================================

    for i, category in enumerate(CATEGORIES):

        category_key = category.lower()

        cid = existing_categories.get(
            category_key,
            f"ROSE-CAT-{i + 1:02d}"
        )

        if category_key not in existing_categories:

            category_ref = db.collection(
                "categories"
            ).document(cid)

            if category_ref.get().exists:

                raise RuntimeError(
                    f"Category ID conflict: {cid}"
                )

            category_record = {
                "name": category,

                "description": (
                    f"Rosé Vanity luxury "
                    f"{category.lower()} collection."
                ),

                "created_at": stamp,
                "updated_at": stamp
            }

            writes.append(
                ("categories", cid, category_record)
            )

            category_count += 1

            print(f"New Category: {category}")

        else:

            print(f"Existing Category: {category}")

        # ==========================================
        # CREATE 5 PRODUCTS PER CATEGORY
        # ==========================================

        for j in range(5):

            n = i * 5 + j + 1

            pid = f"ROSE-SAMPLE-P-{n:04d}"

            sku = f"RV-SAMPLE-{n:04d}"

            tid = f"ROSE-SAMPLE-T-{n:04d}"

            name = (
                f"{COLLECTION_NAMES[j]} {category}"
            )

            # Skip existing products and duplicate SKUs.

            if pid in existing_products:

                print(f"Skipped existing product: {name}")

                continue

            if sku.upper() in existing_skus:

                print(f"Skipped duplicate SKU: {sku}")

                continue

            if tid in existing_transactions:

                print(f"Skipped transaction conflict: {tid}")

                continue

            # ==========================================
            # PRODUCT STOCK AND PRICE
            # ==========================================

            opening = rng.randint(15, 100)

            reorder_level = rng.choice(
                [5, 10, 15]
            )

            if n % 10 == 0:

                opening = rng.randint(1, 5)

            quantity = opening

            updated = stamp

            price = round(
                rng.randint(99, 1499) + 0.50,
                2
            )

            # ==========================================
            # CREATE 50 STOCK TRANSACTIONS
            # ==========================================

            transaction_record = None

            if n <= 50:

                kind = "in" if n % 2 else "out"

                movement = rng.randint(1, 10)

                if kind == "in":

                    quantity = opening + movement

                else:

                    movement = min(movement, opening)

                    quantity = opening - movement

                updated = (
                    now - timedelta(minutes=50 - n)
                ).isoformat()

                transaction_record = {

                    "product_id": pid,

                    "product_name": name,

                    "type": kind,

                    "quantity": movement,

                    "previous_quantity": opening,

                    "new_quantity": quantity,

                    "remarks": (
                        "Sample supplier delivery"
                        if kind == "in"
                        else "Sample customer purchase"
                    ),

                    "created_at": updated

                }

            # ==========================================
            # PRODUCT RECORD
            # ==========================================

            product_record = {

                "name": name,

                "sku": sku,

                "category_id": cid,

                "quantity": quantity,

                "price": price,

                "reorder_level": reorder_level,

                "description": (
                    f"{name} from the Rosé Vanity "
                    "luxury cosmetics collection. "
                    "Fictional sample beauty product."
                ),

                "created_at": stamp,

                "updated_at": updated

            }

            writes.append(
                ("products", pid, product_record)
            )

            existing_skus.add(sku.upper())

            product_count += 1

            if transaction_record is not None:

                writes.append(
                    (
                        "stock_transactions",
                        tid,
                        transaction_record
                    )
                )

                transaction_count += 1

    # ==========================================
    # SAVE TO ACTUAL FIRESTORE
    # ==========================================

    if not writes:

        print("\nSample records already exist.")
        print("No duplicate records were inserted.")

        return

    print("\nSaving records to Cloud Firestore...")

    batch = db.batch()

    for collection, doc_id, record in writes:

        ref = db.collection(
            collection
        ).document(doc_id)

        batch.create(ref, record)

    batch.commit()

    # ==========================================
    # DISPLAY RESULTS
    # ==========================================

    print("\n" + "=" * 50)

    print("SAMPLE DATA INSERTED SUCCESSFULLY")

    print("=" * 50)

    print(f"New Categories   : {category_count}")

    print(f"New Products     : {product_count}")

    print(f"New Transactions : {transaction_count}")

    print(f"Total New Records: {len(writes)}")

    print("=" * 50)

    print("Existing records were preserved.")

    print("Firestore database updated successfully.")

    print("You can now run your Flask application.")


if __name__ == "__main__":

    try:

        main()

    except Exception as error:

        print("\nDATABASE ERROR")

        print(str(error))

        raise