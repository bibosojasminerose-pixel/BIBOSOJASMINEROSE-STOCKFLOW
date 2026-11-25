# StockFlow
### Beauty Inventory Management System

## 1. Project Description

StockFlow is a web-based Beauty Inventory Management System
developed using Python Flask and Firebase Cloud Firestore.

The system provides a centralized platform for managing
beauty products, product categories, inventory levels,
stock transactions, and inventory reports.

It allows users to efficiently monitor product availability,
manage inventory records, and track stock-in and stock-out
transactions through an interactive and responsive interface.

---

## 2. System Objectives

- Develop a centralized beauty inventory management system.
- Implement CRUD operations using Cloud Firestore.
- Establish relationships between database collections.
- Automate inventory quantity monitoring.
- Prevent invalid and duplicate inventory records.
- Provide an interactive inventory management interface.
- Demonstrate cloud database integration using Python Flask.

---

## 3. System Features

- Interactive inventory dashboard
- Beauty product management
- Product category management
- Create, Read, Update, and Delete (CRUD) operations
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

---

## 4. Technologies Used

| Technology | Purpose |
|------------|---------|
| Python 3.10+ | Backend programming |
| Flask | Web application framework |
| Firebase Cloud Firestore | Cloud database |
| Firebase Admin SDK | Database integration |
| HTML5 | Website structure |
| CSS3 | Website design and styling |
| JavaScript | Frontend functionality |
| Python Dotenv | Environment configuration |
| PyCharm | Development environment |
| GitHub | Source code repository |

---

## 5. Firebase Configuration

- Firebase Project Name: StockFlow
- Firebase Project ID: stockflow-20266
- Database Platform: Cloud Firestore

### Firebase Links

