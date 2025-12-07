import React from 'react';
import { View } from 'react-native';

const RecipeSkeleton = () => {
  return (
    <View className="bg-white/80 rounded-2xl shadow-lg p-6 w-full">
      {/* Title */}
      <View className="h-8 bg-gray-200 rounded-md w-3/4 mx-auto mb-4"></View>
      
      {/* Description */}
      <View className="space-y-2 max-w-3xl mx-auto mb-8">
        <View className="h-4 bg-gray-200 rounded-md w-full"></View>
        <View className="h-4 bg-gray-200 rounded-md w-5/6"></View>
      </View>
      
      {/* Action Buttons */}
      <View className="flex flex-row flex-wrap justify-center gap-3 mb-8 border-t border-b border-amber-200 py-4">
        <View className="h-9 w-28 bg-gray-200 rounded-lg"></View>
        <View className="h-9 w-24 bg-gray-200 rounded-lg"></View>
        <View className="h-9 w-32 bg-gray-200 rounded-lg"></View>
        <View className="h-9 w-36 bg-gray-200 rounded-lg"></View>
      </View>

      {/* Tabs */}
      <View className="border-b border-amber-300 mb-6">
        <View className="flex flex-row justify-center space-x-2 -mb-px">
           <View className="py-3 px-4 w-40">
              <View className="h-6 bg-gray-200 rounded-md"></View>
           </View>
           <View className="py-3 px-4 w-48">
              <View className="h-6 bg-gray-200 rounded-md"></View>
           </View>
        </View>
      </View>
      
      {/* Content Skeleton (Ingredients List) */}
      <View className="space-y-4 mt-6">
        {Array(6).fill(0).map((_, index) => (
          <View key={index} className="flex flex-row items-center gap-3 p-2">
            <View className="w-6 h-6 rounded-md bg-gray-200 flex-shrink-0"></View>
            <View className="h-5 bg-gray-200 rounded-md flex-grow"></View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default RecipeSkeleton;

