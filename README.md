# Authentication System

A RESTful authentication API built with **Node.js**, **Express.js**, and **MongoDB**.

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
- Interactive API Documentation with Swagger UI

## API Documentation

This project uses **Swagger UI** to provide interactive API documentation.

After starting the server, you can access the API documentation at:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Through Swagger UI, you can explore the available endpoints, view request and response schemas, and test API requests.

## API Endpoints

Base URL: `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/signin` | Login to an existing account |
| GET | `/api/auth/me` | Get authenticated user information |
| POST | `/api/auth/logout` | Logout the user |
| POST | `/api/auth/refresh-token` | Generate a new access token |
| POST | `/api/auth/forgot-password` | Request password recovery |
| POST | `/api/auth/reset-password/:passwordToken` | Reset user password |
| POST | `/api/auth/email-verify/:tokenEmailVerify` | Verify user email |

## Technologies

- **Node.js** – JavaScript runtime
- **Express.js** – Backend web framework
- **MongoDB** – NoSQL database
- **Mongoose** – MongoDB object modeling
- **JWT (jsonwebtoken)** – Token-based authentication
- **bcryptjs** – Password hashing
- **Node.js Crypto** – Cryptographic token hashing
- **Mailtrap** – Email testing and delivery
- **Swagger UI** – Interactive API documentation

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
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

#Swagger
SWAGGER_SERVER_URL=URL_Server/api/


```

## Installation

Clone the repository:

```bash
git clone https://github.com/erfanrdev/authentication-system.git
```

Navigate to the project directory:

```bash
cd authentication-system
```

Install dependencies:

```bash
npm install
```

Configure your `.env` file with the required environment variables.

Start the application:

```bash
node app.js
```

Once the server is running, open the Swagger documentation:

```text
http://localhost:3000/api-docs
```

## Security

- Passwords are hashed using bcryptjs before being stored in the database.
- JWT is used for access and refresh token authentication.
- Cryptographic hashing is used for secure token storage.
- Sensitive configuration values are managed through environment variables.
- Refresh tokens are managed to support secure token renewal and revocation.
