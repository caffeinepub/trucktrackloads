# Android Build & Play Store Publishing Guide

This guide walks you through building Android APK and AAB (Android App Bundle) files for **TruckTrackLoads** and preparing them for Google Play Store upload.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [One-Time Setup](#one-time-setup)
3. [Building Debug APK](#building-debug-apk)
4. [Building Signed Release APK](#building-signed-release-apk)
5. [Building Signed Release AAB for Play Store](#building-signed-release-aab-for-play-store)
6. [Versioning Your App](#versioning-your-app)
7. [Play Store Readiness Checklist](#play-store-readiness-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js & npm** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Java Development Kit (JDK)** (v17 or higher)
   - Download from: https://adoptium.net/
   - Verify installation: `java --version`
   - Set `JAVA_HOME` environment variable

3. **Android Studio** (latest stable version)
   - Download from: https://developer.android.com/studio
   - During installation, ensure you install:
     - Android SDK
     - Android SDK Platform-Tools
     - Android SDK Build-Tools

4. **Android SDK Command Line Tools**
   - Open Android Studio → Settings → Appearance & Behavior → System Settings → Android SDK
   - Install the following:
     - Android SDK Platform (API 33 or higher)
     - Android SDK Build-Tools (latest version)
     - Android SDK Command-line Tools

5. **Environment Variables**
   - Set `ANDROID_HOME` to your Android SDK location
     - macOS/Linux: `export ANDROID_HOME=$HOME/Library/Android/sdk`
     - Windows: `set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk`
   - Add to PATH:
     - macOS/Linux: `export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin`
     - Windows: Add `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\cmdline-tools\latest\bin` to PATH

### Verify Installation

Run these commands to verify everything is set up correctly:

