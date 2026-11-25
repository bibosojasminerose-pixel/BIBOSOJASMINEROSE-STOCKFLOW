# StockFlow
## Beauty Inventory Management System

## Project Description

StockFlow is a web-based Beauty Inventory Management System
developed using Python Flask and Firebase Cloud Firestore.

The system provides a centralized platform for managing
beauty products, product categories, inventory levels,
stock transactions, and inventory reports.

It allows users to efficiently monitor product availability,
manage inventory records, and track stock-in and stock-out
transactions through an interactive user interface.

## System Features

- Interactive inventory dashboard
- Beauty product management
- Product category management
- Create, Read, Update, and Delete (CRUD) operations
  for products and categories
- Single-record viewing
- Search and filtering
- Stock-in and stock-out transactions
- Automatic stock quantity updates
- Low-stock monitoring
- Inventory value calculation
- Inventory reports
- Duplicate SKU prevention
- Input validation
- Connected database collections
- Automatic sample data generation
- Responsive website design

## Technologies Used

- Python 3.10+
- Flask
- Firebase Cloud Firestore
- Firebase Admin SDK
- HTML5
- CSS3
- JavaScript
- Python Dotenv
- PyCharm IDE

## Firebase Configuration

Firebase Project Name: StockFlow

Firebase Project ID: stockflow-20266

Database: Cloud Firestore

Firebase Console:
https://console.firebase.google.com/project/stockflow-20266/overview

Firestore Database:
https://console.firebase.google.com/project/stockflow-20266/firestore

## Database Collections

The system uses three connected Firestore collections.

### 1. products

Stores beauty product information.

Fields:

- name
- sku
- category_id
- quantity
- price
- reorder_level
- description
- created_at
- updated_at

### 2. categories

Stores product category information.

Fields:

- name
- description
- created_at
- updated_at

### 3. stock_transactions

Stores inventory movement records.

Fields:

- product_id
- product_name
- type
- quantity
- previous_quantity
- new_quantity
- remarks
- created_at

## Database Relationships

- Each product belongs to a product category.
- Each stock transaction references an existing product.
- Categories associated with products cannot be deleted.
- Products with stock transaction history cannot be deleted.
- Stock transactions are permanent audit records.

## Project Structure

```text
StockFlow/
│
├── app.py
├── firebase_config.py
├── seed_data.py
├── main.py
├── requirements.txt
├── README.md
├── .env
├── .env.example
├── .gitignore
├── ServiceAccountkey.json
│
├── templates/
│   └── index.html
│
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

## Installation and Setup

### Step 1: Open the Project

Download or clone the GitHub repository and open the
StockFlow project folder using PyCharm.

### Step 2: Configure Python

Create and activate a Python 3.10 or higher virtual
environment.

### Step 3: Configure Firebase

1. Open the Firebase Console.
2. Select the StockFlow Firebase project.
3. Enable Cloud Firestore Database.
4. Open Project Settings.
5. Select Service Accounts.
6. Generate a new private key.
7. Rename the downloaded JSON file to:

   ServiceAccountkey.json

8. Place the credential file inside the project root folder.

### Step 4: Configure Environment Variables

Create a .env file containing:

```env
GOOGLE_APPLICATION_CREDENTIALS=ServiceAccountkey.json
FLASK_DEBUG=false
```

### Step 5: Install Dependencies

Open the PyCharm terminal and execute:

```powershell
py -m pip install -r requirements.txt
```

### Step 6: Generate Sample Data

Execute the following command:

```powershell
py seed_data.py
```

The optional seed script generates up to:

| Collection | Sample Records |
|------------|---------------:|
| Categories | 20 |
| Products | 100 |
| Stock Transactions | 50 |
| Total | 170 |

The seed script preserves existing records and skips
existing sample products and duplicate SKUs.

All newly generated records are stored directly in
Firebase Cloud Firestore.

### Step 7: Run the Application

Execute:

```powershell
py app.py
```

### Step 8: Access the System

Open the following URL in your web browser:

http://127.0.0.1:5000/

### Step 9: Verify Firestore Connection

Open:

http://127.0.0.1:5000/api/health

Expected response when the connection is successful:

```json
{
    "success": true,
    "message": "Connected to Cloud Firestore"
}
```

## CRUD Operations

### Create

Allows users to add new beauty products, categories,
and stock transactions to Cloud Firestore.

### Read

Allows users to retrieve, display, search, and view
individual inventory records.

### Update

Allows users to modify existing product and category
information.

### Delete

Allows users to remove eligible product and category
records while maintaining database integrity.

Stock transactions cannot be edited or deleted because
they serve as permanent inventory audit records.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Main dashboard |
| GET | /api/health | Check Firestore connection |
| GET | /api/summary | Dashboard statistics |
| GET | /api/products | Retrieve products |
| POST | /api/products | Create product |
| GET | /api/products/<id> | View product |
| PUT | /api/products/<id> | Update product |
| DELETE | /api/products/<id> | Delete product |
| GET | /api/categories | Retrieve categories |
| POST | /api/categories | Create category |
| GET | /api/categories/<id> | View category |
| PUT | /api/categories/<id> | Update category |
| DELETE | /api/categories/<id> | Delete category |
| GET | /api/stock_transactions | Retrieve transactions |
| GET | /api/stock_transactions/<id> | View transaction |
| POST | /api/stock-transactions | Record stock movement |

## Data Validation

The system implements the following validation rules:

- Required field validation
- Duplicate SKU prevention
- Valid product category references
- Valid product references
- Non-negative product quantities
- Valid product prices
- Valid reorder levels
- Positive stock transaction quantities
- Insufficient stock prevention
- Linked-record deletion prevention

## Security

The following files must not be uploaded to GitHub:

- ServiceAccountkey.json
- .env
- .venv/
- __pycache__/

Firebase service account credentials must remain private.

Use the .env.example file as a configuration reference
without exposing confidential credentials.

## System Limitations

- Internet connection is required for Cloud Firestore.
- Remote product photography requires internet access.
- Reports and pagination are processed client-side.
- The system does not include user authentication.
- The system is intended for local and educational use.
- Stock transaction records are append-only.
- Live Firebase connectivity must be verified locally.

## Project Objectives

- To develop a centralized beauty inventory management system.
- To implement CRUD operations using Cloud Firestore.
- To establish relationships between database collections.
- To automate inventory quantity monitoring.
- To prevent invalid and duplicate inventory records.
- To provide an interactive inventory management interface.
- To demonstrate cloud database integration using Python Flask.

## Academic Information

Project Title: StockFlow - Beauty Inventory Management System

Subject: Advanced Database Management

Activity: Final Practical Activity

Database Platform: Firebase Cloud Firestore

Development Environment: PyCharm

Programming Language: Python

## Conclusion

StockFlow demonstrates the practical implementation of
cloud database management through inventory monitoring,
CRUD operations, connected database collections,
data validation, and automated stock transactions.

The system provides an organized and efficient approach
to managing beauty inventory using modern web technologies
and Firebase Cloud Firestore.
