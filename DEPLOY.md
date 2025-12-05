# Deployment Guide for SoloSuccess AI

This project is configured for deployment on **Render.com** as a Web Service. It uses a monolithic architecture where the Node.js/Express backend serves the static React/Vite frontend files in production.

## Prerequisites

- A GitHub repository containing this code.
- A [Render](https://render.com) account.
- A PostgreSQL database (Render provides a managed PostgreSQL).
- A Redis instance (Upstash is recommended and pre-configured in `render.yaml`).

## Quick Start (Render Blueprints)

This project includes a `render.yaml` file, which allows you to deploy using "Blueprints".

1.  Go to your Render Dashboard.
2.  Click **New +** and select **Blueprint**.
3.  Connect your GitHub repository.
4.  Render will detect the `render.yaml` and prompt you to approve the services.

## Manual Deployment (Web Service)

If you prefer to set it up manually:

1.  **Create a New Web Service** on Render.
2.  **Connect your Repo**.
3.  **Settings**:
    -   **Runtime**: Node
    -   **Build Command**: `npm run build`
    -   **Start Command**: `npm start`
4.  **Environment Variables**:
    You must set the following environment variables in the Render dashboard:

    | Variable | Description |
    | :--- | :--- |
    | `NODE_ENV` | Set to `production` |
    | `DATABASE_URL` | Connection string for your PostgreSQL database |
    | `UPSTASH_REDIS_REST_URL` | URL for your Upstash Redis instance |
    | `UPSTASH_REDIS_REST_TOKEN` | Token for your Upstash Redis instance |
    | `JWT_SECRET` | A long, random string for securing sessions |
    | `STRIPE_SECRET_KEY` | Your Stripe Secret Key (sk_live_...) |
    | `GEMINI_API_KEY` | Your Google Gemini API Key |

## Database Migration

After deployment, the database schema needs to be pushed. The `render.yaml` does not automatically run migrations to avoid data loss risks.

You can run migrations from your local machine if you have the production `DATABASE_URL`:
```bash
npm run db:push
```
*Note: You'll need to set `DATABASE_URL` in your local `.env` to the production URL temporarily, or pass it as an env var.*

## Verification

Once deployed:
1.  Visit your Render URL (e.g., `https://solosuccess-ai.onrender.com`).
2.  The frontend should load.
3.  Try logging in or signing up (tests Database connection).
4.  Check the "System Boot" or "Health" status (tests API and Redis).
