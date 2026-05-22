# Campus Placement Drive Portal

A clean, modern, full-stack placement drive and candidate management application built with **React**, **TypeScript**, **Express**, **Vite**, **better-sqlite3**, and **Tailwind CSS**.

---

## 🚀 How to Run Locally

Follow these step-by-step instructions to set up and run the application on your local machine.

### 1. Prerequisites
Ensure you have the following installed on your system:
* **Node.js** (v18.0.0 or higher recommended)
* **npm** (comes pre-packaged with Node.js)

### 2. Install Dependencies
Run the following command in the root folder of the project to install all required backend and frontend dependencies:
```bash
npm install
```

### 3. Configure Environment Variables
1. Create a `.env` file in the root directory by duplicating `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and set the required variables:
   ```env
   APP_URL="http://localhost:3000"
   JWT_SECRET="your-super-secret-random-key"
   ```

### 4. Running the Developer Server
Start the local full-stack development server by running:
```bash
npm run dev
```
The server will boot up using `tsx` to run the custom `server.ts` Express file. You can access the application at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Build and Production Deployment

### 1. Production Build
To build the static React assets for production, run:
```bash
npm run build
```
This compiles and bundles all frontend components into the optimized, speed-focused `dist/` directory.

### 2. Productive Run
To simulate running the built code in production mode, first set the node environment to production, then start:
```bash
NODE_ENV=production npm run dev
```

---

## 📁 Project Architecture

Here is an brief guide to how the project files are laid out:

* `/server.ts` — The full-stack Express server handling SQLite data queries, authenticating users, managing PDF uploads, and proxying incoming client requests.
* `/src/App.tsx` — Root component of the React application directing pages and auth state.
* `/src/components/` — Shared UI elements such as layout, alerts, modals, and input forms.
* `/src/pages/` — Modular role-specific views:
  * `AdminPage.tsx` — Panel with dashboard metrics, user directory, and placement analytics.
  * `RecruiterPage.tsx` — Panel for creating job drives, shortlisting, and updating candidate status.
  * `StudentPage.tsx` — Portal to view active drives, track submission statuses, and edit profile details.
* `/src/services/` — Abstracted API call logic interfacing seamlessly with backend endpoints.
* `/src/hooks/` — Custom React hooks managing states and refreshing UI components.
