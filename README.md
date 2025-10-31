# ThetaHouse

> A fullstack internal management system built with **NestJS**, **React**, and **MySQL**, designed to streamline internal operations and financial management.

**Live Demo:** [https://theta-house.vercel.app](https://theta-house.vercel.app)  
**Backend API:** [https://thetahouse-backend.onrender.com/api/v1](https://thetahouse-backend.onrender.com/api/v1)

**Demo Account**

You can log in using the following admin credentials to explore the system:

| Role  | Email                        | Password |
| ----- | ---------------------------- | -------- |
| Admin | tranductridung0103@gmail.com | password |

---

## Overview

ThetaHouse is an internal business management platform that helps organizations handle operational workflows such as order management, purchasing, inventory tracking, and scheduling.
It integrates authentication, access control, and calendar synchronization to centralize daily activities.

- **Purpose:** Simplify and unify company management tasks through a single digital platform.
- **Status:** In active development.
- **Main technologies:** NestJS, TypeORM, MySQL, React, Vite, TailwindCSS.

---

## Features

- **User Authentication & RBAC** — Secure access using JWT and role-based permissions.
- **Email Verification** — Users receive a confirmation email after registration to activate their account.
- **Password Reset** — Request password recovery via email.
- **Order & Purchase Management** — Create, view, and track orders and purchases.
- **Inventory Tracking** — Monitor product quantities and stock movements.
- **Partner & User Management** — Manage internal users and external partners.
- **Course & Service Scheduling** — Manage enrollments, appointments, and sync with Google Calendar.
- **Transaction & Payment Tracking** — Record payment statuses without third-party gateways.
- **Dashboard & Reports** — Visualize revenue and operational insights per month.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Repositoy Layout](#repository-layout)
- [Backend Guide](#backend)
- [Frontend Guide](#frontend)
- [Deployment](#deployment)

---

## Tech Stack

**Backend:** NestJS (Node.js, TypeScript, TypeORM)  
**Frontend:** React + Vite + TailwindCSS  
**Database:** MySQL  
**Deployment:** Render (API), Vercel (Frontend), Aiven (Database)

---

## Prerequisites

- Node.js LTS (>= 18)
- npm or yarn
- MySQL
- Git

---

## Repository Layout

- /backend — API server built with NestJS and TypeORM
- /frontend — React application
- README.md — project documentation

---

## Backend

### Setup

1. Open a terminal in /backend
2. Install dependencies:
   `npm install`
3. Copy env file and edit values
   `cp .env.example .env`

### Environment setup (.env.example)

Copy the example environment file and update the required fields:

`cp .env.example .env`

Open .env and configure your values for database connection, JWT tokens, email service, Google Calendar integration, and other environment-specific settings.

### Scripts (package.json)

- npm run dev — start in development with hot reload
- npm run start — start production server
- npm run build — build TypeScript (if applicable)

### Running locally

- Dev: cd backend && npm run dev
- Prod: cd backend && npm run build && npm run start

### API Documentation (Swagger UI)

- **Local**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **Production**: [https://thetahouse-backend.onrender.com/docs](https://thetahouse-backend.onrender.com/docs)

---

### Database Seeding

To populate the database with initial data (roles, permissions, admin account), run:

```bash
npm run seed
```

---

## Frontend

### Setup

1. Open a terminal in /frontend
2. Install dependencies:
   `npm install`
3. Copy env and update API base URL:
   `cp .env.example .env`

### Environment setup (.env.example)

Copy the example environment file and update the required fields:

`cp .env.example .env`

Open .env and configure your values for backend and frontend URL.

### Scripts (package.json)

- npm run dev — start dev server
- npm run build — build production assets

### Running locally

- Dev: cd frontend && npm run dev
- Build: cd frontend && npm run build

### Notes

- Configure CORS on backend to allow frontend origin in development.

---

## Deployment

- Backend: deploy as Node service (Render)
- Frontend: static hosting (Vercel)
- Database: deploy as MySQL (Aiven)
- Configure environment variables in hosting platform.

---
