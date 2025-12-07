import React, { useState, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { Recipe } from '../types';
import { XIcon } from './icons';

interface SavedRecipesGalleryProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onDelete: (recipeName: string) => void;
}

const SavedRecipesGallery: React.FC<SavedRecipesGalleryProps> = ({ recipes, onSelect, onDelete }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollLeft = () => {
    scrollViewRef.current?.scrollTo({ x: -200, animated: true });
  };

  const scrollRight = () => {
    scrollViewRef.current?.scrollTo({ x: 200, animated: true });
  };

  // Format date to be more readable
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (recipes.length === 0) {
    return null; // Don't render if there are no saved recipes
  }

  return (
    <View className="w-full max-w-4xl mt-8">
      <Text className="text-2xl font-semibold mb-4 font-serif text-amber-900">Recently Created</Text>

      <View className="relative">
        {/* Left scroll arrow */}
        <Pressable
          onPress={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-lg"
        >
          <Text className="text-amber-800 text-xl">‹</Text>
        </Pressable>
        
        {/* Right scroll arrow */}
        {recipes.length > 0 && (
          <Pressable
            onPress={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-lg"
          >
            <Text className="text-amber-800 text-xl">›</Text>
          </Pressable>
        )}
        
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row space-x-4 py-2 px-8"
        >
          {recipes.map((recipe, index) => (
            <Pressable 
              key={recipe.recipeName + (recipe.timestamp || index)} 
              onPress={() => onSelect(recipe)}
              className="flex-shrink-0 w-64 bg-white/80 rounded-2xl shadow-lg overflow-hidden"
            >
              <View className="relative">
                {recipe.imageUrl ? (
                  <Image 
                    source={{ uri: recipe.imageUrl }} 
                    className="w-full h-36"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-36 bg-amber-200 items-center justify-center">
                    <Text className="text-amber-700 font-medium">No Image</Text>
                  </View>
                )}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(recipe.recipeName);
                  }}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow-md"
                >
                  <XIcon size={16} />
                </Pressable>
              </View>
              <View className="p-3">
                <Text className="font-semibold text-amber-900" numberOfLines={1}>{recipe.recipeName}</Text>
                <Text className="text-xs text-amber-700 mt-1">{formatDate(recipe.timestamp)}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default SavedRecipesGallery;

