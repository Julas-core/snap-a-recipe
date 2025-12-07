# How to Share Your Snap-a-Recipe App

This guide explains different ways to share your app with family and friends.

## Option 1: Quick Testing with Expo Go (Easiest)

**Best for:** Quick testing and demos

### Steps:
1. Make sure your app is running:
   ```bash
   cd phone
   npm start
   ```

2. Share the QR code:
   - The QR code will appear in your terminal
   - Friends/family scan it with the **Expo Go** app (download from App Store/Play Store)
   - They can open your app instantly

**Limitations:**
- Requires Expo Go app installed
- Some native features may not work
- Not suitable for production sharing

---

## Option 2: Development Build (Recommended for Sharing)

**Best for:** Sharing with family and friends who want the full app experience

### Prerequisites:
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:
   ```bash
   eas login
   ```
   - **Forgot your account?** Create a new one at https://expo.dev/signup (it's free!)
   - Or recover password at https://expo.dev/forgot-password

3. Configure EAS (if not already done):
   ```bash
   eas build:configure
   ```

### Build for Android (APK):
```bash
cd phone
eas build --platform android --profile development
```

This creates an APK file that can be:
- Downloaded directly from the build page
- Shared via email, Google Drive, Dropbox, etc.
- Installed on any Android device (may need to enable "Install from unknown sources")

### Build for iOS:
```bash
eas build --platform ios --profile development
```

**Note:** iOS builds require:
- Apple Developer account ($99/year)
- TestFlight for distribution (easiest)
- Or direct device installation via Xcode

### Share the Build:
1. After build completes, EAS provides a download link
2. Share this link with your friends/family
3. They download and install the app directly

---

## Option 3: Production Build (For App Stores)

**Best for:** Publishing to Google Play Store or Apple App Store

### Android (AAB for Play Store):
```bash
eas build --platform android --profile production
```

### iOS (For App Store):
```bash
eas build --platform ios --profile production
```

Then submit to stores using:
- Google Play Console (for Android)
- App Store Connect (for iOS)

---

## Option 4: Local Build (No EAS Account Required)

**Best for:** Building without needing an Expo account

### Prerequisites:
- Android: Android Studio installed
- iOS: Mac with Xcode installed

### Android APK (Local - No Account Needed):
```bash
cd phone

# Generate native Android project
npx expo prebuild --platform android

# Build the APK
cd android
./gradlew assembleRelease

# Or for debug build (faster)
./gradlew assembleDebug
```

The APK will be in:
- Release: `android/app/build/outputs/apk/release/app-release.apk`
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`

**Share the APK file directly** - no account needed!

### iOS (Requires Mac + Xcode):
```bash
cd phone
npx expo prebuild --platform ios
npx expo run:ios
```

### Alternative: Use Expo's Build Service (Still Free)
Even without remembering your account, you can:
1. Create a new free Expo account at https://expo.dev/signup
2. Login: `eas login`
3. Build: `npm run build:android`

---

## Important Notes

### Environment Variables
Make sure your `.env` file has:
```
GEMINI_API_KEY=your_api_key_here
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

For production builds, set these in EAS Secrets:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value your_key
```

### App Configuration
- Update `app.config.js` with your app details
- Ensure icons and splash screens are in `assets/` folder
- Update version number before each build

### Sharing Tips
1. **For Android:** Share the APK file directly (via email, cloud storage, etc.)
2. **For iOS:** Use TestFlight for easy distribution (up to 10,000 testers)
3. **For Both:** Consider using a service like Diawi or InstallOnAir for easy sharing

---

## Quick Commands Reference

```bash
# Start development server
npm start

# Build Android APK (development)
eas build --platform android --profile development

# Build iOS (development)
eas build --platform ios --profile development

# Build for production
eas build --platform all --profile production

# View build status
eas build:list
```

---

## Troubleshooting

**Build fails?**
- Check that all environment variables are set
- Ensure you're logged into EAS: `eas login`
- Verify app.config.js is correct

**Can't install APK on Android?**
- Enable "Install from unknown sources" in device settings
- Some devices may require additional permissions

**iOS build issues?**
- Requires Apple Developer account
- May need to configure certificates and provisioning profiles
- Use TestFlight for easier distribution

