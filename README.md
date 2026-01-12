# 🚘 AutoLuxe - Dealership Management System

![Status](https://img.shields.io/badge/Status-Completed-success)
![Runtime](https://img.shields.io/badge/Runtime-Node.js-green)
![Style](https://img.shields.io/badge/Style-TailwindCSS-blue)

**AutoLuxe** is a modern, responsive web dashboard designed for managing a luxury car dealership. It provides a complete solution for tracking inventory, clients, sales orders, employees, and maintenance services.

Built as a **3rd Year Computer Science Project**, this application utilizes a **Node.js environment** to simulate a production server, resolving CORS issues associated with modern fetch APIs.

## 🌟 Key Features

### 📊 Interactive Dashboard
* **Real-time KPIs:** Tracks total inventory, revenue, active clients, and pending orders.
* **Data Visualization:** 6 dynamic charts using **Chart.js** (Doughnut, Pie, Radar, Line, Bar, Scatter).
* **Dynamic Calculation:** Revenue and stats update automatically when data changes.

### 🛠️ Full Management (5 CRUD Entities)
Create, Read, Update, and Delete functionality for:
1.  **Inventory:** Manage cars (Brand, Model, Price, Status, Fuel).
2.  **Clients:** Track customer details and spending history.
3.  **Orders:** Process sales with **dynamic dropdowns** linking Cars and Clients.
4.  **Employees:** Manage staff roles and sales performance.
5.  **Services:** Track maintenance records and costs.

### 🚀 Advanced Functionalities
* **Smart Search:** Real-time global search filtering across all active tables.
* **Pagination & Sorting:** Efficiently browse inventory with sorting by price/brand/status.
* **Exporting:** Generate professional **PDF Reports** (via `jspdf`) and **CSV** exports.
* **Internationalization (i18n):** Instant language switching between **English** and **Français**.
* **Responsive Design:** Fully mobile-friendly layout with a collapsible sidebar using **Tailwind CSS**.

## 💻 Tech Stack

* **Frontend:** HTML5, CSS3 (Tailwind CSS via CDN), Vanilla JavaScript (ES6+).
* **Environment:** Node.js & NPM (Package Manager).
* **Server:** `http-server` (Lightweight static asset server).
* **Data:** JSON (Simulated REST API via `fetch`).
* **Libraries:**
    * `Chart.js` (Analytics)
    * `jspdf` (PDF Generation)
    * `FontAwesome` (Icons)

## 📂 Project Architecture

The project follows a clean, modular structure:

```text
/AutoLuxe-Project
│
├── index.html          # Main Dashboard View
├── login.html          # Authentication View
├── data.json           # Simulated Database
├── package.json        # Node.js Dependencies & Scripts
│
└── assets
    └── js
        ├── app.js      # Main Logic (CRUD, Charts, Renderers, i18n)
        └── auth.js     # Security (Login/Logout Check)
