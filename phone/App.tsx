import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, TextInput, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from './types';
import { generateRecipeFromImage } from './services/geminiService';
import { CameraIcon, UploadIcon, WandIcon, XIcon, ShoppingCartIcon } from './components/icons';
import RecipeDisplay from './components/RecipeDisplay';
import CameraView from './components/CameraView';
import ImageCropper from './components/ImageCropper';
import RecipeSkeleton from './components/RecipeSkeleton';
import Footer from './components/Footer';
import LegalPage from './components/LegalPage';
import { trackEvent } from './services/analytics';
import ShoppingList, { ShoppingListItem } from './components/ShoppingList';
import SavedRecipesGallery from './components/SavedRecipesGallery';
import './global.css';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const [viewingLegal, setViewingLegal] = useState<'none' | 'privacy' | 'terms'>('none');
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('English');
  const [customLanguage, setCustomLanguage] = useState<string>('');
  const [selectedLanguageType, setSelectedLanguageType] = useState<string>('English');

  const availableLanguages = [
    'English',
    'Tigrigna',
    'Amharic',
    'Arabic',
    'Japanese',
    'French',
    'Spanish',
    'Greek',
    'Custom'
  ];
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  // Track initial page view
  useEffect(() => {
    trackEvent('page_view');
  }, []);

  // Load shopping list from AsyncStorage on initial render
  useEffect(() => {
    const loadShoppingList = async () => {
      try {
        const savedList = await AsyncStorage.getItem('shoppingList');
        if (savedList) {
          setShoppingList(JSON.parse(savedList));
        }
      } catch (error) {
        console.error("Could not load shopping list from storage", error);
        await AsyncStorage.removeItem('shoppingList');
      }
    };
    loadShoppingList();
  }, []);

  // Load saved recipes from AsyncStorage on initial render
  useEffect(() => {
    const loadSavedRecipes = async () => {
      try {
        const savedRecipesData = await AsyncStorage.getItem('savedRecipes');
        if (savedRecipesData) {
          const parsedRecipes = JSON.parse(savedRecipesData);
          const sortedRecipes = parsedRecipes.sort((a: Recipe, b: Recipe) => 
            new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
          );
          setSavedRecipes(sortedRecipes);
        }
      } catch (error) {
        console.error("Could not load saved recipes from storage", error);
        await AsyncStorage.removeItem('savedRecipes');
      }
    };
    loadSavedRecipes();
  }, []);

  // Update saved recipes in AsyncStorage whenever savedRecipes changes
  useEffect(() => {
    const saveRecipes = async () => {
      if (savedRecipes) {
        const recipesWithTimestamps = savedRecipes.map(recipe => {
          if (!recipe.timestamp) {
            return { ...recipe, timestamp: new Date().toISOString() };
          }
          return recipe;
        });

        const sortedRecipes = recipesWithTimestamps.sort((a: Recipe, b: Recipe) => 
          new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
        );
        await AsyncStorage.setItem('savedRecipes', JSON.stringify(sortedRecipes));
      }
    };
    saveRecipes();
  }, [savedRecipes]);

  const updateShoppingList = async (newList: ShoppingListItem[]) => {
    // Update state immediately (synchronous)
    setShoppingList(newList);
    // Save to storage asynchronously
    try {
      await AsyncStorage.setItem('shoppingList', JSON.stringify(newList));
    } catch (error) {
      console.error('Error saving shopping list:', error);
    }
  };

  const handleAddToShoppingList = (recipe: Recipe) => {
    if (shoppingList.some(item => item.recipeName === recipe.recipeName)) {
      return; // Already in the list
    }

    const householdItems = new Set([
      'water', 'salt', 'pepper', 'black pepper', 'oil', 'olive oil', 'cooking oil', 'sugar',
      'butter', 'garlic', 'onion', 'garlic powder', 'onion powder', 'paprika', 'cumin',
      'cayenne pepper', 'chili powder', 'oregano', 'thyme', 'basil', 'rosemary', 'bay leaves',
      'soy sauce', 'vinegar', 'lemon juice', 'lime juice', 'honey', 'flour', 'milk', 'egg', 'eggs',
      'baking powder', 'baking soda', 'vanilla extract', 'cinnamon', 'nutmeg', 'cloves', 'allspice',
      'coriander', 'cardamom', 'ginger', 'turmeric', 'parsley', 'cilantro', 'chives', 'dill',
      'mustard', 'ketchup', 'mayonnaise', 'yeast', 'yeast flakes', 'yeast powder', 'yeast granules',
      'yeast extract', 'mushrooms', 'tomato', 'tomatoes', 'potato', 'potatoes', 'carrot', 'carrots',
      'celery', 'lettuce', 'spinach', 'pepper', 'bell pepper', 'bell peppers', 'cheese', 'cheeses'
    ]);

    const stripMeasurements = (ingredient: string): string => {
      return ingredient
        .replace(/^\d+\s*(\/\d+)?\s*(cups?|tablespoons?|teaspoons?|pieces?|slices?|cloves?|pinches?|drops?|pounds?|ounces?|grams?|kilograms?|liters?|ml|lbs?|kg|g|l|tbsp|tsp|oz|lb|kgs?|gs?|mls?|ls?|quarts?|pints?)\s*/i, '')
        .replace(/^\d+\s*(\/\d+)?\s*to\s*\d+\s*(\/\d+)?\s*(cups?|tablespoons?|teaspoons?|pieces?|slices?|cloves?|pinches?|drops?|pounds?|ounces?|grams?|kilograms?|liters?|ml|lbs?|kg|g|l|tbsp|tsp|oz|lb|kgs?|gs?|mls?|ls?|quarts?|pints?)\s*/i, '')
        .replace(/^\s*(a|an)\s+(cups?|tablespoons?|teaspoons?|pieces?|slices?|cloves?|pinches?|drops?|pounds?|ounces?|grams?|kilograms?|liters?|ml|lbs?|kg|g|l|tbsp|tsp|oz|lb|kgs?|gs?|mls?|ls?|quarts?|pints?)\s*/i, '')
        .trim();
    };

    const isHouseholdItem = (ingredient: string): boolean => {
      const lowerCaseIngredient = ingredient.toLowerCase();
      for (const item of householdItems) {
        if (lowerCaseIngredient.includes(item) &&
            (lowerCaseIngredient === item || lowerCaseIngredient.startsWith(item + ' ') ||
             lowerCaseIngredient.endsWith(' ' + item) || lowerCaseIngredient.includes(' ' + item + ' '))) {
          return true;
        }
      }
      return false;
    };

    const newItems = recipe.ingredients
      .filter(ingredient => {
        if (isHouseholdItem(ingredient)) {
          return false;
        }

        const strippedIngredient = stripMeasurements(ingredient).toLowerCase();
        if (strippedIngredient === 'to taste' ||
            strippedIngredient === 'as needed' ||
            strippedIngredient === 'for garnish' ||
            strippedIngredient === 'optional') {
          return false;
        }

        return true;
      })
      .map(ingredient => {
        let cleanedIngredient = stripMeasurements(ingredient);
        cleanedIngredient = cleanedIngredient.replace(/\b(.*?)(,\s*fresh.*|,\s*chopped.*|,\s*minced.*|,\s*grated.*|,\s*ground.*|,\s*sliced.*|,\s*diced.*)$/i, '$1');
        cleanedIngredient = cleanedIngredient.replace(/\b(fresh|dried|ground|chopped|minced|grated|sliced|diced)\s*/gi, '');
        cleanedIngredient = cleanedIngredient.replace(/\s*,\s*$/, '').trim();

        return {
          text: cleanedIngredient,
          checked: false,
          recipeName: recipe.recipeName,
        };
      });

    // Use functional update to ensure we have the latest state
    setShoppingList(prevList => {
      const updatedList = [...prevList, ...newItems];
      // Save to storage asynchronously
      AsyncStorage.setItem('shoppingList', JSON.stringify(updatedList)).catch(err => {
        console.error('Error saving shopping list:', err);
      });
      return updatedList;
    });
  };

  const handleToggleShoppingListItem = (itemText: string, recipeName: string) => {
    const newList = shoppingList.map(item =>
      item.text === itemText && item.recipeName === recipeName ? { ...item, checked: !item.checked } : item
    );
    updateShoppingList(newList);
  };

  const handleClearShoppingList = () => {
    updateShoppingList([]);
    setIsShoppingListOpen(false);
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    if (!recipe.recipeName) return;

    const existingRecipeIndex = savedRecipes.findIndex(r => r.recipeName === recipe.recipeName);

    if (existingRecipeIndex !== -1) {
      return;
    }

    const recipeWithTimestamp = { ...recipe, timestamp: new Date().toISOString() };
    setSavedRecipes(prev => [recipeWithTimestamp, ...prev]);

    trackEvent('save_recipe', { recipe_name: recipe.recipeName });
  };

  const handleDeleteRecipe = (recipeName: string) => {
    setSavedRecipes(prev => prev.filter(recipe => recipe.recipeName !== recipeName));
    trackEvent('delete_recipe', { recipe_name: recipeName });
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access your photos.');
        return;
      }

      setIsReadingFile(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const imageDataUrl = `data:image/jpeg;base64,${asset.base64}`;
          setImageToCrop(imageDataUrl);
          resetState(true);
        } else {
          setImageToCrop(asset.uri);
          resetState(true);
        }
      }
      setIsReadingFile(false);
    } catch (error) {
      console.error('Error picking image:', error);
      setError("Failed to read the image file. Please try again.");
      setIsReadingFile(false);
    }
  };

  const handleGetRecipe = async () => {
    if (!image) return;

    setIsLoading(true);
    setError(null);
    setActiveRecipe(null);

    // Debug: Log the language being used
    if (__DEV__) {
      console.log('🔤 Current language state:', {
        language,
        selectedLanguageType,
        customLanguage,
      });
    }

    try {
      const generatedRecipe = await generateRecipeFromImage(image, language);
      const recipeWithImage = { ...generatedRecipe, imageUrl: image };
      setActiveRecipe(recipeWithImage);
      setImageUrl(image);
      trackEvent('generate_recipe', { success: true, recipe_name: generatedRecipe.recipeName });
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
      trackEvent('generate_recipe', { success: false, error: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = (keepImageToCrop = false) => {
    setImage(null);
    setImageUrl(null);
    if (!keepImageToCrop) setImageToCrop(null);
    setActiveRecipe(null);
    setError(null);
    setIsLoading(false);
    // Reset language to default
    setSelectedLanguageType('English');
    setLanguage('English');
    setCustomLanguage('');
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    setImageToCrop(imageDataUrl);
    setIsCameraOpen(false);
    resetState(true);
  };

  const handleCropComplete = (croppedImage: string) => {
    setImage(croppedImage);
    setImageToCrop(null);
  };

  const handleCropCancel = () => {
    setImageToCrop(null);
  };

  const isCurrentRecipeInShoppingList = activeRecipe ? shoppingList.some(item => item.recipeName === activeRecipe.recipeName) : false;
  const uncheckedShoppingListCount = shoppingList.filter(item => !item.checked).length;

  return (
    <SafeAreaView className="flex-1 bg-amber-50">
      <StatusBar style="dark" />
      
      <CameraView 
        visible={isCameraOpen} 
        onCapture={handleCameraCapture} 
        onCancel={() => setIsCameraOpen(false)} 
      />
      
      <ImageCropper
        visible={!!imageToCrop}
        imageUri={imageToCrop || ''}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
      
      <LegalPage 
        title="Privacy Policy" 
        visible={viewingLegal === 'privacy'}
        onDismiss={() => setViewingLegal('none')}
      >
        <View>
          <Text className="mb-4 text-amber-900">
            <Text className="font-bold">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </Text>
          <Text className="mb-4 text-amber-900">
            Welcome to Snap-a-Recipe ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
          </Text>
          <Text className="font-bold text-lg mb-2 text-amber-900">1. Information We Collect</Text>
          <Text className="mb-4 text-amber-900">We may collect information about you in a variety of ways. The information we may collect via the Application includes:</Text>
          <Text className="mb-2 text-amber-900">
            {'\n'}• <Text className="font-bold">User-Generated Content:</Text> We process the images you upload or capture to generate recipes. These images are sent to our AI provider for analysis but are not stored on our servers or associated with any personal information.{'\n'}
          </Text>
          <Text className="mb-4 text-amber-900">
            • <Text className="font-bold">Analytics Data:</Text> We may collect anonymous usage data, such as which features are used, to improve our service. This data is not linked to your personal identity.
          </Text>
          <Text className="font-bold text-lg mb-2 text-amber-900">2. Use of Your Information</Text>
          <Text className="mb-4 text-amber-900">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</Text>
          <Text className="mb-2 text-amber-900">{'\n'}• Generate recipes based on the images you provide.</Text>
          <Text className="mb-4 text-amber-900">{'\n'}• Monitor and analyze usage and trends to improve your experience with the Application.</Text>
          <Text className="font-bold text-lg mb-2 text-amber-900">3. Security of Your Information</Text>
          <Text className="mb-4 text-amber-900">
            We are committed to protecting your data. Since we do not store your images or personal data, the risk of a data breach is minimized. We use secure, encrypted connections (HTTPS) for all data transmissions to our AI service provider.
          </Text>
          <Text className="font-bold text-lg mb-2 text-amber-900">4. Third-Party Services</Text>
          <Text className="mb-4 text-amber-900">This application uses the following third-party services:</Text>
          <Text className="mb-4 text-amber-900">
            {'\n'}• <Text className="font-bold">Google Gemini API:</Text> To analyze images and generate recipe content. Your images are sent to Google's servers for processing. Please review Google's Privacy Policy for more information.{'\n'}
          </Text>
          <Text className="font-bold text-lg mb-2 text-amber-900">5. Contact Us</Text>
          <Text className="text-amber-900">If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Email Here]</Text>
        </View>
      </LegalPage>
      
      <LegalPage 
        title="Terms of Service" 
        visible={viewingLegal === 'terms'}
        onDismiss={() => setViewingLegal('none')}
      >
        <View>
          <Text className="mb-4 text-amber-900">
            <Text className="font-bold">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </Text>
          <Text className="mb-4 text-amber-900">
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Snap-a-Recipe application (the "Service") operated by us.
          </Text>
          <Text className="mb-4 text-amber-900">Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</Text>
          <Text className="font-bold text-lg mb-2 text-amber-900">1. User Content</Text>
          <Text className="mb-4 text-amber-900">
            Our Service allows you to upload images ("User Content"). You retain any and all of your rights to any User Content you submit. By submitting User Content to the Service, you grant us the right and license to use this content solely for the purpose of generating a recipe for you.
          </Text>
          <Text className="font-bold text-lg mb-2 text-amber-900">2. Prohibited Uses</Text>
          <Text className="mb-4 text-amber-900">You agree not to use the Service to upload or generate content that is unlawful, obscene, defamatory, or otherwise objectionable.</Text>
          <Text className="font-bold text-lg mb-2 text-amber-900">3. Disclaimer</Text>
          <Text className="mb-4 text-amber-900">
            The recipes provided by the Service are generated by an AI model and are for informational purposes only. We do not guarantee the accuracy, completeness, or safety of any recipe. You should always use your best judgment, follow safe food handling practices, and consult a professional if you have any dietary restrictions or health concerns.
          </Text>
          <Text className="font-bold text-lg mb-2 text-amber-900">4. Termination</Text>
          <Text className="mb-4 text-amber-900">
            We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </Text>
          <Text className="font-bold text-lg mb-2 text-amber-900">5. Contact Us</Text>
          <Text className="text-amber-900">If you have any questions about these Terms, please contact us at: [Your Contact Email Here]</Text>
        </View>
      </LegalPage>
      
      <ShoppingList
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        items={shoppingList}
        onToggleItem={(text, name) => handleToggleShoppingListItem(text, name)}
        onClear={handleClearShoppingList}
      />

      <ScrollView className="flex-1" contentContainerClassName="items-center p-4">
        <View className="w-full max-w-7xl items-center mb-8 relative">
          {/* Back button - shows when viewing a recipe */}
          {(activeRecipe || image) && (
            <Pressable
              onPress={() => resetState()}
              className="absolute top-0 left-0 z-10 bg-white rounded-full p-2 shadow-lg items-center justify-center"
            >
              <XIcon size={24} />
            </Pressable>
          )}
          <Text className="text-4xl font-bold text-amber-900 font-serif">Snap-a-Recipe</Text>
          <Text className="mt-2 text-lg text-amber-700">Turn your food photos into delicious recipes!</Text>
          <Pressable
            onPress={() => setIsShoppingListOpen(true)}
            className="absolute top-0 right-0 h-10 w-10 bg-amber-100 rounded-full items-center justify-center"
          >
            <ShoppingCartIcon size={24} />
            {uncheckedShoppingListCount > 0 && (
              <View className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-xs font-bold text-white">{uncheckedShoppingListCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View className="w-full max-w-7xl flex-1 items-center">
          {!image && !imageToCrop && !activeRecipe && (
            <View className="w-full max-w-4xl bg-white/60 p-8 rounded-2xl shadow-lg items-center">
              <Text className="text-2xl font-semibold mb-4 font-serif">Get Started</Text>
              <Text className="text-amber-800 mb-6">Choose how to provide an image of your meal:</Text>

              <View className="max-w-xs mb-6 w-full">
                <Text className="block text-sm font-medium text-amber-800 mb-2">Recipe Language</Text>
                <View className="block w-full bg-white border border-amber-300 rounded-lg overflow-hidden">
                  <Picker
                    selectedValue={selectedLanguageType}
                    onValueChange={(itemValue) => {
                      setSelectedLanguageType(itemValue);
                      if (itemValue !== 'Custom') {
                        setLanguage(itemValue);
                        setCustomLanguage('');
                      }
                    }}
                    style={{ color: '#92400e' }}
                  >
                    {availableLanguages.map((lang) => (
                      <Picker.Item key={lang} label={lang} value={lang} />
                    ))}
                  </Picker>
                </View>
                {selectedLanguageType === 'Custom' && (
                  <View className="mt-3 w-full">
                    <TextInput
                      value={customLanguage}
                      onChangeText={(text) => {
                        setCustomLanguage(text);
                        setLanguage(text);
                      }}
                      placeholder="Enter your language"
                      className="w-full px-4 py-2 bg-white border border-amber-300 rounded-lg text-amber-900"
                      placeholderTextColor="#a16207"
                    />
                  </View>
                )}
              </View>

              <View className="flex-col gap-4">
                <Pressable 
                  onPress={() => setIsCameraOpen(true)} 
                  disabled={isReadingFile} 
                  className="flex-row items-center justify-center gap-3 px-6 py-3 bg-amber-500 rounded-lg"
                >
                  <CameraIcon size={24} />
                  <Text className="text-white font-semibold">Take a Photo</Text>
                </Pressable>
                <Pressable 
                  onPress={handleImagePicker} 
                  disabled={isReadingFile} 
                  className="flex-row items-center justify-center gap-3 px-6 py-3 bg-amber-800 rounded-lg"
                >
                  {isReadingFile ? (
                    <Text className="text-white">Processing...</Text>
                  ) : (
                    <>
                      <UploadIcon size={24} />
                      <Text className="text-white font-semibold">Upload Image</Text>
                    </>
                  )}
                </Pressable>
              </View>

              <SavedRecipesGallery
                recipes={savedRecipes}
                onSelect={recipe => {
                  setActiveRecipe(recipe);
                  setImage(recipe.imageUrl || null);
                  setImageUrl(recipe.imageUrl || null);
                }}
                onDelete={handleDeleteRecipe}
              />
            </View>
          )}

          {(image || activeRecipe) && (
            <View className="w-full max-w-7xl gap-8 items-start">
              {(image || activeRecipe?.imageUrl) && (
                <View className="relative w-full">
                  <View className="p-2 bg-white rounded-2xl shadow-2xl">
                    <Image 
                      source={{ uri: image || activeRecipe?.imageUrl || '' }} 
                      className="rounded-xl w-full aspect-square"
                      resizeMode="cover"
                    />
                  </View>
                  <Pressable 
                    onPress={() => resetState()} 
                    className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg z-10"
                  >
                    <XIcon size={24} />
                  </Pressable>
                </View>
              )}

              <View className="w-full mt-8">
                {isLoading ? (
                  <RecipeSkeleton />
                ) : error ? (
                  <View className="bg-red-100 border-l-4 border-red-500 p-4 rounded-md shadow-md w-full flex-row justify-between items-center">
                    <Text className="flex-grow pr-4 text-red-800">{error}</Text>
                    <Pressable
                      onPress={() => setError(null)}
                      className="p-1 rounded-full"
                    >
                      <XIcon size={20} />
                    </Pressable>
                  </View>
                ) : activeRecipe ? (
                  <RecipeDisplay
                    recipe={activeRecipe}
                    onAddToShoppingList={handleAddToShoppingList}
                    isRecipeInShoppingList={isCurrentRecipeInShoppingList}
                    onSaveRecipe={handleSaveRecipe}
                    isRecipeSaved={savedRecipes.some(r => r.recipeName === activeRecipe?.recipeName)}
                  />
                ) : (
                  <View className="w-full items-center bg-white/60 p-8 rounded-2xl shadow-lg">
                    <Text className="text-2xl font-semibold mb-4 font-serif text-amber-900">Image Ready!</Text>
                    <Text className="text-amber-800 mb-8 max-w-sm text-center">Your photo is perfectly cropped and ready to be transformed into a delicious recipe.</Text>
                    <Pressable 
                      onPress={handleGetRecipe} 
                      className="flex-row items-center justify-center gap-3 px-8 py-4 bg-amber-500 rounded-xl"
                    >
                      <WandIcon size={28} />
                      <Text className="text-white text-xl font-bold">Generate Recipe</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          )}
    </View>

        <Footer onLinkClick={setViewingLegal} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
