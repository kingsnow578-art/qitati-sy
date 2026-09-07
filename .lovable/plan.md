# Plan: Export and push the قطّعتي source code to GitHub

## Important limitation

Lovable's built-in GitHub integration always creates a **new** repository when connected — it cannot push directly into an existing repository (`kingsnow578-art/qitati-site`). I also cannot authenticate to your GitHub account from chat. So this plan combines the Lovable GitHub integration with a one-time manual step you run to land the code in your exact repository.

## Steps

### 1. Authorize Lovable on GitHub (you do this)

1. In the Lovable editor, open the **Plus (+)** menu in the chat input (bottom left) → **GitHub** → **Connect project**.
2. Authorize the **Lovable GitHub App** on your GitHub account.
3. Select your account (`kingsnow578-art`) as the location.
4. Click **Create Repository** — Lovable creates a new repo with the full synced codebase.

### 2. Move the code into your existing repo (you do this once)

After step 1, clone both repos locally and copy the code over, or simply push Lovable's repo contents into `qitati-site`:

```bash
git clone <lovable-created-repo-url> lovable-code
cd lovable-code
git remote set-url origin https://github.com/kingsnow578-art/qitati-site.git
git push -f origin main
```

The `-f` (force) is needed because `qitati-site` already exists with its own history. Alternatively, clone `qitati-site`, copy the files in, commit, and push normally.

### 3. What the export contains (already verified in this project)

- Full TanStack Start + React 19 + Tailwind CSS v4 source.
- `public/favicon.png` and the Qitati brand icon asset — included.
- `src/styles.css` — the dark navy / cyan glassmorphism design system and animations.
- `src/lib/links.ts` — the APK download logic pointing to `https://sevbecnzmuoshkkubbgd.supabase.co/storage/v1/object/public/app-releases/qitati.apk`, used by all "تحميل التطبيق" buttons.
- All components: Header, Footer, PhoneMockup, AnimatedBackground, and the Arabic RTL landing page.

### 4. Alternative without GitHub integration

If you prefer not to connect GitHub at all: open the **Code Editor** in Lovable and use **Download codebase** (paid workspaces) to get a ZIP, then unzip it into your local clone of `qitati-site` and push.

## After merging into your main React app

- Run `npm install` then `npm run dev` to verify locally.
- The site needs no backend or environment variables — it works on any static host once built.

## Notes

- No code changes are required in the project; this plan is about the export flow only.
