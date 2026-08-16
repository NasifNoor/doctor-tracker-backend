# Doctor Tracker Backend

REST API backend for the **Doctor Tracker** application. It provides secure authentication, doctor management, patient management, doctor-specific patient workflows, and dashboard statistics.

The backend is a standalone **Node.js + Express** application using **MongoDB + Mongoose**. The frontend communicates with it through REST APIs.

## Tech Stack

- Node.js 24+
- Express
- JavaScript
- MongoDB
- Mongoose
- JWT
- HTTP-only cookies
- bcryptjs
- Zod
- REST API

## Features

### Authentication

- Admin login
- JWT authentication
- HTTP-only authentication cookie
- Authentication middleware
- Authenticated-user endpoint
- Logout
- Protected API routes

### Doctor Management

### Patient Management

### Dashboard Statistics

- Total doctors
- Total patients
- Patients per doctor
- Date-based patient statistics
- MongoDB aggregation for statistics

---

## Project Structure

```text
doctor-tracker-backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── doctor.controller.js
│   │   ├── patient.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── middleware/
│   │   └── auth.middleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   └── Patient.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── doctor.routes.js
│   │   ├── patient.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── app.js
│   └── server.js
│
├── seed/
│   └── seed.js
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

Make sure the following are installed:

- Node.js 24+
- npm
- MongoDB

MongoDB can run locally or be hosted remotely.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/NasifNoor/doctor-tracker-backend.git
cd doctor-tracker-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=mongodb+srv://nasifworkstation_db_user:nuqX2vF42ZrRkpFl@doctor-tracker.ups5pv0.mongodb.net/doctor-tracker?appName=doctor-tracker
JWT_SECRET=2580eaada428dfe1fca39cf92c60b308a47384b96e5cf44010bb1b4a85c4c0a0
FRONTEND_URL=http://localhost:3000
```

Never commit the real `.env` file.

Create `.env.example` for the repository:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
FRONTEND_URL=http://localhost:3000
```

---

## Running the Server

### Development

```bash
npm run dev
```

The server runs at:

```text
http://localhost:5000
```

### Production build

```bash
npm run build
```

### Production

```bash
npm start
```

---

## Database Seeding

The project uses MongoDB Atlas, so no local MongoDB installation is required. Configure the provided MongoDB Atlas connection string in your .env file. The database already contains sample data, which you can use for testing. I have also included a seed script to generate fresh sample data if needed.

To seed the database, run:

```bash
npm run seed
```

The seed script uses the `MONGODB_URI` from `.env`.

---

## Health Check

```http
GET /api/health
```

Example response:

```json
{
  "success": true,
  "message": "Doctor Tracker API is running"
}
```

---

# API Documentation

## Authentication

### Login

```http
POST /api/auth/login
```

Example request:

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

On successful login, the server issues a JWT using an HTTP-only cookie.

### Current User

```http
GET /api/auth/me
```

Requires authentication.

### Logout

```http
POST /api/auth/logout
```

Clears the authentication cookie.

---

## Doctors

### Get Doctors

```http
GET /api/doctors
```

Supported query parameters:

```text
page
limit
search
specialization
from
to
```

Example:

```http
GET /api/doctors?page=1&limit=10&search=sarah&specialization=cardiology&from=2026-08-01&to=2026-08-15
```

### Create Doctor

```http
POST /api/doctors
```

### Get Doctor

```http
GET /api/doctors/:id
```

### Update Doctor

```http
PUT /api/doctors/:id
```

### Delete Doctor

```http
DELETE /api/doctors/:id
```

---

## Patients

### Get Patients

```http
GET /api/patients
```

Supported query parameters include:

```text
page
limit
search
condition
doctorId
from
to
```

Example:

```http
GET /api/patients?page=1&limit=10&search=arif&condition=hypertension&doctorId=DOCTOR_ID
```

### Get Patient

```http
GET /api/patients/:id
```

### Create Patient

```http
POST /api/patients
```

Patient creation for the main workflow is performed from the specific doctor's page through:

```http
POST /api/doctors/:doctorId/patients
```

### Update Patient

```http
PUT /api/patients/:id
```

### Delete Patient

```http
DELETE /api/patients/:id
```

---

## Dashboard

### Get Dashboard Statistics

```http
GET /api/dashboard/stats
```

The dashboard endpoint provides statistics such as:

- Total doctors
- Total patients
- Patients per doctor
- Date-based patient statistics

MongoDB aggregation is used for analytical queries where appropriate.

---

# Authentication Architecture

The authentication flow uses JWT stored in an HTTP-only cookie.

```text
Client
   │
   │ POST /api/auth/login
   ▼
