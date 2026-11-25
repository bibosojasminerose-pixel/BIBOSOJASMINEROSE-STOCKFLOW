
# StockFlow – Rosé Vanity

## Beauty Inventory Management System

StockFlow – Rosé Vanity is a web-based Beauty Inventory Management System developed using Python Flask and Firebase Cloud Firestore. It provides a centralized platform for managing beauty products, organizing categories, monitoring stock movements, and generating inventory reports.

The system features an elegant, responsive interface with burgundy, rose wine, champagne, black plum, and ivory colors.

## System Objectives

- Provide centralized management of beauty product inventory.
- Simplify product and category management.
- Monitor incoming and outgoing stock.
- Identify low-stock and out-of-stock products.
- Maintain accurate inventory transaction records.
- Generate inventory reports efficiently.
- Store and retrieve data using Firebase Cloud Firestore.

## System Features

### Dashboard

- Total products
- Total categories
- Total stock units
- Total inventory value
- Low-stock products
- Total stock transactions
- Animated inventory movement charts
- Product category distribution
- Stock-level monitoring

### Product Management

- Add new products
- View product details
- Update existing products
- Delete eligible products
- Search products
- Filter products by category
- Unique SKU validation
- Product card and table views
- Automatic stock-level indicators

### Category Management

- Add product categories
- View category details
- Update categories
- Delete unused categories
- Search categories
- Display associated product counts

### Stock In

- Record incoming inventory
- Select existing products
- Enter incoming quantities
- Automatically increase product stock
- Record transaction remarks
- Maintain stock movement history

### Stock Out

- Record outgoing inventory
- Automatically decrease product stock
- Validate available quantities
- Prevent insufficient stock transactions
- Maintain outgoing transaction records

### Transaction History

- View all inventory movements
- Filter Stock In and Stock Out records
- Search transaction records
- Display previous and updated stock quantities
- Display transaction dates and remarks
- Preserve transaction history as immutable audit records

### Reports

- Inventory summary
- Product stock reports
- Inventory valuation
- Low-stock monitoring
- CSV report export

### User Interface

- Responsive website layout
- Collapsible sidebar navigation
- Dark and light mode
- Persistent theme preference
- Animated dashboard statistics
- Interactive charts
- Professional icons
- Gradient buttons
- CRUD modal forms
- Delete confirmation dialogs
- Toast notifications
- Search and filtering
- Pagination
- Firestore connection indicator
- Automatic connection checking

## Technologies Used

| Technology | Purpose |
|------------|---------|
| Python | Backend programming |
| Flask | Web application framework |
| Firebase Cloud Firestore | NoSQL cloud database |
| Firebase Admin SDK | Database integration |
| HTML5 | Website structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend functionality |
| Chart.js | Dashboard charts |
| Lucide Icons | Interface icons |
| Google Fonts | Website typography |
| PyCharm | Development environment |
| GitHub | Source code repository |
| Vercel | Cloud deployment platform |

## Database Structure

The system uses three interconnected Firebase Cloud Firestore collections.

### 1. Products Collection

Collection name: `products`

| Field | Data Type |
|-------|-----------|
| name | String |
| sku | String |
| category_id | String |
| quantity | Integer |
| price | Number |
| reorder_level | Integer |
| description | String |
| created_at | Date/Time |
| updated_at | Date/Time |

### 2. Categories Collection

Collection name: `categories`

| Field | Data Type |
|-------|-----------|
| name | String |
| description | String |
| created_at | Date/Time |
| updated_at | Date/Time |

### 3. Stock Transactions Collection

Collection name: `stock_transactions`

| Field | Data Type |
|-------|-----------|
| product_id | String |
| product_name | String |
| type | String |
| quantity | Integer |
| previous_quantity | Integer |
| new_quantity | Integer |
| remarks | String |
| created_at | Date/Time |

## Database Relationships

- One category can contain multiple products.
- Each product belongs to a category.
- One product can have multiple stock transactions.
- Each stock transaction references an existing product.
- Categories and products with linked records cannot be deleted when doing so would compromise data integrity.

## Project Structure

```text
StockFlow/
│
├── app.py
├── main.py
├── firebase_config.py
├── check_firebase.py
├── seed_data.py
├── requirements.txt
├── vercel.json
├── README.md
├── .env
├── .env.example
├── .gitignore
├── Stockflow.json
│
├── templates/
│   └── index.html
│
└── static/
    ├── css/
    │   └── style.css
    │
    ├── js/
    │   └── app.js
    │
    └── images/
        └── model.jpg
```

Note: The `.env` and `Stockflow.json` files are private local configuration files and must not be uploaded to GitHub.

## System Requirements

- Python 3.10 or newer
- PyCharm or Visual Studio Code
- Firebase account
- Firebase Cloud Firestore database
- Firebase service account credentials
- Internet connection
- Modern web browser

## Installation and Setup

### Step 1: Clone the Repository

Clone or download the StockFlow repository from GitHub.

Open the project folder using PyCharm.

### Step 2: Create a Virtual Environment

```powershell
python -m venv .venv
```

Activate the virtual environment:

```powershell
.venv\Scripts\Activate.ps1
```

### Step 3: Install Dependencies

```powershell
python -m pip install -r requirements.txt
```

### Step 4: Configure Firebase

1. Open the Firebase Console.
2. Select or create a Firebase project.
3. Enable Cloud Firestore.
4. Open Project Settings.
5. Select Service Accounts.
6. Generate a new private key.
7. Rename the downloaded file to `Stockflow.json`.
8. Place the file inside the StockFlow project folder.

Never share or publicly upload the Firebase private key.

### Step 5: Configure Environment Variables

Create a `.env` file in the project root directory.

```env
GOOGLE_APPLICATION_CREDENTIALS=Stockflow.json
FLASK_DEBUG=false
PORT=5008
```

### Step 6: Test Firebase Connection

Run the connection checker if included in the project:

```powershell
python check_firebase.py
```

The application also provides a health-check API endpoint for verifying the Firebase connection.

### Step 7: Insert Sample Data

This step is optional.

```powershell
python seed_data.py
```

The seed script can populate the database with:

- Up to 20 beauty product categories
- Up to 100 sample beauty products
- Up to 50 stock transactions

Existing records are preserved by the supplied seed script.

### Step 8: Run the Application

```powershell
python app.py
```

## Website URL

Open the StockFlow website using the following link:

[StockFlow – Rosé Vanity](http://127.0.0.1:5008/)

This is a local development URL and is only accessible from the computer running the Flask application.

## Firebase Connection Status

To verify the Firebase connection, open:

[Firebase Health Check](http://127.0.0.1:5008/api/health)

Successful response:

```json
{
    "message": "Connected to Cloud Firestore",
    "success": true
}
```

The website checks the Firestore connection independently of inventory loading and updates the connection indicator when the server responds.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Check Firebase connection |
| GET | /api/summary | Retrieve dashboard statistics |
| GET | /api/products | Retrieve all products |
| POST | /api/products | Create a product |
| GET | /api/products/<id> | View a product |
| PUT | /api/products/<id> | Update a product |
| DELETE | /api/products/<id> | Delete an eligible product |
| GET | /api/categories | Retrieve all categories |
| POST | /api/categories | Create a category |
| GET | /api/categories/<id> | View a category |
| PUT | /api/categories/<id> | Update a category |
| DELETE | /api/categories/<id> | Delete an unused category |
| GET | /api/stock_transactions | Retrieve stock transactions |
| GET | /api/stock-transactions | Retrieve stock transactions |
| GET | /api/stock_transactions/<id> | View transaction details |
| POST | /api/stock-transactions | Record stock movement |

## Data Validation

The system includes validation mechanisms to maintain accurate and consistent inventory records.

- Required field validation
- Unique product SKU validation
- Valid product price
- Non-negative stock quantity
- Non-negative reorder level
- Existing category references
- Existing product references
- Positive stock movement quantities
- Insufficient stock prevention
- Linked-record deletion protection
- Delete confirmation
- Error handling

Stock transactions are preserved as audit records and cannot be edited or deleted through the application.

## Website Design

StockFlow – Rosé Vanity features an elegant beauty-inspired interface designed to provide a professional and user-friendly inventory management experience.

### Color Palette

| Color | Hex Code |
|-------|----------|
| Burgundy | #481426 |
| Black Plum | #21191F |
| Rose Wine | #843B53 |
| Champagne | #DFBF96 |
| Ivory | #F4EBE6 |

The interface incorporates decorative beauty photography, a custom RV monogram, professional icons, smooth animations, responsive layouts, and interactive dashboard components.

External photographs, fonts, icons, and chart libraries may require an internet connection.

Decorative product photographs are illustrative and do not necessarily represent actual inventory items.

## Vercel Deployment

The project can be configured for deployment using Vercel.

1. Upload the project source code to GitHub.
2. Sign in to Vercel.
3. Select Add New Project.
4. Import the StockFlow GitHub repository.
5. Open Environment Variables.
6. Add the following environment variable:

```env
FIREBASE_SERVICE_ACCOUNT
```

7. Set its value to the complete contents of a newly generated Firebase service account JSON file.
8. Deploy or redeploy the application.
9. Open the generated Vercel website URL.
10. Test the deployed `/api/health` endpoint.

The Firebase configuration must support reading credentials from the environment variable.

Successful Vercel deployment must be verified separately.

## Security and Privacy

The following files must not be uploaded to GitHub:

- `.env`
- `Stockflow.json`
- Firebase service account private keys
- Virtual environment files

Firebase credentials must be stored securely.

The application currently does not include user authentication or role-based access control. It is intended for academic demonstrations and controlled environments. Public deployment should be protected by appropriate access controls.

## Troubleshooting

### Firestore Connection Failed

- Verify the Firebase service account filename.
- Check the `.env` configuration.
- Confirm that Cloud Firestore is enabled.
- Check your internet connection.
- Restart the Flask application.
- Test the `/api/health` endpoint.

### Website Remains on Connecting

- Verify that `/api/health` returns a successful response.
- Check the browser console for JavaScript errors.
- Confirm that `static/js/app.js` is loaded.
- Press Ctrl + Shift + R to clear cached website resources.

### Unable to Load Records

- Check the Flask terminal for error messages.
- Verify the Firestore collection names.
- Confirm that the Firebase credentials have database access.
- Check the API endpoints individually.

### Port Already in Use

StockFlow uses port 5008 by default.

Stop any existing application using the same port before restarting Flask.

## Future Enhancements

- User authentication
- Role-based access control
- Barcode scanning
- Supplier management
- Purchase order management
- Product expiration monitoring
- Automatic low-stock notifications
- PDF report generation
- Sales monitoring
- Advanced inventory analytics

## Academic Purpose

This project was developed as a practical activity for Advanced Database Management, demonstrating the implementation of a cloud-based NoSQL database using Firebase Cloud Firestore, Python Flask, interconnected collections, CRUD operations, data validation, and responsive web development.

## Project Information

- Project Name: StockFlow – Rosé Vanity
- System Type: Beauty Inventory Management System
- Database: Firebase Cloud Firestore
- Backend: Python Flask
- Frontend: HTML, CSS, and JavaScript
- Development Environment: PyCharm
- Academic Year: 2026–2027

---

**StockFlow – Rosé Vanity**

*Timeless beauty. Effortless elegance.*

Developed for educational and academic purposes.
