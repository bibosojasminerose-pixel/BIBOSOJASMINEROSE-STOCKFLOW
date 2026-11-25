import os
import re

from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv
from google.cloud import firestore

from firebase_config import get_db


# =====================================================
# FLASK CONFIGURATION
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

load_dotenv(os.path.join(BASE_DIR, ".env"))

app = Flask(__name__)

COLLECTIONS = {
    "products": "products",
    "categories": "categories",
    "stock_transactions": "stock_transactions"
}


# =====================================================
# GENERAL HELPERS
# =====================================================

def utc_now():

    return datetime.now(timezone.utc).isoformat()


def serialize(doc):

    return {
        **(doc.to_dict() or {}),
        "id": doc.id
    }


def response_error(message, status=400):

    return jsonify(
        success=False,
        message=message
    ), status


# =====================================================
# VALIDATION HELPERS
# =====================================================

def text_field(data, key, limit=150, required=True):

    value = data.get(key, "")

    label = key.replace("_", " ").title()

    if not isinstance(value, str):

        raise ValueError(
            f"{label} must be text"
        )

    value = value.strip()

    if required and not value:

        raise ValueError(
            f"{label} is required"
        )

    if len(value) > limit:

        raise ValueError(
            f"{label} is too long"
        )

    return value


def integer_field(data, key, minimum=0):

    value = data.get(key)

    label = key.replace("_", " ").title()

    if isinstance(value, bool) or not re.fullmatch(
        r"\d+",
        str(value if value is not None else "")
    ):

        raise ValueError(
            f"{label} must be a whole number"
        )

    number = int(value)

    if number < minimum or number > 100000000:

        raise ValueError(
            f"{label} is outside the allowed range"
        )

    return number


def money_field(data, key):

    value = data.get(key)

    try:

        if isinstance(value, bool):

            raise InvalidOperation

        number = Decimal(str(value))

    except (InvalidOperation, ValueError):

        raise ValueError(
            f"{key.title()} must be a valid amount"
        )

    if (
        not number.is_finite()
        or number < 0
        or number > Decimal("100000000")
        or number.as_tuple().exponent < -2
    ):

        raise ValueError(
            f"{key.title()} must be between 0 and "
            "100000000 with up to 2 decimal places"
        )

    return float(number)


# =====================================================
# CATEGORY VALIDATION
# =====================================================

def validate_category(data):

    return {

        "name": text_field(
            data,
            "name"
        ),

        "description": text_field(
            data,
            "description",
            500,
            False
        )

    }


# =====================================================
# PRODUCT VALIDATION
# =====================================================

def validate_product(data, existing=None):

    result = {

        "name": text_field(
            data,
            "name"
        ),

        "sku": text_field(
            data,
            "sku",
            60
        ).upper(),

        "category_id": text_field(
            data,
            "category_id",
            100
        ),

        "quantity": integer_field(
            data,
            "quantity"
        ),

        "price": money_field(
            data,
            "price"
        ),

        "reorder_level": integer_field(
            data,
            "reorder_level"
        ),

        "description": text_field(
            data,
            "description",
            500,
            False
        )

    }

    db = get_db()

    category = db.collection(
        "categories"
    ).document(
        result["category_id"]
    ).get()

    if not category.exists:

        raise ValueError(
            "Select an existing category"
        )

    for doc in db.collection("products").stream():

        record = doc.to_dict() or {}

        if (
            doc.id != existing
            and record.get("sku", "").upper()
            == result["sku"]
        ):

            raise ValueError(
                "SKU already exists"
            )

    return result


# =====================================================
# GET ALL RECORDS FROM FIRESTORE
# =====================================================

def list_records(collection):

    return [

        serialize(doc)

        for doc in get_db()
        .collection(collection)
        .stream()

    ]


# =====================================================
# WEBSITE ROUTE
# =====================================================

@app.get("/")
def dashboard():

    return render_template(
        "index.html"
    )


# =====================================================
# FIRESTORE CONNECTION CHECK
# =====================================================

@app.get("/api/health")
def health():

    try:

        list(
            get_db()
            .collection("categories")
            .limit(1)
            .stream()
        )

        return jsonify(

            success=True,

            message="Connected to Cloud Firestore"

        )

    except Exception:

        app.logger.exception(
            "Firestore health check failed"
        )

        return response_error(

            "Cannot connect to Firestore. "
            "Check credentials, permissions and internet.",

            503

        )


