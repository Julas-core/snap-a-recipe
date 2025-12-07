import React from 'react';
import { View, Text, Animated } from 'react-native';

const LoadingSpinner = () => {
  return (
    <View className="flex flex-col items-center justify-center p-8">
      <Text className="text-xl font-semibold font-serif tracking-wide text-amber-800">Brewing up your recipe...</Text>
    </View>
  );
};

export default LoadingSpinner;

