import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Recipe } from '../types';
import { KitchenIcon, ShareIcon, XIcon, CopyIcon, ShoppingCartIcon } from './icons';

interface RecipeDisplayProps {
  recipe: Recipe;
  onAddToShoppingList?: (recipe: Recipe) => void;
  isRecipeInShoppingList?: boolean;
  onSaveRecipe?: (recipe: Recipe) => void;
  isRecipeSaved?: boolean;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, onAddToShoppingList, isRecipeInShoppingList, onSaveRecipe, isRecipeSaved }) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isKitchenMode, setIsKitchenMode] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy Text');
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');

  const currentStepIndex = recipe.instructions.findIndex((_, i) => !completedSteps.has(i));
  const allStepsCompleted = currentStepIndex === -1;

  const handleToggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleToggleStep = (index: number) => {
    if (isKitchenMode) {
        if (index === currentStepIndex) {
            setCompletedSteps(prev => new Set(prev).add(index));
        }
    } else {
        setCompletedSteps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }
  };

  const resetSteps = () => {
    setCompletedSteps(new Set());
  };

  const fullRecipeText = useMemo(() => {
    return `Recipe: ${recipe.recipeName}\n\n${recipe.description}\n\nIngredients:\n- ${recipe.ingredients.join('\n- ')}\n\nInstructions:\n${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
  }, [recipe]);

  const handleCopyToClipboard = async () => {
    try {
        await Clipboard.setStringAsync(fullRecipeText);
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy Text'), 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        setCopyButtonText('Failed to copy');
        setTimeout(() => setCopyButtonText('Copy Text'), 2000);
    }
  };

  const handleNativeShare = async () => {
    const shareTitle = `Recipe: ${recipe.recipeName}`;
    try {
        await Share.share({
            title: shareTitle,
            message: fullRecipeText,
        });
        setIsShareModalOpen(false);
    } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.error('Error sharing:', error);
        }
    }
  };

  return (
    <>
      {/* Ingredients Modal for Kitchen Mode */}
      <Modal
        visible={showIngredients}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowIngredients(false)}
      >
        <Pressable 
          className="flex-1 bg-black/60 items-center justify-center p-4" 
          onPress={() => setShowIngredients(false)}
        >
          <Pressable 
            className="bg-amber-50 rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[85vh]"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-2xl font-serif font-bold text-amber-900">Ingredients ({recipe.ingredients.length})</Text>
                <Pressable 
                  onPress={() => setShowIngredients(false)}
                  className="p-1 rounded-full"
                >
                    <XIcon size={24} />
                </Pressable>
            </View>
            <ScrollView className="space-y-3">
              {recipe.ingredients.map((ingredient, i) => (
                <View key={i} className="flex-row items-start gap-3">
                  <View className="mt-1 w-2 h-2 bg-amber-400 rounded-full flex-shrink-0"></View>
                  <Text>{ingredient}</Text>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Share Modal */}
      <Modal
        visible={isShareModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsShareModalOpen(false)}
      >
        <Pressable 
          className="flex-1 bg-black/60 items-center justify-center p-4" 
          onPress={() => setIsShareModalOpen(false)}
        >
          <Pressable 
            className="bg-amber-50 rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-2xl font-serif font-bold text-amber-900 mb-4 text-center">Share Recipe</Text>
            <View className="flex-col gap-4">
                <Pressable 
                  onPress={handleNativeShare} 
                  className="w-full px-4 py-2 bg-amber-500 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">Share Natively</Text>
                </Pressable>
                <Pressable 
                  onPress={handleCopyToClipboard} 
                  className="w-full px-4 py-2 bg-amber-800 rounded-lg flex-row items-center justify-center gap-2"
                >
                  <CopyIcon size={20} />
                  <Text className="text-white font-semibold">{copyButtonText}</Text>
                </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Kitchen Mode */}
      {isKitchenMode && (
        <Modal
          visible={isKitchenMode}
          animationType="fade"
        >
          <View className="flex-1 bg-amber-50 items-center justify-center p-4">
            <View className="w-full max-w-3xl">
              <Text className="text-3xl font-serif text-amber-900 mb-2 text-center">
                {allStepsCompleted ? "Enjoy your meal!" : `Step ${currentStepIndex + 1} of ${recipe.instructions.length}`}
              </Text>
              <Text className="text-xl text-amber-800 font-light min-h-[10rem] items-center justify-center p-4 text-center">
                {allStepsCompleted ? "You've successfully completed all the steps." : recipe.instructions[currentStepIndex]}
              </Text>

              <View className="flex-col items-center gap-4 mt-8">
                {!allStepsCompleted && (
                  <Pressable 
                    onPress={() => handleToggleStep(currentStepIndex)} 
                    className="px-8 py-4 bg-green-600 rounded-xl"
                  >
                    <Text className="text-white text-lg font-bold">Mark as Complete</Text>
                  </Pressable>
                )}
                {allStepsCompleted && (
                  <Pressable 
                    onPress={resetSteps} 
                    className="px-8 py-4 bg-amber-600 rounded-xl"
                  >
                    <Text className="text-white text-lg font-bold">Start Over</Text>
                  </Pressable>
                )}
              </View>
            </View>
            <View className="absolute bottom-6 flex-row flex-wrap justify-center gap-4">
                <Pressable 
                  onPress={() => setShowIngredients(true)} 
                  className="px-4 py-2 bg-amber-200 rounded-lg"
                >
                  <Text className="text-amber-800 font-semibold">View Ingredients</Text>
                </Pressable>
                <Pressable 
                  onPress={() => setIsKitchenMode(false)} 
                  className="px-4 py-2 bg-red-200 rounded-lg"
                >
                  <Text className="text-red-800 font-semibold">Exit Kitchen Mode</Text>
                </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Main Recipe Display */}
      <View className="bg-white/80 rounded-2xl shadow-lg p-6 w-full">
        <View className="items-center">
          <Text className="text-3xl font-bold text-amber-900 font-serif mb-2">{recipe.recipeName}</Text>
          <Text className="text-amber-800/90 text-center max-w-3xl mb-6">
            {recipe.description}
          </Text>
        </View>
        
        {/* Action Buttons */}
        <View className="flex-row flex-wrap justify-center gap-2 mb-8 border-t border-b border-amber-200 py-4">
            <Pressable 
              onPress={() => setIsKitchenMode(true)} 
              className="flex-row items-center gap-2 px-3 py-2 bg-amber-100 rounded-lg"
            >
              <KitchenIcon size={20} />
              <Text className="text-amber-800 font-semibold text-sm">Kitchen Mode</Text>
            </Pressable>
            {onAddToShoppingList && (
                <Pressable 
                  onPress={() => onAddToShoppingList(recipe)}
                  disabled={isRecipeInShoppingList}
                  className="flex-row items-center gap-2 px-3 py-2 bg-amber-100 rounded-lg"
                >
                  <ShoppingCartIcon size={20} />
                  <Text className="text-amber-800 font-semibold text-sm">
                    {isRecipeInShoppingList ? 'Added to List' : 'Add to Shopping List'}
                  </Text>
                </Pressable>
            )}
            {onSaveRecipe && (
                <Pressable
                  onPress={() => onSaveRecipe(recipe)}
                  className="px-3 py-2 bg-amber-100 rounded-lg"
                >
                  <Text className="text-amber-800 font-semibold text-sm">
                    {isRecipeSaved ? '✓ Saved' : 'Save Recipe'}
                  </Text>
                </Pressable>
            )}
            <Pressable 
              onPress={() => setIsShareModalOpen(true)} 
              className="flex-row items-center gap-2 px-3 py-2 bg-amber-100 rounded-lg"
            >
              <ShareIcon size={20} />
              <Text className="text-amber-800 font-semibold text-sm">Share</Text>
            </Pressable>
        </View>

        {/* Ingredients and Instructions */}
        <View>
            <View className="border-b border-amber-300 mb-6">
                <View className="flex-row justify-center space-x-2 -mb-px">
                   <Pressable 
                     onPress={() => setActiveTab('ingredients')} 
                     className={`py-3 px-4 border-b-4 ${
                       activeTab === 'ingredients' ? 'border-amber-500' : 'border-transparent'
                     }`}
                   >
                     <Text className={`font-semibold text-lg ${
                       activeTab === 'ingredients' ? 'text-amber-800' : 'text-amber-600'
                     }`}>Ingredients</Text>
                   </Pressable>
                   <Pressable 
                     onPress={() => setActiveTab('instructions')} 
                     className={`py-3 px-4 border-b-4 ${
                       activeTab === 'instructions' ? 'border-amber-500' : 'border-transparent'
                     }`}
                   >
                     <Text className={`font-semibold text-lg ${
                       activeTab === 'instructions' ? 'text-amber-800' : 'text-amber-600'
                     }`}>Instructions</Text>
                   </Pressable>
                </View>
            </View>
            
            {activeTab === 'ingredients' && (
                <ScrollView className="space-y-4 mt-6">
                    {recipe.ingredients.map((ingredient, i) => (
                        <Pressable 
                          key={i} 
                          onPress={() => handleToggleIngredient(i)} 
                          className="flex-row items-center gap-3 p-2 rounded-lg"
                        >
                            <View className={`w-6 h-6 rounded-md border-2 ${
                              checkedIngredients.has(i) ? 'bg-amber-600 border-amber-600' : 'border-amber-400'
                            } items-center justify-center flex-shrink-0`}>
                                {checkedIngredients.has(i) && (
                                  <Text className="text-white text-xs">✓</Text>
                                )}
                            </View>
                            <Text className={`flex-grow ${
                              checkedIngredients.has(i) ? 'line-through text-amber-800/60' : 'text-amber-800'
                            }`}>{ingredient}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            )}
            {activeTab === 'instructions' && (
                <ScrollView className="space-y-4 mt-6">
                    {recipe.instructions.map((step, i) => (
                        <Pressable 
                          key={i} 
                          onPress={() => handleToggleStep(i)} 
                          className="p-2 rounded-lg"
                        >
                            <Text className={`${
                              completedSteps.has(i) ? 'line-through text-amber-800/50' : 'text-amber-800/90'
                            }`}>
                              {i + 1}. {step}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            )}
        </View>
      </View>
    </>
  );
};

export default RecipeDisplay;

