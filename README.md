# StockFlow
## Beauty Inventory Management System

### Project Description

StockFlow is a web-based beauty inventory management
system developed using Python Flask and Firebase Cloud
Firestore. It provides a centralized platform for managing
beauty products, categories, stock movements, and
inventory reports through an interactive interface.

### System Features

- Interactive inventory dashboard
- Product management
- Category management
- Stock-in and stock-out transactions
- Product and category CRUD operations
- Search and filtering
- Inventory monitoring
- Inventory reports
- Input validation
- Responsive user interface
- Firebase Cloud Firestore integration
- Automatic sample data generation

### Technologies Used

- Python 3.10+
- Flask
- Firebase Cloud Firestore
- HTML5
- CSS3
- JavaScript
- PyCharm IDE

### Database Collections

The system uses three connected Firestore collections:

1. Products
2. Categories
3. Stock Movements

### Installation and Configuration

1. Download or clone the GitHub repository.
2. Open the StockFlow project folder in PyCharm.
3. Create a Python virtual environment.
4. Create a Firebase project.
5. Enable Cloud Firestore Database.
6. Generate a Firebase service account private key.
7. Rename the downloaded JSON file to ServiceAccountKey.json.
8. Place the JSON file inside the project root folder.
9. Configure the .env file as shown below.

```env
GOOGLE_APPLICATION_CREDENTIALS=ServiceAccountKey.json
FLASK_DEBUG=false
PORT=5000
```

### Install Dependencies

Open the PyCharm terminal and execute:

```powershell
py -m pip install -r requirements.txt
```

### Generate Sample Data

```powershell
py seed_data.py
```

The optional seed script automatically generates:

- 20 product categories
- 500 fictional beauty products
- 250 stock movement records
- 770 total sample records

The database collections must be empty before running
the seed script. If interrupted, inspect the database
before running it again.

### Run the Application

```powershell
py app.py
```

Open the application in your browser:

http://127.0.0.1:5000

### Verify Firebase Connection

http://127.0.0.1:5000/api/health

### Security and Data Integrity

- Firebase credentials are stored securely outside
  the public repository.
- Environment variables are configured using .env.
- Linked records cannot be deleted.
- Stock movements are append-only audit records.
- Products and categories support CRUD operations.
- Service account credentials must not be uploaded
  to GitHub.

### System Limitations

- Internet connection is required for Firebase Firestore.
- Remote product photography requires internet access.
- Reports and pagination are processed client-side.
- The system does not include user authentication.
- The application is intended for local and educational use.
- Live Firebase operations require local verification.

### Project Purpose

StockFlow was developed as a Final Practical Activity
for Advanced Database Management. It demonstrates
cloud database integration, CRUD operations, connected
collections, data validation, inventory management,
and interactive web application development.

### Academic Information

Subject: Advanced Database Management

Activity: Final Practical Activity

Project Title: StockFlow - Beauty Inventory Management System
