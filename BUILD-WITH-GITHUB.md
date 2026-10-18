# Build the Brokerlynx APK with GitHub (step by step)

You do this once. After that, every time you change the code, one click builds a fresh APK.

## A. Put the project on GitHub (private)
1. Create a free account at github.com. Click **New repository**. Name it `brokerlynx`, choose **Private**, do not add a README. Create.
2. Easiest way for a beginner: install **GitHub Desktop**. File > Add local repository > choose THIS folder (the one that contains `build.gradle`) > it offers to "create a repository" > accept > **Publish repository** > keep "Keep this code private" ticked.
   (Drag-and-drop on the website stops at 100 files per upload and this project has more, so use GitHub Desktop or git.)
3. The branch must be called **main**. The hidden folder `.github/workflows` must be included. `node_modules` must also be included (it holds the Capacitor Android libraries; there is no package.json).

## B. Make your signing key (ONE TIME, most important step)
The signing key proves every APK came from you. **If you lose it you can never update your customers' apps.** Back it up in 2 places (Drive + pen drive) and never upload it anywhere public.

Option 1, with Android Studio: Build > Generate Signed App Bundle / APK > APK > Next > Create new... Fill in a file name (e.g. `brokerlynx.jks`), a password, an alias (e.g. `brokerlynx`), a key password, your name. Validity 40 years.

Option 2, command line (any computer with Java): 
`keytool -genkeypair -v -keystore brokerlynx.jks -alias brokerlynx -keyalg RSA -keysize 2048 -validity 14600`

Write down: keystore password, alias, key password.

### If customers already installed an APK you built before
Android only lets an APK update an installed app if it is signed with the SAME key. Ask yourself how the old APK was built:
- Built in Android Studio with Run / Build APK (debug)? It was signed with the debug key stored on that computer: `C:\Users\<you>\.android\debug.keystore` (Windows) or `~/.android/debug.keystore` (Mac/Linux). Alias `androiddebugkey`, passwords `android`. Use THAT file as your keystore below and customers can update normally. (The debug key is weaker, so switch to a new key only when you are ready to ask everyone to back up, uninstall and reinstall.)
- Not distributed yet? Use the new key from step B and ignore this paragraph.
If the key does not match, Android says "App not installed". Customers must then back up, uninstall, install, and restore their backup file.

## C. Add 4 secrets on GitHub
1. Turn the keystore file into text. Windows PowerShell:
   `[Convert]::ToBase64String([IO.File]::ReadAllBytes("brokerlynx.jks")) | Set-Clipboard`
   Mac: `base64 -i brokerlynx.jks | pbcopy`   Linux: `base64 -w0 brokerlynx.jks`
2. On GitHub open your repository > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**. Add these four (names must match exactly):
   - `KEYSTORE_BASE64`  = the text you just copied
   - `KEYSTORE_PASSWORD` = your keystore password
   - `KEY_ALIAS` = your alias
   - `KEY_PASSWORD` = your key password

## D. Build
1. Open the **Actions** tab > **Build Brokerlynx APK** > **Run workflow** > Run. (It also runs automatically whenever you push to `main`.)
2. Wait about 5-10 minutes. A green tick means success.
3. Open the finished run > scroll to **Artifacts** > download **Brokerlynx-APK** (a zip containing `Brokerlynx-1.0.N.apk`).
4. In the run log, step "Name the APK and show its signing fingerprint" prints a SHA-256 value. **It must be identical on every build.** If it changes, customers cannot update over the old app.

If the secrets are missing the workflow still builds a debug APK so you can test, but only the signed build should go to customers.

## E. Change the app later
Edit files under `app/src/main/assets/public/` (index.html, css/, js/), commit and push. The version number goes up by itself on every build (versionCode = run number + 1) so phones accept it as an update.
Before sending to customers install it on a real phone and check: sign up, create a contract, make a PDF, export a backup, uninstall/reinstall and restore it, and (if enabled) the forgot-password email.

## F. Things this does NOT do
- It does not build for the Play Store (that needs an AAB and a Play account).
- Do not commit the `.jks` file (the project's .gitignore blocks it).
- The first run may need a small fix if Android Studio and the CI differ; paste the red error from the log and it can be solved quickly.
