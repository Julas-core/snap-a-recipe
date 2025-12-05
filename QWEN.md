# QWEN Project Documentation - Snap-a-Recipe

## Project Overview
Snap-a-Recipe is a modern web application built with React and TypeScript that leverages the Google Gemini API to generate detailed recipes from food photographs. The application allows users to take photos or upload existing images, then automatically converts them into structured recipes with ingredients, instructions, and descriptions.

## Technology Stack
- **Frontend Framework**: React 19.1.1
- **Programming Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **AI Service**: Google Gemini API (gemini-2.5-flash model)
- **Build Tool**: Vite
- **Package Manager**: npm
- **Additional Libraries**: 
  - react-easy-crop for image cropping functionality
  - @supabase/supabase-js for potential backend services

## Key Features
1. **Image Capture Methods**: Supports both real-time camera capture and image file uploads
2. **Image Cropping**: Intuitive image cropping interface to focus on the dish
3. **AI Recipe Generation**: Uses Gemini API to generate structured recipes in JSON format
4. **Recipe Remixing**: Ability to remix existing recipes to create variations
5. **Multi-language Support**: Recipes can be generated in English, Spanish, French, German, and Italian
6. **Shopping List**: Persistent shopping list functionality using browser localStorage
7. **Kitchen Mode**: Full-screen guided cooking experience with large text
8. **Print/Share Functionality**: Clean print views and native sharing support
9. **Responsive Design**: Optimized for all device sizes (mobile, tablet, desktop)

## Project Structure
```
D:\Projects\snap-a-recipe\
├── .env.local                 # Environment variables (API key)
├── .gitignore               # Git ignore rules
├── App.tsx                  # Main application component
├── index.html               # HTML entry point with Tailwind config
├── index.tsx                # React entry point
├── metadata.json           # Project metadata
├── package.json            # Project dependencies and scripts
├── README.md               # Project documentation
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── types.ts                # TypeScript type definitions
├── components/             # React UI components
│   ├── AuthModal.tsx       # Authentication modal
│   ├── CameraView.tsx      # Camera capture interface
│   ├── Footer.tsx          # Application footer
│   ├── ImageCropper.tsx    # Image cropping component
│   ├── LegalPage.tsx       # Legal information display
│   ├── LoadingSpinner.tsx  # Loading indicator component
│   ├── RecipeDisplay.tsx   # Recipe display component
│   ├── RecipeRemix.tsx     # Recipe remixing functionality
│   ├── RecipeSkeleton.tsx  # Loading skeleton for recipes
│   ├── SavedRecipes.tsx    # Saved recipes management
│   └── ShoppingList.tsx    # Shopping list modal
├── components/icons.tsx    # Icon components
├── services/               # Service layer (API interactions)
│   ├── analytics.ts        # Analytics tracking
│   ├── geminiService.ts    # Gemini API integration
│   └── supabaseClient.ts   # Supabase client configuration
├── utils/                  # Utility functions
│   └── imageUtils.ts       # Image manipulation utilities
├── supabase/               # Supabase configuration and edge functions
│   └── functions/          # Edge functions
│       ├── _shared/        # Shared utilities for edge functions
│       │   └── cors.ts     # CORS configuration
│       ├── generate-recipe/ # Recipe generation endpoint
│       │   └── index.ts    # Main function for recipe generation
│       └── remix-recipe/   # Recipe remixing endpoint
│           └── index.ts    # Main function for recipe remixing
```

## Core Components
- **App.tsx**: Main application state management including image handling, recipe state, and UI flow
- **CameraView.tsx**: Real-time camera capture functionality
- **ImageCropper.tsx**: Image cropping with react-easy-crop
- **RecipeDisplay.tsx**: Presentation of generated recipe with interactive elements
- **RecipeRemix.tsx**: Functionality to remix existing recipes and create variations
- **SavedRecipes.tsx**: Management and display of saved recipes
- **geminiService.ts**: Google Gemini API integration with structured JSON response schema
- **analytics.ts**: Analytics tracking for user interactions and events
- **imageUtils.ts**: Utilities for image processing and manipulation
- **Supabase Edge Functions**: Server-side functions for recipe generation and remixing with CORS handling

## Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key for recipe generation (stored in .env.local)

## API Integration
The application uses the Google Gemini API with a structured JSON response schema:
```typescript
{
  recipeName: string,
  description: string,
  ingredients: string[],
  instructions: string[]
}
```

## Build & Development
- **Development Server**: `npm run dev` (runs on port 3000)
- **Production Build**: `npm run build`
- **Preview Build**: `npm run preview`

## Key Dependencies
- `@google/genai`: Google's official SDK for Gemini API
- `react-easy-crop`: For image cropping functionality
- `@supabase/supabase-js`: For potential backend services
- `vite`: Fast build tool and development server
- `typescript`: Type safety for the entire codebase

## Data Flow
1. User captures or uploads an image
2. Image is processed and cropped if needed
3. Image is sent to Gemini API with recipe generation prompt
4. AI returns structured recipe data as JSON
5. Recipe is displayed in a formatted UI
6. Users can add ingredients to shopping list or print recipes

## Security & Privacy
- API keys are kept client-side but not committed to version control
- Images are sent to Gemini API for processing but not stored
- Shopping list data is persisted in browser localStorage only
- No personal user data is collected or stored on servers

## Customization Options
- Recipe language selection (English, Spanish, French, German, Italian)
- Responsive design adapts to different screen sizes
- Custom Tailwind animations and styling
- Print-friendly recipe views

## Future Enhancement Areas
- Backend authentication and user accounts
- Recipe history tracking
- Social sharing features
- Advanced image recognition for dietary restrictions