# =====================================================
# DASHBOARD SUMMARY
# =====================================================

@app.get("/api/summary")
def summary():

    try:

        products = list_records(
            "products"
        )

        categories = list_records(
            "categories"
        )

        transactions = list_records(
            "stock_transactions"
        )

        total_units = sum(

            product.get("quantity", 0)

            for product in products

        )

        low_stock = sum(

            product.get("quantity", 0)
            <= product.get("reorder_level", 0)

            for product in products

        )

        inventory_value = round(

            sum(

                product.get("quantity", 0)
                * product.get("price", 0)

                for product in products

            ),

            2

        )

        return jsonify(

            success=True,

            data={

                "products": len(products),

                "categories": len(categories),

                "units": total_units,

                "low_stock": low_stock,

                "inventory_value": inventory_value,

                "transactions": len(transactions)

            }

        )

    except Exception:

        app.logger.exception(
            "Summary failed"
        )

        return response_error(
            "Unable to load dashboard",
            503
        )


# =====================================================
# READ ALL RECORDS
# =====================================================

@app.get("/api/<collection>")
def get_all(collection):
    if collection == "stock-transactions":
        collection = "stock_transactions"

    if collection not in COLLECTIONS:

        return response_error(
            "Unknown collection",
            404
        )

    try:

        records = list_records(
            collection
        )

        search = request.args.get(
            "search",
            ""
        ).strip().casefold()

        if search:

            records = [

                record

                for record in records

                if any(

                    search in str(
                        record.get(key, "")
                    ).casefold()

                    for key in (

                        "name",

                        "sku",

                        "description",

                        "type",

                        "remarks"

                    )

                )

            ]

        records.sort(

            key=lambda record:
                str(record.get("created_at") or ""),

            reverse=True

        )

        return jsonify(

            success=True,

            data=records

        )

    except Exception:

        app.logger.exception(
            "List failed"
        )

        return response_error(
            "Unable to load records",
            503
        )


# =====================================================
# READ SINGLE RECORD
# =====================================================

@app.get("/api/<collection>/<doc_id>")
def get_one(collection, doc_id):

    if collection not in COLLECTIONS:

        return response_error(
            "Unknown collection",
            404
        )

    try:

        doc = get_db().collection(
            collection
        ).document(
            doc_id
        ).get()

        if not doc.exists:

            return response_error(
                "Record not found",
                404
            )

        return jsonify(

            success=True,

            data=serialize(doc)

        )

    except Exception:

        app.logger.exception(
            "Read failed"
        )

        return response_error(
            "Unable to read record",
            503
        )


# =====================================================
# CREATE RECORD
# =====================================================

@app.post("/api/<collection>")
def create(collection):

    if collection not in (
        "products",
        "categories"
    ):

        return response_error(

            "Use the stock transaction endpoint "
            "for inventory movements",

            404

        )

    try:

        data = request.get_json(
            silent=True
        )

        if not isinstance(data, dict):

            return response_error(
                "Send a JSON object"
            )

        if collection == "products":

            record = validate_product(
                data
            )

        else:

            record = validate_category(
                data
            )

        record["created_at"] = utc_now()

        record["updated_at"] = record["created_at"]

        ref = get_db().collection(
            collection
        ).document()

        ref.set(record)

        return jsonify(

            success=True,

            message="Record created",

            data={
                "id": ref.id,
                **record
            }

        ), 201

    except ValueError as error:

        return response_error(
            str(error)
        )

    except Exception:

        app.logger.exception(
            "Create failed"
        )

        return response_error(
            "Unable to save record",
            503
        )


# =====================================================
# UPDATE RECORD
# =====================================================

