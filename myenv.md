# Environment Variables

This document outlines the required environment variables for both the frontend and backend of the QuantumLeap blog application.

---

## Backend Environment Variables

Create a `.env` file in the `/backend` directory and add the following variables.

### `MONGO_URI`
The connection string for your MongoDB database.

**Example:**
```
MONGO_URI=mongodb://localhost:27017/quantumleap_blog
```

### `PORT`
The port on which the backend server will run.

**Example:**
```
PORT=5000
```

### `JWT_ACCESS_SECRET`
A long, random, and secret string used to sign the short-lived JWT access tokens. You can generate a strong secret using a password generator or an online tool.

**Example:**
```
JWT_ACCESS_SECRET=your_super_secret_and_long_string_for_access_tokens_12345
```

### `JWT_REFRESH_SECRET`
A different long, random, and secret string used to sign the long-lived JWT refresh tokens. It should be different from the access secret.

**Example:**
```
JWT_REFRESH_SECRET=another_very_different_and_secure_secret_for_refresh_tokens_67890
```

### `CORS_ORIGIN`
The URL of your frontend application. This is used by the CORS middleware to allow requests from your frontend. For local development, this is typically `http://localhost:3000`.

**Example:**
```
CORS_ORIGIN=http://localhost:3000
```

### `NODE_ENV`
Sets the runtime environment. Set to `production` in a live environment to enable certain optimizations and security features (like secure cookies).

**Example:**
```
NODE_ENV=development
```

---

## Frontend Environment Variables

Create a `.env` file in the **root directory** of your project (the same level as `index.html`) and add the following variable.

### `VITE_API_BASE_URL`
The base URL for your backend API. The frontend will use this to make requests to the server. Note: Vite requires environment variables exposed to the browser to be prefixed with `VITE_`.

**Example:**
```
VITE_API_BASE_URL=http://localhost:5000/api
```
