# Deployment Guide

This guide will help you deploy your Social App (Client + Server) to production.

## Prerequisites

- **GitHub Account** (for repository hosting)
- **Vercel Account** (for Client)
- **Render** or **Railway** Account (for Server)
- **MongoDB Atlas** Account (or use Render/Railway managed DB)

---

## 1. Set Up Database (MongoDB Atlas)

You cannot use `localhost` for a deployed app. Follow these steps to get a free cloud database:

1.  **Create an Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up.
2.  **Create a Cluster**: Select **M0** (Free Tier).
3.  **Setup Security**:
    - **Username & Password**: Create a database user.
    - **IP Access List**: Add `0.0.0.0/0` (Allow Access from Anywhere) so Render can connect.
4.  **Get Connection String**:
    - Click **Connect** -> **Drivers**.
    - Copy the Connection String and replace `<password>`.
    - **Save this string**; this is your `MONGO_URI`.

---

## 2. Server Deployment

1.  **Push your code to GitHub**.
2.  In Render, click **New +** -> **Web Service**.
3.  Connect your GitHub repository (`server` directory).
4.  **Settings**:
    - **Build Command**: `npm install --legacy-peer-deps && npm run build`
    - **Start Command**: `npm start`
5.  **Environment Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Auto-set by Render | `5000` |
| `MONGO_URI` | MongoDB Atlas Connection String | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing tokens | `your-secure-secret` |

6.  Click **Create Web Service**.

> **Note**: Images are now stored directly in MongoDB (GridFS), so you don't need any external image services.

---

## 3. Client Deployment (Vercel)

1.  Log in to [Vercel.com](https://vercel.com).
2.  Import your GitHub repository (`client` directory).
3.  **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: Your Server URL (e.g., `https://socialapp-server.onrender.com`).
4.  **Deploy**.
