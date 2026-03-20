#!/bin/bash
# Auto-push to GitHub — runs after every change
# Token stored in .env.local (gitignored)

REPO_DIR="/home/user/lakshveer-website"
cd "$REPO_DIR"

# Load token
GITHUB_TOKEN=$(grep "^GITHUB_TOKEN=" .env.local 2>/dev/null | cut -d'=' -f2)
if [ -z "$GITHUB_TOKEN" ]; then
  echo "[autopush] ERROR: GITHUB_TOKEN not found in .env.local"
  exit 1
fi

# Keep remote URL fresh
git remote set-url origin "https://$GITHUB_TOKEN@github.com/lakshveerrao/lakshveer-website.git"

# Stage everything
git add -A

# Nothing to commit?
if git diff --cached --quiet; then
  echo "[autopush] Nothing new to push."
  exit 0
fi

# Commit
MSG="${1:-Update: $(date '+%Y-%m-%d %H:%M')}"
git commit -m "$MSG"

# Push
git push origin main && echo "[autopush] ✅ Pushed to github.com/lakshveerrao/lakshveer-website"
