#!/bin/bash

# Build Signed Release AAB for Google Play Store
# This script builds a signed Android App Bundle suitable for Play Store upload

set -e  # Exit on error

echo "🚀 Building TruckTrackLoads Signed Release AAB for Play Store..."
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from frontend directory"
  echo "   Run: cd frontend && ./scripts/android/build-release-aab.sh"
  exit 1
fi

# Check for required signing environment variables
echo "🔍 Checking signing credentials..."

if [ -z "$ANDROID_KEYSTORE_PATH" ]; then
  echo "❌ Error: ANDROID_KEYSTORE_PATH not set"
  echo "   Set signing environment variables:"
  echo "   1. Copy: cp scripts/android/_signing-env.example scripts/android/.signing-env"
  echo "   2. Edit: scripts/android/.signing-env with your values"
  echo "   3. Load: source scripts/android/.signing-env"
  exit 1
fi

if [ -z "$ANDROID_KEYSTORE_PASSWORD" ]; then
  echo "❌ Error: ANDROID_KEYSTORE_PASSWORD not set"
  exit 1
fi

if [ -z "$ANDROID_KEY_ALIAS" ]; then
  echo "❌ Error: ANDROID_KEY_ALIAS not set"
  exit 1
fi

if [ -z "$ANDROID_KEY_PASSWORD" ]; then
  echo "❌ Error: ANDROID_KEY_PASSWORD not set"
  exit 1
fi

if [ ! -f "$ANDROID_KEYSTORE_PATH" ]; then
  echo "❌ Error: Keystore file not found at: $ANDROID_KEYSTORE_PATH"
  echo "   Generate a keystore with:"
  echo "   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000"
  exit 1
fi

echo "✅ Signing credentials verified"
echo ""

# Check for required tools
echo "🔍 Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js not found"
  exit 1
fi

if ! command -v java &> /dev/null; then
  echo "❌ Error: Java not found"
  exit 1
fi

if [ -z "$ANDROID_HOME" ]; then
  echo "❌ Error: ANDROID_HOME not set"
  exit 1
fi

if [ ! -d "android" ]; then
  echo "❌ Error: Android platform not added. Run: npx cap add android"
  exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Build web app
echo "📦 Building web app..."
npm run build:skip-bindings
echo "✅ Web app built"
echo ""

# Sync to Android
echo "🔄 Syncing to Android platform..."
npx cap sync android
echo "✅ Sync complete"
echo ""

# Build signed release AAB
echo "🔨 Building signed release AAB..."
cd android
./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file="$ANDROID_KEYSTORE_PATH" \
  -Pandroid.injected.signing.store.password="$ANDROID_KEYSTORE_PASSWORD" \
  -Pandroid.injected.signing.key.alias="$ANDROID_KEY_ALIAS" \
  -Pandroid.injected.signing.key.password="$ANDROID_KEY_PASSWORD"
cd ..
echo "✅ Signed release AAB built successfully"
echo ""

# Output location
AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"
if [ -f "$AAB_PATH" ]; then
  echo "✅ SUCCESS!"
  echo ""
  echo "📦 Signed Release AAB location:"
  echo "   $AAB_PATH"
  echo ""
  echo "🎯 Next Steps:"
  echo "   1. Go to Google Play Console: https://play.google.com/console"
  echo "   2. Select your app (or create a new app)"
  echo "   3. Navigate to: Production → Create new release"
  echo "   4. Upload: $AAB_PATH"
  echo "   5. Complete the release form and submit for review"
  echo ""
  echo "📋 Before uploading, ensure you've completed the Play Store Readiness Checklist"
  echo "   See: frontend/ANDROID_BUILD.md#play-store-readiness-checklist"
else
  echo "❌ Error: AAB not found at expected location"
  exit 1
fi
