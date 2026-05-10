# 🚀 Ethy Server — Backend Documentation

This is the backend server for the **Ethy** volunteer platform, built with **.NET 10**. It follows the principles of **Clean Architecture** to ensure maintainability, scalability, and testability.

---

## 🏗️ Architectural Overview

The server is designed using **Clean Architecture** (Onion Architecture) with a focus on **Domain-Driven Design (DDD)** principles. The core idea is that the business logic (Domain) is at the center, and dependencies flow inwards.

### Layers

1.  **Domain**:
    *   **Purpose**: Contains the core business logic and entities.
    *   **Contents**: Entities (User, HelpRequest, Chat, Review), Domain Exceptions, and Primitives.
    *   **Dependencies**: None. This layer is independent of any frameworks or external libraries.

2.  **Application**:
    *   **Purpose**: Orchestrates the data flow and implements use cases.
    *   **Contents**: 
        *   **Handlers**: CQRS Command and Query handlers using **MediatR**.
        *   **Interfaces**: Repository and Service interfaces (`IRepositories`, `IServices`).
        *   **DTOs**: Data Transfer Objects for communication between layers.
    *   **Dependencies**: Only depends on the Domain layer.

3.  **Infrastructure**:
    *   **Purpose**: Implements external concerns such as database access, email services, and file storage.
    *   **Contents**:
        *   **Repositories**: Concrete implementations using **Dapper**.
        *   **Migrations**: Database schema management using **DbUp**.
        *   **Services**: Email senders (SendGrid/SMTP), Image storage (Local/Cloud), Authentication (JWT).
    *   **Dependencies**: Depends on Application and Domain layers.

4.  **Presentation**:
    *   **Purpose**: The entry point for external clients (Web API, GraphQL, SignalR).
    *   **Contents**:
        *   **GraphQL**: Schema, Types, Mutations, and Queries.
        *   **Controllers**: REST endpoints for file uploads and specific tasks.
        *   **Hubs**: SignalR hubs for real-time communication (Chat).
    *   **Dependencies**: Depends on Application and Infrastructure layers.

---

## 🎨 Design Patterns & Principles

-   **Domain-Driven Design (DDD)**:
    *   **Rich Domain Model**: Business logic is encapsulated within Domain Entities, ensuring that state transitions are valid and consistent.
    *   **Encapsulation & Invariants**: Entities manage their own state through methods, preventing invalid states and centralizing business rules.
-   **CQRS (Command Query Responsibility Segregation)**: Implemented via **MediatR**. This separates read and write operations, making the system easier to scale and optimize.
-   **Repository Pattern**: Abstracts the data access layer, allowing the Application layer to work with data without knowing the underlying storage (SQL Server/Dapper).
-   **Dependency Injection (DI)**: Utilizes the built-in .NET DI container for loose coupling between components.
-   **Result/Envelope Pattern**: Used for API responses (especially in GraphQL) to consistently return either data or a structured error (`ApiError`), ensuring predictable error handling on the client.
-   **Options Pattern**: Used for managing configurations like `JwtSettings` in a type-safe way.
-   **Middleware**: Custom middleware for error handling and authentication.

---

## 🛠️ Technical Stack

-   **Runtime**: .NET 10 (Bleeding Edge)
-   **API Style**: GraphQL (via GraphQL-dotnet) + REST (for files)
-   **Real-time**: SignalR
-   **Data Access**: Dapper (Micro-ORM)
-   **Database**: SQL Server
-   **Migrations**: DbUp
-   **Security**: JWT Bearer Authentication + PBKDF2 Password Hashing
-   **Communication**: MediatR (In-process messaging)

---

## 🔧 Core Functionality

-   **Identity & Auth**: Registration with email verification, secure login, role-based access control (Admin, Volunteer, User).
-   **Help Request Lifecycle**: Creation, volunteer assignment, status tracking, and fulfillment reporting.
-   **Real-time Chat**: Bi-directional communication between volunteers and request authors.
-   **Trust System**: User reviews, complaints, and volunteer verification via documents.
-   **Analytics**: Statistics aggregation for platform activity.

---

## 📦 Getting Started

### Prerequisites
- .NET 10 SDK
- SQL Server (LocalDB or full instance)

### Configuration
Update `appsettings.json` with your:
- `DefaultConnection`: SQL Server connection string.
- `JwtSettings`: Secret Key, Issuer, and Audience.

### Database Migrations
Migrations run automatically on application startup via **DbUp**. Ensure the connection string is correct before running.

### Running
```bash
dotnet build
dotnet run
```
The GraphQL Playground will be available at `/graphql/playground` (in development mode).
