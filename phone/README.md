# Snap-a-Recipe Mobile App

React Native mobile application built with Expo SDK 54, converted from the React web app.

## Features

- Camera capture and image upload
- Image cropping
- AI-powered recipe generation using Google Gemini API
- Shopping list management
- Saved recipes gallery
- Kitchen mode for step-by-step cooking
- Multi-language recipe generation
- Share recipes

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with:
```
GEMINI_API_KEY=your_api_key_here
SUPABASE_URL=your_supabase_url (optional)
SUPABASE_ANON_KEY=your_supabase_key (optional)
```

3. Start the development server:
```bash
npm start
```

## Tech Stack

- **Expo SDK 54** - React Native framework
- **React Native** - Mobile UI framework
- **TypeScript** - Type safety
- **NativeWind** - Tailwind CSS for React Native
- **Expo Image Picker** - Camera and image selection
- **Expo Image Manipulator** - Image cropping
- **AsyncStorage** - Local data persistence
- **Google Gemini API** - AI recipe generation

## Project Structure

```
phone/
├── App.tsx                 # Main app component
├── components/            # React components
├── services/              # API and service layer
├── utils/                 # Utility functions
├── types.ts              # TypeScript type definitions
├── app.json              # Expo configuration
└── global.css            # Tailwind CSS styles
```

## Building

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web
```bash
npm run web
```

## Notes

- The app requires camera and photo library permissions
- Environment variables should be set in `app.json` `extra` field or via `.env` file
- NativeWind v4 is used for styling with Tailwind CSS classes

