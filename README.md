# 📚 EnggBookHub - Library Management System

EnggBookHub is a full-stack web application designed for engineering students to easily browse, borrow, and return academic textbooks. The platform features strict role-based access control, offering distinct interfaces for students and administrative staff to manage inventory securely.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6, Fetch API)
- **Backend:** Node.js, Express.js
- **Database:** MySQL (Managed via MySQL Workbench)

---

## 📂 Project Structure

```text
├── backend/
│   ├── middleware/        # Authentication & security controllers
│   │   ├── authMiddleware.js
│   │   └── verifyToken.js
│   ├── routes/            # Express API endpoint structures
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── passwordRoutes.js
│   │   └── studentRoutes.js
│   ├── db.js              # MySQL connection config
│   └── index.js           # Main application engine
├── frontend/              # Clean user interface portals
│   ├── admin-dashboard.html
│   ├── forgot-password.html
│   ├── home.html          # Public landing portal
│   ├── issue_return.html  # Book return form interface
│   ├── login.html         # Portal role gateway
│   ├── manage_books.html  # Book registration system
│   ├── manage_users.html  # Student credential records
│   ├── signup.html        
│   └── student-dashboard.html # Student searching and discovery view
├── .gitignore             # Shields local node_modules & environment keys
└── package.json           
```

---

## 🔄 Core Application Workflow

1. **The Gateway (`home.html`)**: Users land on the homepage to explore resources. Clicking **Borrow Book** or **Return Book** routes them directly to the access wall.
2. **Role Selection (`login.html`)**: A secure credential wall equipped with a dropdown selector forcing authorization as either a **Student** or an **Admin**.
3. **Student Discovery Portal (`student-dashboard.html`)**:
   * **Dashboard Tab**: Real-time lookup filtering allowing students to query materials by title, book ID, or academic subject, plus dropdown filters mapping engineering branches (*Computer Science, Electronics, Mechanical, Civil, Electrical, AI & DS*).
   * **My Books Tab**: A personalized accountability grid tracking currently checked-out materials by **Book Id**, **Borrow Date**, **Due Date**, **Status**, and **Overdue** alerts.
4. **Admin Core Operations (`admin-dashboard.html`)**:
   * **Live Counters**: Real-time analytical tiles displaying **Total Books**, **Total Users**, and **Books Issued** pulled from the MySQL database engine.
   * **Inventory Control (`manage_books.html`)**: Split-pane interface allowing administrators to add physical entries (`Book ID`, `Title`, `Author`, `Quantity`, `Department`) alongside a live table tracking all available library materials.
   * **User Accountability (`manage_users.html`)**: High-visibility data roster showing registered profiles, contact details, and their active borrowed count.
   * **Transaction Auditing (`issue_return.html`)**: Direct input terminal requiring operational IDs (`User ID`, `Book ID`) to successfully manage book drop-offs and process item balances.

---

## 🚀 Local Development Steps

Follow these directions to spin up the local service pipeline on your desktop:

### 1. Prerequisites
Ensure your device has these runtimes ready:
* **Node.js** (LTS build recommended)
* **MySQL Server & MySQL Workbench** 

### 2. Grab the Workspace
```bash
git clone https://github.com
cd LibraryManagementSystem
```

### 3. Establish Local Secrets
Create a file named `.env` directly in your `backend/` directory to configure runtime variables safely:
```text
PORT=5000
DB_HOST=localhost
DB_USER=your_workbench_username
DB_PASSWORD=your_workbench_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_signing_token
```

### 4. Build Environment Assets
Open your system terminal inside the backend directory to compile required dependency chains:
```bash
cd backend
npm install
```

### 5. Initialize the Database using MySQL Workbench
1. Launch **MySQL Workbench** and connect to your local instance.
2. Open a new SQL tab and create your library database schema.
3. Run your table definition scripts (`CREATE TABLE` commands) for users, books, and transactions.

### 6. Start the Engine
Kick off the Node backend pipeline:
```bash
node index.js
```
The server listener will initialize on port `5000`.

### 7. Interact with the Client
Navigate into your local `frontend/` folder using your system file manager and double-click **`home.html`** to run the interface locally within any standard web browser.
