# Authentication System

A RESTful authentication api built with **Node.js**, **Express.js**, and **MongoDB**.

This project provides a secure authentication system with JWT-based authentication, token management, password recovery, and email verification.

## Features

- User Registration (Signup)
- User Login (Signin)
- JWT Authentication
- Access Token & Refresh Token
- Token Hashing
- Get Authenticated User Profile
- User Logout
- Refresh Access Token
- Forgot Password
- Reset Password
- Email Verification
- Password Hashing with bcryptjs

## /api/auth Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/signin` | Login to an existing account |
| GET | `/api/auth/me` | Get authenticated user information |
| POST | `/api/auth//logout` | Logout the user |
| POST | `/api/auth//refresh-token` | Generate a new access token |
| POST | `/api/auth//forgot-password` | Request password recovery |
| POST | `/api/auth//reset-password/:passwordToken` | Reset user password |
| POST | `/api/auth//email-verify/:tokenEmailVerify` | Verify user email |

## Technologies

- **Node.js** – JavaScript runtime
- **Express.js** – Backend web framework
- **MongoDB** – NoSQL database
- **Mongoose** – MongoDB object modeling
- **JWT (jsonwebtoken)** – Token-based authentication
- **bcryptjs** – Password hashing
- **Node.js Crypto** – Cryptographic token hashing
- **Mailtrap** – Email testing and delivery

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
MONGODB_PORT=3000
NODE_ENV=development

# Database
MONGODB_URL=mongodb://localhost/auth

# JWT
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Mailtrap
HOST_MAILTRAP_URL=sandbox.smtp.mailtrap.io
HOST_MAILTRAP_PORT=2525
HOST_MAILTRAP_USER=your_username
HOST_MAILTRAP_PASSWORD=your_password
HOST_MAILTRAP_FROM=your_email
```


## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd <project-folder>
```

Install dependencies:

```bash
npm install
```

Configure your `.env` file with the required environment variables.

Run the application using the following command:

```bash
node app.js
```

## Security

- Passwords are hashed using bcryptjs before being stored in the database.
- JWT is used for access and refresh token authentication.
- Cryptographic hashing is used for secure token storage.
- Sensitive configuration values are managed through environment variables.

