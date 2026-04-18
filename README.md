# InnSight: Smart & Real-Time Hotel Management System

This is a mobile-first hotel management system built with React Native (Expo) and Node.js.

## 🚀 Getting Started

Ensure you have Node.js and npm installed on your machine.

### 1. Start the Backend Server
The backend handles authentication, bookings, and tasks. It uses **PostgreSQL** for data storage.

```bash
cd server
npm install
# Ensure you have a .env file with DATABASE_URL=postgres://user:pass@localhost:5432/dbname
npm run dev
```
The server will start on `http://localhost:5000`.

### 2. Start the Mobile Client
The frontend is a React Native app built with Expo.

```bash
cd client
npm install
npx expo start
```
This will open the Metro bundler.
- Press `a` to run on Android Emulator.
- Press `i` to run on iOS Simulator.
- Scan the QR code with the **Expo Go** app on your physical device.

**Note:** If testing on a physical device, update `client/services/api.js` with your computer's local IP address (e.g., `http://192.168.1.X:5000/api`).

## 📱 Features & Testing Guide

Once the app is running, follow this flow to test the core features:

1.  **Register a User**:
    - Open the app and tap **"Don't have an account? Register"**.
    - Sign up as a **Customer** (e.g., `user@test.com`) to see the Booking Dashboard.
    - Sign up as **Staff** (e.g., `staff@test.com`) to see assigned tasks.
    - Sign up as **Manager** (e.g., `manager@test.com`) to see hotel stats.

2.  **Verify Database**:
    - The backend uses a PostgreSQL database.
    - You can view the table structure in `server/src/models/schema.sql`.

## 🛠 Project Structure

- **`client/`**: React Native frontend code.
  - `app/`: Screens and navigation (Expo Router).
  - `components/`: Reusable UI components.
  - `context/`: State management (Auth).
  - `services/`: API integration.
- **`server/`**: Node.js Express backend.
  - `src/controllers/`: Business logic.
  - `src/models/`: Database schema (PostgreSQL).
  - `src/routes/`: API endpoints.

## 🔜 Next Steps for Development

1.  **Booking Flow**: Implement the UI to select dates and book a room.
2.  **Task Assignment**: Create a UI for Managers to assign tasks to Staff.
3.  **Profile**: Add a profile settings page.
4.  **Real-time Notifications**: Integrate Firebase or Socket.io for instant alerts.

## 💳 Payment Gateway Testing (eSewa + Khalti)

### eSewa (UAT)
- **Gateway**: eSewa ePay v2 (UAT)
- **Test user** (provided by eSewa docs):
  - eSewa ID: `9806800001` (or `...0002` to `...0005`)
  - Password: `Nepal@123`
  - Token/OTP: `123456`
- **Server env**: set in `server/.env`
  - `PUBLIC_BASE_URL` should be reachable from your phone (LAN IP), not `localhost`, if testing on device.
  - `ESEWA_PRODUCT_CODE` and `ESEWA_SECRET_KEY` are set to UAT defaults; replace for production.

### Khalti (Sandbox)
- **Gateway**: Khalti KPG-2 Web Checkout (Sandbox)
- **Required**: `KHALTI_SECRET_KEY` from `https://test-admin.khalti.com`
- **Test user IDs**:
  - Khalti IDs: `9800000000` to `9800000005`
  - OTP: `987654`
  - MPIN: `1111`

### How the app flow works
- Customer books a room → picks **eSewa** or **Khalti** → app opens gateway page → server verifies status/lookup → booking is marked `PAID` when confirmed.
