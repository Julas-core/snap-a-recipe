import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface FooterProps {
  onLinkClick: (page: 'privacy' | 'terms') => void;
}

const Footer: React.FC<FooterProps> = ({ onLinkClick }) => {
  return (
    <View className="w-full max-w-4xl items-center mt-8 py-4">
      <View className="flex flex-row items-center justify-center">
        <Text className="text-xs text-amber-700/80">
          © {new Date().getFullYear()} Snap-a-Recipe. All Rights Reserved.
        </Text>
        <Text className="text-xs text-amber-700/80 mx-2">|</Text>
        <Pressable onPress={() => onLinkClick('privacy')}>
          <Text className="text-xs text-amber-700/80 underline">Privacy Policy</Text>
        </Pressable>
        <Text className="text-xs text-amber-700/80 mx-2">|</Text>
        <Pressable onPress={() => onLinkClick('terms')}>
          <Text className="text-xs text-amber-700/80 underline">Terms of Service</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Footer;

