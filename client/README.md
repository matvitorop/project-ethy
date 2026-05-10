# 🎨 Ethy Client — Frontend Documentation

The frontend application for the **Ethy** platform, built with **React 19**, **TypeScript**, and **Vite**. It provides a highly interactive and responsive interface for users and volunteers.

---

## 🛠️ Technical Stack

-   **Framework**: [React 19](https://react.dev/) (utilizing modern hooks and performance optimizations).
-   **Build Tool**: [Vite](https://vitejs.dev/) (for fast development and optimized builds).
-   **State Management**:
    *   **Redux Toolkit**: Manages global UI state, authentication, and theme.
    *   **Apollo Client**: Handles GraphQL data fetching, caching, and state synchronization.
-   **Real-time Communication**: **SignalR** (for instant messaging and notifications).
-   **Styling**:
    *   **Tailwind CSS**: Utility-first CSS framework.
    *   **Framer Motion**: Advanced animations for smooth transitions and interactions.
-   **Icons**: **Lucide React**.
-   **Maps**: **Leaflet** & **React Leaflet**.
-   **Charts**: **Recharts** (for data visualization).

---

## 🏗️ Project Structure

The project follows a feature-based organization (planned or partially implemented) to ensure scalability:

-   `src/api/`: GraphQL queries, mutations, and TypeScript type definitions.
-   `src/components/`: Reusable UI components (Buttons, Cards, Modals).
-   `src/features/`: Complex, domain-specific features (Chat, Reports, Auth logic).
-   `src/layout/`: Page layouts (Public vs. Private layouts).
-   `src/pages/`: Main page components linked to the router.
-   `src/store/`: Redux store configuration and slices.
-   `src/styles/`: Global CSS and Tailwind configurations.

---

## 🔄 Data & Communication

### GraphQL Integration
We use **Apollo Client** to interact with the backend GraphQL API. This provides:
- Automatic caching of query results.
- Declarative data fetching.
- Optimistic UI updates.

### SignalR (Real-time)
For the chat functionality, we utilize **SignalR**. The client maintains a persistent connection to the server hub, allowing for:
- Instant message delivery.
- Online/offline status updates.
- Real-time typing indicators.

---

## 🌓 Theme & UI

Ethy supports both **Light** and **Dark** modes. The theme is managed via Redux and persisted to `localStorage`. We use a custom design system built on top of Tailwind CSS, featuring:
- Glassmorphism effects for headers and panels.
- Modern typography (Inter/Roboto).
- Smooth motion transitions between pages using `framer-motion`.

---

## 🚀 Development Guide

### Prerequisites
- Node.js (v20+)
- npm or yarn

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/graphql
VITE_HUBS_URL=http://localhost:5000/hubs
```

### Running Locally
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```
The build artifacts will be stored in the `dist/` directory.
