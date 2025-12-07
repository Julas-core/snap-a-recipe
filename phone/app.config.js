require('dotenv').config();

module.exports = {
  expo: {
    name: "Snap-a-Recipe",
    slug: "snap-a-recipe",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#fef3c7"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.snaparecipe.app",
      infoPlist: {
        NSCameraUsageDescription: "This app needs access to your camera to take photos of food for recipe generation.",
        NSPhotoLibraryUsageDescription: "This app needs access to your photo library to select images for recipe generation."
      }
    },
    android: {
      package: "com.snaparecipe.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#fef3c7"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you select images for recipe generation."
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission: "The app accesses your camera to let you take photos of food for recipe generation."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "92020bbc-63e5-45a6-b6f4-ce623bb8f2b2"
      },
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
};

