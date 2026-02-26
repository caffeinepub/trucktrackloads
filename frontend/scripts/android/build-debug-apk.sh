#!/bin/bash

# Build Debug APK for TruckTrackLoads
# This script builds a debug APK suitable for testing on devices

set -e  # Exit on error

echo "🚀 Building TruckTrackLoads Debug APK..."
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from frontend directory"
  echo "   Run: cd frontend && ./scripts/android/build-debug-apk.sh"
  exit 1
fi

# Check for required tools
echo "🔍 Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js not found. Please install Node.js from https://nodejs.org/"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "❌ Error: npm not found. Please install npm"
  exit 1
fi

if ! command -v java &> /dev/null; then
  echo "❌ Error: Java not found. Please install JDK 17 or higher"
  exit 1
fi

if [ -z "$ANDROID_HOME" ]; then
  echo "❌ Error: ANDROID_HOME not set"
  echo "   Set it with: export ANDROID_HOME=/path/to/android/sdk"
  exit 1
fi

if [ ! -d "android" ]; then
  echo "❌ Error: Android platform not added"
  echo "   Run: npx cap add android"
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

# Build debug APK
echo "🔨 Building debug APK..."
cd android
./gradlew assembleDebug
cd ..
echo "✅ Debug APK built successfully"
echo ""

# Output location
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  echo "✅ SUCCESS!"
  echo ""
  echo "📱 Debug APK location:"
  echo "   $APK_PATH"
  echo ""
  echo "📲 To install on device:"
  echo "   adb install $APK_PATH"
else
  echo "❌ Error: APK not found at expected location"
  exit 1
fi
