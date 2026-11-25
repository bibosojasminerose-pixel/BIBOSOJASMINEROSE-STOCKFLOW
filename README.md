# StockFlow – Inventory Management System

## Project Description

StockFlow is a web-based Inventory Management System developed
using Python Flask and Firebase Cloud Firestore. It is designed
to help users efficiently manage products, categories, inventory
levels, and stock transactions through a centralized platform.

The system provides a user-friendly dashboard, real-time database
operations, inventory monitoring, and organized product records.

## Project Objectives

- Centralize product and inventory information.
- Simplify inventory management operations.
- Monitor available stock and low-stock products.
- Record stock-in and stock-out transactions.
- Reduce manual inventory tracking.
- Provide efficient and organized database management.

## System Features

- Interactive Dashboard
- Product Management
- Category Management
- Stock-In and Stock-Out Transactions
- Inventory Monitoring
- Low-Stock Alerts
- Search and Filter Records
- View Individual Records
- Create, Read, Update, and Delete Products and Categories
- Automatic Stock Quantity Calculation
- Input Validation
- Duplicate SKU Prevention
- Firebase Cloud Firestore Integration
- Responsive User Interface

## Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Python
- Flask

### Database

- Firebase Cloud Firestore

### Development Tools

- PyCharm
- GitHub
- Firebase Console

## Database Collections

The system uses three connected Firestore collections.

### 1. Products

- name
- sku
- category_id
- quantity
- price
- reorder_level
- description
- created_at
- updated_at

### 2. Categories

- name
- description
- created_at
- updated_at

### 3. Stock Transactions

- product_id
- product_name
- type
- quantity
- previous_quantity
- new_quantity
- remarks
- created_at

## Database Relationships

- One category can contain multiple products.
- Each product belongs to an existing category.
- One product can have multiple stock transactions.
- Stock transactions automatically update product quantities.
- Stock transactions are permanent audit records.
- Linked products and categories are protected from deletion.

## Project Folder Structure

StockFlow/
├── app.py
├── firebase_config.py
├── seed_data.py
├── requirements.txt
├── .env
├── .env.example
├── .gitignore
├── README.md
├── ServiceAccountKey.json
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── app.js

## Installation and Setup

### Step 1: Clone or Download the Repository

Download the StockFlow project from GitHub and open the
project folder using PyCharm.

### Step 2: Install Required Dependencies

Open the PyCharm terminal and execute:

```powershell
py -m pip install -r requirements.txt
```

### Step 3: Configure Firebase

1. Open the Firebase Console.
2. Create or select a Firebase project.
3. Enable Cloud Firestore.
4. Open Project Settings.
5. Select Service Accounts.
6. Generate a new private key.
7. Save the downloaded JSON file as ServiceAccountKey.json.
8. Place the file inside the StockFlow project folder.

### Step 4: Configure Environment Variables

Create a .env file and add the following configuration:

```env
GOOGLE_APPLICATION_CREDENTIALS=ServiceAccountKey.json
FLASK_DEBUG=false
PORT=5008
```

Make sure the credential filename matches the actual JSON file.

### Step 5: Insert Sample Data (Optional)

To populate empty Firestore collections with sample records,
execute:

```powershell
py seed_data.py
```

Do not run the seed script repeatedly on an existing database.

### Step 6: Run the Application

Execute the following command:

```powershell
py app.py
```

The Flask application will run using port 5008.

## Website URL

Open the StockFlow website using the following link:

[StockFlow Website](http://127.0.0.1:5008/)

Note: This is a local website URL. The Flask application
must be running on your computer before opening the link.

## Firebase Connection Test

To verify the Firebase Cloud Firestore connection, open:

[Firestore Connection Test](http://127.0.0.1:5008/api/health)

Expected successful response:

```json
{
    "success": true,
    "message": "Connected to Cloud Firestore"
}
```

## CRUD Operations

| Operation | Description |
|-----------|-------------|
| Create | Add new products and categories |
| Read | View and search existing records |
| Update | Modify product and category information |
| Delete | Remove eligible products and categories |

Stock transactions support creation and viewing but cannot
be edited or deleted to preserve inventory history.

## Security and Validation

- Required field validation
- Duplicate SKU prevention
- Product and category relationship validation
- Negative stock prevention
- Protected stock transaction history
- Environment variable configuration
- Firebase credential protection

## System Limitations

- Requires an internet connection to access Cloud Firestore.
- Requires valid Firebase credentials.
- The application runs locally using Flask.
- The system does not currently include user authentication.
- Stock transaction records cannot be edited or deleted.

## Important Security Notice

Do not upload the following files to GitHub:

- ServiceAccountKey.json
- .env
- .venv/
- __pycache__/

Firebase credentials must remain private. Use .env.example
to provide a sample environment configuration.

## Academic Purpose

This project was developed as a Final Practical Activity
for the Advanced Database subject. It demonstrates database
integration, CRUD operations, data validation, database
relationships, and web application development using
Python Flask and Firebase Cloud Firestore.

---

**StockFlow – Smart Inventory. Seamless Management.**