@app.put("/api/<collection>/<doc_id>")
def update(collection, doc_id):

    if collection not in (
        "products",
        "categories"
    ):

        return response_error(
            "This record cannot be edited",
            405
        )

    try:

        data = request.get_json(
            silent=True
        )

        if not isinstance(data, dict):

            return response_error(
                "Send a JSON object"
            )

        ref = get_db().collection(
            collection
        ).document(
            doc_id
        )

        if not ref.get().exists:

            return response_error(
                "Record not found",
                404
            )

        if collection == "products":

            record = validate_product(
                data,
                doc_id
            )

        else:

            record = validate_category(
                data
            )

        record["updated_at"] = utc_now()

        ref.update(record)

        return jsonify(

            success=True,

            message="Record updated",

            data=serialize(
                ref.get()
            )

        )

    except ValueError as error:

        return response_error(
            str(error)
        )

    except Exception:

        app.logger.exception(
            "Update failed"
        )

        return response_error(
            "Unable to update record",
            503
        )


# =====================================================
# DELETE RECORD
# =====================================================

@app.delete("/api/<collection>/<doc_id>")
def delete(collection, doc_id):

    if collection not in (
        "products",
        "categories"
    ):

        return response_error(

            "Transactions are permanent audit records",

            405

        )

    try:

        db = get_db()

        ref = db.collection(
            collection
        ).document(
            doc_id
        )

        if not ref.get().exists:

            return response_error(
                "Record not found",
                404
            )

        # Prevent deletion of categories
        # connected to existing products.

        if collection == "categories":

            if any(

                product.get("category_id") == doc_id

                for product in list_records("products")

            ):

                return response_error(

                    "Category is in use by products",

                    409

                )

        # Preserve products with stock history.

        else:

            if any(

                transaction.get("product_id") == doc_id

                for transaction in list_records(
                    "stock_transactions"
                )

            ):

                return response_error(

                    "Product has stock history "
                    "and cannot be deleted",

                    409

                )

        ref.delete()

        return jsonify(

            success=True,

            message="Record deleted"

        )

    except Exception:

        app.logger.exception(
            "Delete failed"
        )

        return response_error(
            "Unable to delete record",
            503
        )


# =====================================================
# STOCK IN AND STOCK OUT
# ATOMIC FIRESTORE TRANSACTION
# =====================================================

@app.post("/api/stock_transactions")
@app.post("/api/stock-transactions")
def create_transaction():

    try:

        data = request.get_json(
            silent=True
        )

        if not isinstance(data, dict):

            return response_error(
                "Send a JSON object"
            )

        product_id = text_field(

            data,

            "product_id",

            100

        )

        kind = text_field(

            data,

            "type",

            20

        ).lower()

        if kind not in (
            "in",
            "out"
        ):

            raise ValueError(
                "Transaction type must be in or out"
            )

        quantity = integer_field(

            data,

            "quantity",

            1

        )

        remarks = text_field(

            data,

            "remarks",

            500,

            False

        )

        db = get_db()

        product_ref = db.collection(

            "products"

        ).document(

            product_id

        )

        transaction_ref = db.collection(

            "stock_transactions"

        ).document()


        @firestore.transactional
        def commit(tx):

            snapshot = product_ref.get(

                transaction=tx

            )

            if not snapshot.exists:

                raise ValueError(
                    "Product not found"
                )

            product = snapshot.to_dict() or {}

            current = int(
                product.get("quantity", 0)
            )

            if kind == "in":

                new_quantity = current + quantity

            else:

                new_quantity = current - quantity

            if new_quantity < 0:

                raise ValueError(

                    "Not enough stock for this transaction"

                )

            timestamp = utc_now()

            record = {

                "product_id": product_id,

                "product_name": product.get(
                    "name",
                    ""
                ),

                "type": kind,

                "quantity": quantity,

                "previous_quantity": current,

                "new_quantity": new_quantity,

                "remarks": remarks,

                "created_at": timestamp

            }

            tx.update(

                product_ref,

                {

                    "quantity": new_quantity,

                    "updated_at": timestamp

                }

            )

            tx.set(

                transaction_ref,

                record

            )

            return record


        record = commit(
            db.transaction()
        )

        return jsonify(

            success=True,

            message="Stock updated",

            data={

                "id": transaction_ref.id,

                **record

            }

        ), 201

    except ValueError as error:

        return response_error(
            str(error)
        )

    except Exception:

        app.logger.exception(
            "Stock transaction failed"
        )

        return response_error(

            "Unable to record stock transaction",

            503

        )

# =====================================================
# RUN FLASK APPLICATION - STOCKFLOW
# =====================================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "5008")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true"
    )
