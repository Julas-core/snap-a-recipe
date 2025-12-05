import React, { useState, useRef, useEffect } from 'react';
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


  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track initial page view
  useEffect(() => {
    trackEvent('page_view');
  }, []);
  
  // Load shopping list from localStorage on initial render
  useEffect(() => {
    try {
      const savedList = localStorage.getItem('shoppingList');
      if (savedList) {
        setShoppingList(JSON.parse(savedList));
      }
    } catch (error) {
      console.error("Could not load shopping list from local storage", error);
      localStorage.removeItem('shoppingList');
    }
  }, []);

  const updateShoppingList = (newList: ShoppingListItem[]) => {
    setShoppingList(newList);
    localStorage.setItem('shoppingList', JSON.stringify(newList));
  };

  const handleAddToShoppingList = (recipe: Recipe) => {
    if (shoppingList.some(item => item.recipeName === recipe.recipeName)) {
      return; // Already in the list
    }
  
    const newItems = recipe.ingredients.map(ingredient => ({
      text: ingredient,
      checked: false,
      recipeName: recipe.recipeName,
    }));
  
    updateShoppingList([...shoppingList, ...newItems]);
  };
  
  const handleToggleShoppingListItem = (itemText: string, recipeName: string) => {
    const newList = shoppingList.map(item =>
      item.text === itemText && item.recipeName === recipeName ? { ...item, checked: !item.checked } : item
    );
    updateShoppingList(newList);
  };
  
  const handleClearShoppingList = () => {
    updateShoppingList([]);
    setIsShoppingListOpen(false); // Close modal on clear
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsReadingFile(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        resetState(true);
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setError("Failed to read the image file. Please try again.");
        setIsReadingFile(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetRecipe = async () => {
    if (!image) return;

    setIsLoading(true);
    setError(null);
    setActiveRecipe(null);

    try {
      const generatedRecipe = await generateRecipeFromImage(image, language);
      setActiveRecipe({ ...generatedRecipe, imageUrl: image });
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
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isCurrentRecipeInShoppingList = activeRecipe ? shoppingList.some(item => item.recipeName === activeRecipe.recipeName) : false;
  const uncheckedShoppingListCount = shoppingList.filter(item => !item.checked).length;

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 md:p-8 bg-amber-50 text-amber-900 print:bg-white print:p-4 print:block">
      {isCameraOpen && <CameraView onCapture={handleCameraCapture} onCancel={() => setIsCameraOpen(false)} />}
      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      {viewingLegal === 'privacy' && (
        <LegalPage title="Privacy Policy" onDismiss={() => setViewingLegal('none')}>
            <>
              <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
              <p>
                  Welcome to Snap-a-Recipe ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
              </p>
              <h3>1. Information We Collect</h3>
              <p>We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
              <ul>
                  <li>
                      <strong>User-Generated Content:</strong> We process the images you upload or capture to generate recipes. These images are sent to our AI provider for analysis but are not stored on our servers or associated with any personal information.
                  </li>
                  <li>
                      <strong>Analytics Data:</strong> We may collect anonymous usage data, such as which features are used, to improve our service. This data is not linked to your personal identity.
                  </li>
              </ul>
              <h3>2. Use of Your Information</h3>
              <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
              <ul>
                  <li>Generate recipes based on the images you provide.</li>
                  <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
              </ul>
              <h3>3. Security of Your Information</h3>
              <p>
                  We are committed to protecting your data. Since we do not store your images or personal data, the risk of a data breach is minimized. We use secure, encrypted connections (HTTPS) for all data transmissions to our AI service provider.
              </p>
              <h3>4. Third-Party Services</h3>
              <p>This application uses the following third-party services:</p>
              <ul>
                  <li><strong>Google Gemini API:</strong> To analyze images and generate recipe content. Your images are sent to Google's servers for processing. Please review Google's Privacy Policy for more information.</li>
              </ul>
              <h3>5. Contact Us</h3>
              <p>If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Email Here]</p>
            </>
        </LegalPage>
      )}
      {viewingLegal === 'terms' && (
        <LegalPage title="Terms of Service" onDismiss={() => setViewingLegal('none')}>
            <>
              <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
              <p>
                  Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Snap-a-Recipe application (the "Service") operated by us.
              </p>
              <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
              <h3>1. User Content</h3>
              <p>
                  Our Service allows you to upload images ("User Content"). You retain any and all of your rights to any User Content you submit. By submitting User Content to the Service, you grant us the right and license to use this content solely for the purpose of generating a recipe for you.
              </p>
              <h3>2. Prohibited Uses</h3>
              <p>You agree not to use the Service to upload or generate content that is unlawful, obscene, defamatory, or otherwise objectionable.</p>
              <h3>3. Disclaimer</h3>
              <p>
                  The recipes provided by the Service are generated by an AI model and are for informational purposes only. We do not guarantee the accuracy, completeness, or safety of any recipe. You should always use your best judgment, follow safe food handling practices, and consult a professional if you have any dietary restrictions or health concerns.
              </p>
              <h3>4. Termination</h3>
              <p>
                  We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <h3>5. Contact Us</h3>
              <p>If you have any questions about these Terms, please contact us at: [Your Contact Email Here]</p>
            </>
        </LegalPage>
      )}
      <ShoppingList
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        items={shoppingList}
        onToggleItem={(text, name) => handleToggleShoppingListItem(text, name)}
        onClear={handleClearShoppingList}
      />
      
      <header className="w-full max-w-7xl text-center mb-8 relative no-print">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-amber-900 drop-shadow-sm font-serif">
          Snap-a-Recipe
        </h1>
        <p className="mt-2 text-lg sm:text-xl text-amber-700">
          Turn your food photos into delicious recipes!
        </p>
        <div className="absolute top-0 right-0 h-full flex items-center gap-4">
            <button
                onClick={() => setIsShoppingListOpen(true)}
                className="relative flex items-center justify-center h-10 w-10 bg-amber-100 rounded-full text-amber-800 shadow-md hover:bg-amber-200 transition"
                aria-label="Open shopping list"
            >
                <ShoppingCartIcon className="w-6 h-6" />
                {uncheckedShoppingListCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {uncheckedShoppingListCount}
                    </span>
                )}
            </button>
        </div>
      </header>
      
      <main className="w-full max-w-7xl flex-grow flex flex-col items-center print:max-w-none print:w-full print:block">
        <div className="w-full flex-grow flex flex-col justify-center items-center">
            {!image && !imageToCrop && !activeRecipe && (
              <div className="w-full max-w-4xl bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg text-center animate-fade-in no-print">
                  <h2 className="text-2xl font-semibold mb-4 font-serif">Get Started</h2>
                  <p className="text-amber-800 mb-6">Choose how to provide an image of your meal:</p>
                  
                  <div className="max-w-xs mx-auto mb-6">
                    <label htmlFor="language-select" className="block text-sm font-medium text-amber-800 mb-2">Recipe Language</label>
                    <select
                      id="language-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="block w-full px-4 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-shadow"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button onClick={() => setIsCameraOpen(true)} disabled={isReadingFile} className="flex items-center justify-center gap-3 px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 disabled:bg-amber-400 disabled:cursor-not-allowed">
                          <CameraIcon className="w-6 h-6" />
                          Take a Photo
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} disabled={isReadingFile} className="flex items-center justify-center gap-3 px-6 py-3 bg-amber-800 text-white font-semibold rounded-lg shadow-md hover:bg-amber-900 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-opacity-75 disabled:bg-amber-700 disabled:cursor-wait">
                          {isReadingFile ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing...</span>
                            </>
                          ) : (
                            <>
                                <UploadIcon className="w-6 h-6" />
                                <span>Upload Image</span>
                            </>
                          )}
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>
              </div>
            )}

            {(image || activeRecipe) && (
              <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-start print:block">
                {/* Image Column */}
                <div className="relative w-full animate-fade-in no-print">
                    {image && (
                        <>
                            <div className="p-2 bg-white rounded-2xl shadow-2xl shadow-amber-900/20">
                                <img src={image} alt="Selected meal" className="rounded-xl object-cover w-full aspect-square lg:sticky lg:top-8" />
                            </div>
                            <button onClick={() => resetState()} className="absolute -top-3 -right-3 bg-white text-amber-800 rounded-full p-2 shadow-lg hover:bg-amber-100 transition-transform transform hover:scale-110">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </div>

                {/* Content Column */}
                <div className="w-full mt-8 lg:mt-0 print:mt-0">
                  {isLoading ? (
                      <RecipeSkeleton />
                  ) : error ? (
                      <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-md w-full flex justify-between items-center animate-fade-in">
                          <span className="flex-grow pr-4">{error}</span>
                          <button
                              onClick={() => setError(null)}
                              className="p-1 rounded-full text-red-600 hover:bg-red-200 transition-colors flex-shrink-0"
                              aria-label="Dismiss error"
                          >
                              <XIcon className="w-5 h-5" />
                          </button>
                      </div>
                  ) : activeRecipe ? (
                      <div className="animate-fade-in">
                          <RecipeDisplay 
                            recipe={activeRecipe} 
                            onAddToShoppingList={handleAddToShoppingList}
                            isRecipeInShoppingList={isCurrentRecipeInShoppingList}
                          />
                      </div>
                  ) : (
                    <div className="w-full text-center bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg animate-fade-in flex flex-col justify-center h-full no-print">
                        <h2 className="text-2xl font-semibold mb-4 font-serif text-amber-900">Image Ready!</h2>
                        <p className="text-amber-800 mb-8 max-w-sm mx-auto">Your photo is perfectly cropped and ready to be transformed into a delicious recipe.</p>
                        <button onClick={handleGetRecipe} className="group flex items-center justify-center mx-auto gap-3 px-8 py-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xl font-bold rounded-xl shadow-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300 animate-pulse-glow">
                            <WandIcon className="w-7 h-7 transition-transform duration-300 group-hover:rotate-12"/>
                            Generate Recipe
                        </button>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
        
        <Footer onLinkClick={setViewingLegal} />
      </main>
    </div>
  );
};

export default App;