- [Firebase Console](https://console.firebase.google.com/project/stockflow-20266/overview)
- [Firestore Database](https://console.firebase.google.com/project/stockflow-20266/firestore)

Firebase Console access requires an authorized Google account.

---

## 6. Database Collections

The system uses three connected Firestore collections.

### 6.1 Products Collection

Collection Name: `products`

Stores beauty product information and inventory details.

| Field | Data Type | Description |
|-------|-----------|-------------|
| name | String | Product name |
| sku | String | Unique product identifier |
| category_id | String | Associated category ID |
| quantity | Integer | Available stock quantity |
| price | Number | Product price |
| reorder_level | Integer | Low-stock threshold |
| description | String | Product description |
| created_at | String | Record creation timestamp |
| updated_at | String | Record update timestamp |

### 6.2 Categories Collection

Collection Name: `categories`

Stores beauty product categories.

| Field | Data Type | Description |
|-------|-----------|-------------|
| name | String | Category name |
| description | String | Category description |
| created_at | String | Record creation timestamp |
| updated_at | String | Record update timestamp |

### 6.3 Stock Transactions Collection

Collection Name: `stock_transactions`

Stores stock-in and stock-out transaction history.

| Field | Data Type | Description |
|-------|-----------|-------------|
| product_id | String | Associated product ID |
| product_name | String | Product name |
| type | String | Stock-in or stock-out |
| quantity | Integer | Transaction quantity |
| previous_quantity | Integer | Stock before transaction |
| new_quantity | Integer | Stock after transaction |
| remarks | String | Transaction remarks |
| created_at | String | Transaction timestamp |

---

## 7. Database Relationships

```text
CATEGORIES
    |
    | One-to-Many
    |
PRODUCTS
    |
    | One-to-Many
    |
STOCK_TRANSACTIONS
```

- Each product belongs to an existing category.
- Each category can contain multiple products.
- Each stock transaction references an existing product.
- Each product can have multiple stock transactions.
- Categories associated with products cannot be deleted.
- Products with stock history cannot be deleted.
- Stock transactions are permanent audit records.

---

## 8. Project Structure

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
    │
    └── js/
        └── app.js
```

Note: The .env and ServiceAccountkey.json files are local
configuration files and must not be uploaded to GitHub.

---

## 9. Installation and Setup

### Step 1: Open the Project

Download or clone the GitHub repository.

Open the StockFlow project folder using PyCharm.

### Step 2: Configure Python

Install Python 3.10 or higher and create a virtual environment.

```powershell
py -m venv .venv
```

Activate the virtual environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

### Step 3: Configure Firebase

1. Open the Firebase Console.
2. Select the StockFlow Firebase project.
3. Enable Cloud Firestore Database.
4. Open Project Settings.
5. Select Service Accounts.
6. Click Generate New Private Key.
7. Rename the downloaded JSON file to:

```text
ServiceAccountkey.json
```

8. Place the credential file inside the StockFlow project folder.

### Step 4: Configure Environment Variables

Create a `.env` file inside the project folder.

Add the following configuration:

```env
GOOGLE_APPLICATION_CREDENTIALS=ServiceAccountkey.json
FLASK_DEBUG=false
```

### Step 5: Install Dependencies

Open the PyCharm terminal and execute:

```powershell
python -m pip install -r requirements.txt
```

### Step 6: Generate Sample Data

Execute the following command:

```powershell
python seed_data.py
```

The optional seed script automatically generates up to:

| Collection | Sample Records |
|------------|---------------:|
| Categories | 20 |
| Products | 100 |
| Stock Transactions | 50 |
| **Total** | **170** |

The seed script preserves existing records and skips
existing sample products and duplicate SKUs.

All newly generated records are stored directly in
Firebase Cloud Firestore.

### Step 7: Run the Application

Execute the following command:

```powershell
python app.py
```

Keep the terminal running while using the application.

### Step 8: Access the System

Open the StockFlow website using the following link:

[StockFlow Website](http://127.0.0.1:5000/)

Local URL:

http://127.0.0.1:5000/

The Flask application must be running before accessing
the website.

### Step 9: Verify Firestore Connection

Open the following link:

[Firestore Connection Test](http://127.0.0.1:5000/api/health)

Expected response when the connection is successful:

```json
{
    "success": true,
    "message": "Connected to Cloud Firestore"
}
```

---

## 10. System Modules

### Dashboard

Displays inventory statistics, including:

- Total products
- Total categories
- Total available units
- Low-stock products
- Total inventory value
- Total stock transactions

### Product Management

Allows users to:

- Add new beauty products
- View product information
- Search product records
- Update product information
- Delete eligible products
- Monitor product quantities and prices

### Category Management

Allows users to:

- Add product categories
- View existing categories
- Update category information
- Delete unused categories

### Stock Transactions

Allows users to:

- Record stock-in transactions
- Record stock-out transactions
- Automatically update product quantities
- View transaction history
- Prevent insufficient stock transactions

### Inventory Reports

Provides an overview of inventory information,
stock availability, product values, and stock movements.

---

## 11. CRUD Operations

| Operation | Function |
|-----------|----------|
| Create | Add new database records |
| Read | Retrieve and display database records |
| Update | Modify existing database records |
| Delete | Remove eligible database records |

### CRUD Implementation

| Collection | Create | Read | Update | Delete |
|------------|--------|------|--------|--------|
| Products | Yes | Yes | Yes | Yes |
| Categories | Yes | Yes | Yes | Yes |
| Stock Transactions | Yes | Yes | No | No |

Stock transactions cannot be edited or deleted because
they serve as permanent inventory audit records.

Products and categories with linked records are protected
against deletion to maintain database integrity.

---

## 12. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main dashboard |
| GET | `/api/health` | Check Firestore connection |
| GET | `/api/summary` | Dashboard statistics |
| GET | `/api/products` | Retrieve all products |
| POST | `/api/products` | Create product |
| GET | `/api/products/<id>` | View single product |
| PUT | `/api/products/<id>` | Update product |
| DELETE | `/api/products/<id>` | Delete product |
| GET | `/api/categories` | Retrieve all categories |
| POST | `/api/categories` | Create category |
| GET | `/api/categories/<id>` | View single category |
| PUT | `/api/categories/<id>` | Update category |
| DELETE | `/api/categories/<id>` | Delete category |
| GET | `/api/stock_transactions` | Retrieve transactions |
| GET | `/api/stock_transactions/<id>` | View transaction |
| POST | `/api/stock-transactions` | Record stock movement |

---

## 13. Data Validation

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

---

## 14. Database Integration

StockFlow uses Firebase Cloud Firestore as its cloud database.

Product and category CRUD operations are performed directly
through the Flask backend and Firebase Admin SDK.

Stock-in and stock-out operations use atomic Firestore
transactions to update product quantities and save the
corresponding stock transaction records.

The system stores and retrieves persistent database records
instead of relying on hardcoded frontend sample data.

---

## 15. Security and Privacy

Firebase service account credentials must remain private.

The following files and folders must not be uploaded to GitHub:

```text
.env
ServiceAccountkey.json
.venv/
__pycache__/
```

Recommended `.gitignore` configuration:

```gitignore
.env
.venv/
venv/
__pycache__/
*.pyc
ServiceAccount*.json
.idea/
```

Use the `.env.example` file as a configuration reference
without exposing confidential credentials.

---

## 16. System Limitations

- Internet connection is required for Cloud Firestore.
- Remote product photography requires internet access.
- Reports and pagination are processed client-side.
- The system does not include user authentication.
- The system is intended for local and educational use.
- Stock transaction records are append-only.
- Live Firebase connectivity must be verified locally.
- The localhost website is not publicly accessible.
- Full CRUD operations apply to products and categories.

---

## 17. Academic Information

| Information | Details |
|-------------|---------|
| Project Title | StockFlow - Beauty Inventory Management System |
| Subject | Advanced Database Management |
| Activity | Final Practical Activity |
| Database Platform | Firebase Cloud Firestore |
| Development Environment | PyCharm |
| Programming Language | Python |
| Web Framework | Flask |
| Project Type | Web-Based Inventory Management System |

---

## 18. Conclusion

StockFlow demonstrates the practical implementation of
cloud database management through inventory monitoring,
CRUD operations, connected database collections,
data validation, and automated stock transactions.

The system provides an organized and efficient approach
to managing beauty inventory using modern web technologies
and Firebase Cloud Firestore.

---

**StockFlow - Beauty Inventory Management System**

Developed for educational and academic purposes.
