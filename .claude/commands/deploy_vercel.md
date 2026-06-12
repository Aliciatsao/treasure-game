Deploy this project to Vercel and return the live URL.

Follow these steps exactly:

## 1. Install Vercel CLI if missing
```bash
which vercel || npm install -g vercel
```

## 2. Build the project
```bash
npm run build
```
If the build fails, stop and report the error — do not proceed to deploy.

## 3. Deploy to Vercel (production)
```bash
vercel --prod --yes
```
- If the user is not logged in, Vercel will prompt for authentication. Instruct the user to run `vercel login` themselves by typing `! vercel login` in the prompt, then re-run this command.
- The `--yes` flag accepts all default prompts so deployment is non-interactive.
- The build output directory for this project is `build/` (not `dist/`). If Vercel asks, set the output directory to `build`.

## 4. Report the result
After a successful deploy, extract the production URL from the Vercel output (it looks like `https://<project>.vercel.app`) and display it clearly to the user so they can open it in a browser.

If deployment fails for any reason, show the full error output and suggest a fix.
