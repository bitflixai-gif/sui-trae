# 🚀 Sui24 Deployment Guide

This guide helps you deploy your **sui24** project cleanly using the new Builder Pattern.

## 📋 Checklist

### 1. Preparation
- [ ] Ensure `DATA_IMPORT.md` is followed for data migration.
- [ ] Verify environment variables in Vercel.

### 2. Deployment Steps (Run Commands)

You can run these steps directly in your terminal:

1. **Initialize & Push Code** (Run this script)
   ```powershell
   .\deploy.ps1
   ```
   *Note: If you haven't linked GitHub yet, run this first:*
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/sui24.git
   ```

2. **Vercel Setup** (If needed)
   - Go to Vercel Dashboard -> Add New Project
   - Select the `sui24` repository
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (Leave default)
   - **Build Command**: `npx vite build` (Override if needed, but `package.json` handles it)
   - **Output Directory**: `dist` (Override if needed, but `vite.config.ts` handles it)
   - **Environment Variables**: Add your `DATABASE_URL`, `JWT_SECRET`, etc.

### 3. Verify Deployment
- [ ] Check Vercel build logs for "Build Completed".
- [ ] Visit your deployed URL (e.g., `https://sui24.vercel.app`).
- [ ] Test login/signup functionality.

## 🛠️ Troubleshooting

- **Build Error**: "Command not found" -> Ensure `package.json` has `"vercel-build": "npx vite build"`.
- **404 Not Found**: Ensure `vercel.json` has rewrites.
- **Database Error**: Check `DATABASE_URL` in Vercel settings.

## 🔄 Updating the Project
Whenever you make changes, simply run the deploy script again:
```powershell
.\deploy.ps1
```
This will automatically save, commit, and push your changes to trigger a new deployment.