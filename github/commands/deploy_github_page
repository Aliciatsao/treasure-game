Deploy this project to GitHub Pages and return the live URL.

Follow these steps exactly:

## 1. Ensure gh CLI is available

```bash
which gh || which ~/bin/gh || echo "gh not found"
```

If not installed, download and install it:
```bash
# Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
  GH_URL="https://github.com/cli/cli/releases/download/v2.94.0/gh_2.94.0_macOS_arm64.zip"
else
  GH_URL="https://github.com/cli/cli/releases/download/v2.94.0/gh_2.94.0_macOS_amd64.zip"
fi
mkdir -p ~/bin
curl -L "$GH_URL" -o /tmp/gh.zip
unzip -o /tmp/gh.zip -d /tmp/gh_extracted
cp /tmp/gh_extracted/*/bin/gh ~/bin/gh
chmod +x ~/bin/gh
```

Set GH alias for this session:
```bash
GH=~/bin/gh
```

## 2. Authenticate with GitHub

Check if logged in:
```bash
$GH auth status 2>&1
```

If not logged in, instruct the user to run the following in the Claude Code prompt and complete the browser flow:
```
! ~/bin/gh auth login
```
Wait for the user to confirm they are logged in before continuing.

## 3. Get GitHub username

```bash
GH_USER=$($GH api user --jq '.login')
echo "GitHub user: $GH_USER"
```

## 4. Set repo name

Use `treasure-game` as the default repo name.

```bash
REPO_NAME="treasure-game"
```

## 5. Create GitHub repository if it doesn't exist

```bash
$GH repo view "$GH_USER/$REPO_NAME" 2>/dev/null && echo "Repo exists" || \
  $GH repo create "$REPO_NAME" --public --description "Interactive Treasure Box Game" --confirm
```

## 6. Initialize git and set remote

```bash
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
git init 2>/dev/null || true
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git"
```

Configure git credentials using gh token:
```bash
$GH auth setup-git
```

## 7. Commit source files to main branch

```bash
git add -A
git commit -m "Initial commit" 2>/dev/null || echo "Nothing to commit or already committed"
git branch -M main
git push -u origin main --force
```

## 8. Update vite.config.ts for GitHub Pages base path

The build must set `base: '/<REPO_NAME>/'` so assets resolve correctly on GitHub Pages.
Check if vite.config.ts already has a GITHUB_PAGES base env var; if not, it has already been updated to use `process.env.VITE_GITHUB_PAGES_BASE || '/'`.

## 9. Install gh-pages package if missing

```bash
npm list gh-pages 2>/dev/null | grep gh-pages || npm install --save-dev gh-pages
```

## 10. Build for GitHub Pages

```bash
VITE_GITHUB_PAGES_BASE="/$REPO_NAME/" npm run build
```

If the build fails, stop and report the error.

## 11. Deploy to GitHub Pages

```bash
npx gh-pages -d build --dotfiles
```

## 12. Enable GitHub Pages (if first deploy)

```bash
$GH api "repos/$GH_USER/$REPO_NAME/pages" \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -f source='{"branch":"gh-pages","path":"/"}' 2>/dev/null || \
  echo "Pages already enabled or will be auto-enabled after push"
```

## 13. Report the result

The live URL will be:
```
https://<GH_USER>.github.io/<REPO_NAME>/
```

Display the URL clearly. Note: GitHub Pages may take 1-2 minutes to go live after the first deploy.
If you see a 404 immediately, wait a minute and try again.
