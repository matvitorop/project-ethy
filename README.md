# 🌿 Ethy — Volunteer Help Platform

**Ethy** is a modern platform designed to make the mutual aid process simpler, safer, and more efficient. The project connects people in need of support with volunteers ready to help, utilizing modern technologies for coordination and communication.

---

## ✨ Key Features

- 🤝 **Help Request Management**: Create, edit, and track request statuses.
- 🗺️ **Interactive Map**: Visualize requests on a map using Leaflet for quick discovery by volunteers.
- 💬 **Real-time Chat**: Instant communication between volunteers and request authors via SignalR.
- 🛡️ **Trust & Feedback System**: Leave reviews and complaints to maintain a high level of community safety.
- 📊 **Statistics & Analytics**: Detailed reports and charts (Recharts) to track volunteer activity and community needs.
- 👮 **Admin Panel**: Full control over users, requests, and content moderation.

---

## 🛠️ Tech Stack

The project is built using modern tools ensuring speed, reliability, and scalability.

### Frontend
- **React 19** & **TypeScript** — core UI library.
- **Redux Toolkit** — global state management.
- **Apollo Client (GraphQL)** — efficient data fetching.
- **Framer Motion** — smooth and modern animations.
- **Lucide React** — beautiful icon set.
- **Tailwind CSS** — flexible styling.

### Backend
- **.NET 10** — powerful and modern server platform.
- **GraphQL** — flexible API for data queries.
- **SignalR** — real-time chat functionality.
- **Dapper** — lightweight and fast ORM for database operations.
- **MediatR** — CQRS pattern implementation for clean architecture.
- **Fluent Validation** — strict input data validation.

---

## 📁 Project Structure

Organized according to Clean Architecture principles:

- `client/` — Frontend application (React + Vite).
- `server/` — Backend application (.NET):
    - `Domain/` — Entities and business rules.
    - `Application/` — Application logic (Handlers, DTOs).
    - `Infrastructure/` — DB work, repositories, external services.
    - `Presentation/` — GraphQL schemas, Controllers, SignalR hubs.
- `tests/` — Unit and integration tests for reliability.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v20+)
- .NET SDK (v10+)
- SQL Server

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/matvitorop/project-ethy.git
   ```
2. Configure the database in `server/appsettings.json`.
3. Start the backend:
   ```bash
   cd server
   dotnet run
   ```
4. Start the frontend:
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the [LICENSE](./LICENSE) file for full details.

---

*Built with love for the community ❤️*