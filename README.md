# StockFlow – Inventory Management System

## Project Description

StockFlow is a web-based Inventory Management System developed using Python Flask and Firebase Cloud Firestore. It provides a centralized platform for managing products, categories, inventory levels, and stock transactions.

The system simplifies inventory management through an interactive dashboard, organized records, automatic stock calculations, and cloud database integration.

## Website URL

Open the StockFlow website using the following link:

[StockFlow Website](http://127.0.0.1:5008/)

Note: The Flask application must be running before accessing the website.

## System Features

- Interactive Dashboard
- Product Management
- Category Management
- Stock-In and Stock-Out Management
- Inventory Monitoring
- Low-Stock Monitoring
- Inventory Value Calculation
- Search and Filter Records
- View Individual Records
- Create, Read, Update, and Delete Operations
- Automatic Stock Quantity Updates
- Duplicate SKU Prevention
- Input Validation
- Responsive Website Design
- Firebase Cloud Firestore Integration

## Technologies Used

| Technology | Purpose |
|------------|---------|
| Python | Backend Programming |
| Flask | Web Application Framework |
| HTML5 | Website Structure |
| CSS3 | Website Design |
| JavaScript | Interactive Functionality |
| Firebase Cloud Firestore | Cloud Database |
| PyCharm | Development Environment |
| GitHub | Source Code Repository |

## Database Collections

The system consists of three connected Firestore collections.

### 1. Products

| Field | Description |
|-------|-------------|
| name | Product name |
| sku | Unique stock keeping unit |
| category_id | Reference to product category |
| quantity | Available stock quantity |
| price | Product price |
| reorder_level | Minimum stock level |
| description | Product description |
| created_at | Record creation date |
| updated_at | Record modification date |

### 2. Categories

| Field | Description |
|-------|-------------|
| name | Category name |
| description | Category description |
| created_at | Record creation date |
| updated_at | Record modification date |

### 3. Stock Transactions

| Field | Description |
|-------|-------------|
| product_id | Reference to product |
| product_name | Product name |
| type | Stock In or Stock Out |
| quantity | Transaction quantity |
| previous_quantity | Previous stock quantity |
| new_quantity | Updated stock quantity |
| remarks | Additional transaction details |
| created_at | Transaction creation date |

## Database Relationships

- One category can contain multiple products.
- Each product belongs to an existing category.
- One product can have multiple stock transactions.
- Stock transactions automatically update product quantities.
- Products with transaction history are protected from deletion.
- Categories connected to existing products cannot be deleted.

## CRUD Operations

| Operation | Functionality |
|-----------|---------------|
| Create | Add products, categories, and stock transactions |
| Read | Display, search, and view existing records |
| Update | Modify product and category information |
| Delete | Remove eligible products and categories |

Stock transactions are permanent audit records and cannot be edited or deleted.

## Project Folder Structure

```text
StockFlow/
│
├── app.py
├── firebase_config.py
├── seed_data.py
├── requirements.txt
├── .env
├── .env.example
├── .gitignore
├── README.md
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

### Step 1: Download the Project

Clone or download the GitHub repository and open the StockFlow project folder in PyCharm.

### Step 2: Install Dependencies

Open the PyCharm terminal and execute:

```powershell
py -m pip install -r requirements.txt
```

### Step 3: Configure Firebase

1. Visit https://console.firebase.google.com/
2. Create or select a Firebase project.
3. Enable Cloud Firestore.
4. Open Project Settings.
5. Select Service Accounts.
6. Generate a new private key.
7. Rename the downloaded JSON file to ServiceAccountKey.json.
8. Place the file inside the StockFlow project folder.

### Step 4: Configure Environment Variables

Create a `.env` file inside the project folder.

```env
GOOGLE_APPLICATION_CREDENTIALS=ServiceAccountKey.json
FLASK_DEBUG=false
PORT=5008
```

Ensure that the credential filename matches the actual Firebase service account JSON file.

### Step 5: Generate Sample Data (Optional)

Execute the following command to populate empty Firestore collections with sample records:

```powershell
py seed_data.py
```

Only run the seed script when the required collections are empty.

### Step 6: Run the Application

Execute:

```powershell
py app.py
```

The application will run at:

http://127.0.0.1:5008/

## Firebase Connection Test

To verify the database connection, open:

[Check Firestore Connection](http://127.0.0.1:5008/api/health)

Expected response:

```json
{
    "success": true,
    "message": "Connected to Cloud Firestore"
}
```

## Data Validation and Security

- Required field validation
- Duplicate SKU prevention
- Valid product category references
- Negative stock prevention
- Price and quantity validation
- Protected transaction history
- Firebase credential protection
- Environment variable configuration

## System Limitations

- Requires an internet connection to access Cloud Firestore.
- Requires valid Firebase credentials.
- The application currently runs on a local Flask server.
- User authentication is not currently implemented.
- Stock transaction records cannot be modified or deleted.
- The local website URL is not publicly accessible.

## GitHub Security Notice

The following files must not be uploaded to GitHub:

- ServiceAccountKey.json
- .env
- .venv/
- __pycache__/

Firebase service account credentials must remain private.

Use `.env.example` to provide the required environment configuration without exposing sensitive information.

## Academic Purpose

This project was developed as a Final Practical Activity for the Advanced Database subject.

It demonstrates the practical application of cloud database management, CRUD operations, database relationships, input validation, inventory management, and web application development using Python Flask and Firebase Cloud Firestore.

## Project Status

Developed for local execution and academic demonstration.

---

# StockFlow

**Smart Inventory. Seamless Management.**

Powered by Python Flask and Firebase Cloud Firestore.