Express API
   │
   ├── Validate credentials
   ├── Verify password
   └── Create JWT
          │
          ▼
   HTTP-only Cookie
          │
          ▼
       Browser
```

For protected requests:

```text
Request
   │
   ▼
Auth Middleware
   │
   ├── Read JWT cookie
   ├── Verify JWT
   └── Attach authenticated user
          │
          ▼
      Controller
```

The frontend sends requests with credentials enabled so the browser includes the authentication cookie.

---

# Database Design

## User

Used for authentication and the admin account.

## Doctor

Typical fields:

```text
name
specialization
hospital
phone
email
createdAt
updatedAt
```

## Patient

Typical fields:

```text
doctorId
name
age
gender
phone
email
condition
createdAt
updatedAt
```

The patient references a doctor using:

```js
doctorId: {
  type: Schema.Types.ObjectId,
  ref: "Doctor",
}
```

`doctorId` can be `null` when a patient is not currently assigned to a doctor.

---

# MongoDB Indexing

Indexes are used for frequently queried fields.

For example:

```js
patientSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ condition: 1 });
patientSchema.index({ createdAt: -1 });
```

Doctor indexes are also used for common filtering and sorting operations.

The goal is to avoid loading entire collections into application memory when the API only needs a filtered/paginated subset.

---

# Query Optimization

Pagination is performed at the database level:

```js
Doctor.find(filter).skip(skip).limit(limit);
```

Filtering is also performed by MongoDB rather than fetching all records and filtering them in JavaScript.

For example:

```text
Client
  ↓
GET /api/patients?page=1&limit=10&condition=Diabetes
  ↓
MongoDB query
  ↓
Only matching records
  ↓
API response
```

Dashboard statistics use MongoDB aggregation where appropriate.

---

# Validation and Error Handling

The API validates incoming data before creating or updating records.

Responses use a consistent structure.

### Success

```json
{
  "success": true,
  "message": "Operation successful"
}
```

### Error

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

Appropriate HTTP status codes are returned for:

- Validation errors
- Authentication failures
- Unauthorized requests
- Not found resources
- Server errors

---

# Technical Decisions

## 1. HTTP-only JWT Authentication

JWT authentication uses an HTTP-only cookie rather than storing the token in `localStorage`.

This keeps the token inaccessible to client-side JavaScript and allows the browser to send the authentication cookie with API requests.

The frontend does not need to manually manage the JWT.

## 2. Database-Level Filtering, Pagination, and Indexing

Search, filtering, and pagination are handled by MongoDB rather than by fetching large datasets into Node.js.

Indexes support frequently used query patterns, while MongoDB aggregation handles dashboard statistics.

This approach reduces unnecessary data transfer and application-side processing and provides a better foundation for scaling the application.

---

# Environment Variables

| Variable       | Description               | Example                                    |
| -------------- | ------------------------- | ------------------------------------------ |
| `PORT`         | API server port           | `5000`                                     |
| `MONGODB_URI`  | MongoDB connection string | `mongodb://127.0.0.1:27017/doctor-tracker` |
| `JWT_SECRET`   | JWT signing secret        | `your-secret`                              |
| `FRONTEND_URL` | Frontend origin for CORS  | `http://localhost:3000`                    |

---

# NPM Scripts

```bash
npm run dev
npm run build
npm start
npm run seed
```

---

# Related Frontend

The frontend is maintained as a separate project:

```text
Doctor Tracker Frontend
```

It communicates with this backend through REST APIs.

Replace this placeholder with the actual frontend repository URL:

```text
https://github.com/NasifNoor/doctor-tracker-frontend.git
```

---

# License

This project was developed as a technical assignment.
