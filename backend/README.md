
# Photography App — Backend API

> REST API for a photography platform — JWT auth, role-based access control, and photo post management.

## ✨ Features
- User registration & login with **JWT Authentication**
- **Role-Based Access Control** (admin / user roles)
- Photo post CRUD operations
- Secure protected routes via middleware

## 🛠 Tech Stack
`Node.js` · `Express.js` · `MySQL` · `JWT` · `RBAC`

## 🚀 Getting Started
```bash
git clone https://github.com/sudheee-dev/photography-backend.git
cd photography-backend
npm install
# Configure .env (see .env.example)
npm start
```

## 🔐 API Endpoints
| Method | Route | Auth |
|--------|-------|------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/photos | JWT required |
| POST | /api/photos | Admin only |
