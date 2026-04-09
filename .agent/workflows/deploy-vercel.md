---
description: How to deploy StudyFlow AI to Vercel
---

# Deploying StudyFlow AI to Vercel (Full Stack)

Follow these steps to deploy your React + Python application to Vercel.

## 1. Prerequisites
- A [GitHub](https://github.com/) account.
- A [Vercel](https://vercel.com/) account (connected to your GitHub).
- Ensure your `backend/requirements.txt` includes the Spacy model URL (I have already updated this for you).

## 2. Push to GitHub
If you haven't already, push your code to a GitHub repository:
1. Open a terminal in the project root (`d:\AIML_STUDENT_ASSISSTANT`).
2. Initialize and push:
```bash
git init
git add .
git commit -m "Prepare for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## 3. Import to Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. **Project Settings**:
   - Vercel should automatically detect the `vercel.json` and handle the multi-build setup.
   - **Framework Preset**: Select `Other` or `Vite`.
   - **Root Directory**: Leave as `./` (the root of the repo).

## 4. Environment Variables
If you decide to add an OpenAI API key or other secrets later:
- Go to **Settings** > **Environment Variables** in Vercel.
- Add your variables there.

## 5. Deployment
- Click **Deploy**. Vercel will:
  - Build your React frontend (installing dependencies in `frontend/`).
  - Set up your Python Flask app as an API (installing `backend/requirements.txt`).
  - Route all requests starting with `/api` to your Python backend.

## Why this works
- The `vercel.json` I created tells Vercel how to handle your split folder structure.
- The `frontend/vite.config.js` proxy ensures the app works perfectly while you are developing locally.
- The updated `App.jsx` uses relative paths (`/api`) which work both on your local machine and on the production URL.

**Note**: Vercel Serverless Functions have a default 10-second timeout for the hobby plan. If you upload a very large PDF that takes longer than 10 seconds to analyze, you might see a "504 Timeout" error. For very heavy use, consider moving the backend to **Render.com**.
