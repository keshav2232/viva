# Deployment Guide: Ruthless Viva

Congratulations! Your app is ready for the world.

I have configured your project for a **"Single Service" deployment**. This means you only need to deploy to **Render**, and it will handle both the frontend and backend automatically.

## Prerequisites
1.  **GitHub Account:** [Sign up](https://github.com/)
2.  **Render Account:** [Sign up](https://render.com/)
3.  **MongoDB Connection String:** (You already have this!)

---

## Step 1: Push Code to GitHub
1.  Create a new repository on GitHub (e.g., `ruthless-viva`).
2.  Push your code:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/<your-username>/ruthless-viva.git
    git push -u origin main
    ```

---

## Step 2: Deploy to Render
1.  Go to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  **Configure the Service:**
    *   **Name:** `ruthless-viva` (or whatever you like)
    *   **Region:** Choose one close to you (e.g., Singapore, Frankfurt).
    *   **Branch:** `main`
    *   **Root Directory:** `.` (Leave empty or dot)
    *   **Runtime:** `Node`
    *   **Build Command:** `npm run build`
        *(This will automatically build both your frontend and backend)*
    *   **Start Command:** `npm start`
        *(This will start your backend server)*
    *   **Instance Type:** Free

5.  **Environment Variables:**
    Scroll down to "Environment Variables" and add these keys (copy from your `.env` file):
    *   `GEMINI_API_KEY`: `...`
    *   `MONGODB_URI`: `...`
    *   `PORT`: `10000` (Render sets this automatically, but good to have)

6.  Click **Create Web Service**.

---

## Step 3: Wait & Test
Render will take a few minutes to build your app. Watch the logs!
Once it says "Live", click the URL at the top (e.g., `https://ruthless-viva.onrender.com`).

**That's it! Your app is live.**
- **Public URL:** Share this with everyone.
- **Admin Dashboard:** Go to `/admin` on your live URL to see users.
