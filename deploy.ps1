# deploy.ps1
# Simple deployment script for sui24

Write-Host "🚀 Starting deployment for sui24..." -ForegroundColor Green

# 1. Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..."
    git init
    git branch -M main
}

# 2. Add all files
Write-Host "📦 Staging files..."
git add .

# 3. Commit changes
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Deploy update: $timestamp (Builder Pattern)"
Write-Host "💾 Committing changes: $commitMessage"
git commit -m "$commitMessage"

# 4. Push to GitHub
Write-Host "⬆️ Pushing to GitHub..."
# Try pushing to main
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Push failed. You might need to set the remote origin URL first." -ForegroundColor Yellow
    Write-Host "Run this command if you haven't connected to GitHub yet:"
    Write-Host "git remote add origin https://github.com/YOUR_USERNAME/sui24.git"
} else {
    Write-Host "✅ Deployment pushed successfully!" -ForegroundColor Green
    Write-Host "Vercel should now be building your project."
}
