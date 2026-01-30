# Deployment Guide

This guide will help you deploy your Social App (Client + Server) to production.

## Prerequisites

- **GitHub Account** (for repository hosting)
- **Vercel Account** (for Client)
- **Render** or **Railway** Account (for Server)
- **MongoDB Atlas** Account (or use Render/Railway managed DB)

---

## 1. Environment Variables Configuration

Before deploying, ensure your code is ready to accept environment variables.
(We have already updated `client/src/lib/axios.ts` and `server/src/routes/upload.ts` to use these).

### Server Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Service port (automatically set by Render/Railway) | `5000` |
| `MONGO_URI` | Connection string for MongoDB | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing tokens | `your-secure-secret` |
| `CLIENT_URL` | URL of your deployed frontend (optional, for CORS) | `https://your-app.vercel.app` |
| `OPENINARY_API_KEY` | API Key for image service | `...` |
| `OPENINARY_URL` | URL to image service (if external) | `https://api.openinary.com` |

### Client Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL of your deployed server | `https://your-api.onrender.com` |

---

## 2. Server Deployment (Recommended: Render)

1.  **Push your code to GitHub**.
2.  Log in to [Render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Settings**:
    - **Name**: `socialapp-server` (or your choice)
    - **Root Directory**: `server`
    - **Environment**: Node
    - **Build Command**: `npm install && npm run build` (or `npm install && tsc` - check package.json)
        - *Correction*: Your `server/package.json` build script is `tsc`. Ensure `tsc` is available or use `npm install` which installs devDependencies including typescript.
        - **Safe Build Command**: `npm install && npm run build`
    - **Start Command**: `npm start`
6.  **Environment Variables**:
    - Add all variables listed in the "Server Variables" section above.
7.  Click **Create Web Service**.
8.  Wait for deployment to finish. Copy the **Service URL** (e.g., `https://socialapp-server.onrender.com`).

---

## 3. Client Deployment (Recommended: Vercel)

1.  Log in to [Vercel.com](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project**:
    - **Framework Preset**: Next.js (should detect automatically).
    - **Root Directory**: Click "Edit" and select `client`.
5.  **Environment Variables**:
    - Key: `NEXT_PUBLIC_API_URL`
    - Value: Paste your Server URL from Step 2 (e.g., `https://socialapp-server.onrender.com`).
      *Note: Do not add a trailing slash `/`.*
6.  Click **Deploy**.

---

## 4. Post-Deployment

1.  Open your Vercel deployment URL.
2.  Try to **Sign Up** to verify the connection to the server and database.
3.  Check the browser console (F12) network tab if you encounter issues.

## Troubleshooting

- **CORS Errors**: If the client cannot talk to the server, check your Server's `cors` configuration. You may need to add your Vercel domain to the allowed origins in `server/src/index.ts`.
- **Database Connection**: Ensure your `MONGO_URI` allows connections from anywhere (0.0.0.0/0) or whitelist Render's IP addresses.
