# InnSight: Smart & Real-Time Hotel Management System

InnSight is a comprehensive, modern hotel management platform designed for a Final Year Project. It features a complete end-to-end digital experience with dedicated portals for Customers, Staff, and Administrators.

Built using a modern web stack: **React (Vite + Tailwind CSS)** on the frontend and **Node.js (Express + PostgreSQL)** on the backend.

## 🌟 Key Features

*   **Secure Authentication:** Role-based access control (Customer, Staff, Manager) with encrypted passwords and live OTP email verification via Brevo.
*   **Customer Booking Flow:** Guests can browse rooms, make reservations, and check out using integrated simulated payment gateways (eSewa/Khalti) with printable receipts.
*   **Live Room Service Engine:** Guests can order food to their room from a dynamic menu. Orders appear instantly on the Staff Dashboard via live polling, and guests can watch their order status update in real-time.
*   **Staff Operations & Attendance:** Staff members can log their shifts (Clock In/Out) which tracks exactly how many hours they worked.
*   **Administrative Control:** Managers have a dedicated dashboard to view live revenue, manage room inventory (CRUD), and securely add or remove staff members from the system.

## 🚀 Getting Started

Ensure you have Node.js and PostgreSQL installed on your machine.

### 1. Database Setup
Ensure PostgreSQL is running and create a database named `innsight`.

### 2. Start the Backend Server
```bash
cd server
npm install
```

**Environment Variables:** Create a `.env` file in the `server/` directory:
```env
# Database Connection
DATABASE_URL=postgres://user:password@localhost:5432/innsight

# JWT Secret for Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Brevo SMTP/API Key (For sending OTP Emails)
BREVO_API_KEY=your_brevo_api_key

# Payment Gateways (UAT/Sandbox credentials)
PUBLIC_BASE_URL=http://localhost:5173
ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
KHALTI_SECRET_KEY=your_khalti_test_key
```

**Seed the Database (Optional but Recommended):**
To populate your app with sample rooms and a restaurant menu for demonstration purposes, run:
```bash
node src/seed.js
```

**Start the Server:**
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### 3. Start the Frontend Application
The frontend is a modern React web application built with Vite and TailwindCSS.

```bash
cd client/innscape-connect-main
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## 📱 Role Testing Guide

To experience all features, try creating accounts for all three roles:

1.  **Customer (`customer`)**: Register an account normally from the public page. You can book rooms, checkout via eSewa, and place Room Service orders from the dynamic menu.
2.  **Administrator (`manager`)**: Since the public registration is securely locked to 'customer', you can manually change a user's role to `manager` in your PostgreSQL database (`UPDATE users SET role = 'manager' WHERE email = '...';`). Once logged in, you can manage inventory and add staff.
3.  **Staff (`staff`)**: Use your Manager account to navigate to the "Manage Staff" tab and create a new staff member. The staff member will receive an OTP via email to verify their account, log in, clock into their shift, and fulfill live room service orders.

## 🛠 Project Structure

- **`client/innscape-connect-main/`**: React Web frontend.
  - `src/routes/`: Page views and dashboard components.
  - `src/components/`: Reusable Tailwind UI components.
  - `src/lib/`: API configuration and helper functions.
- **`server/`**: Node.js Express backend.
  - `src/controllers/`: Business logic for auth, bookings, staff, rooms, etc.
  - `src/models/`: Database schema (`schema.sql`).
  - `src/routes/`: API endpoint definitions.
