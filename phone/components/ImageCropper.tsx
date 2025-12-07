import React, { useState } from 'react';
import { Modal, View, Text, Pressable, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Area } from '../utils/types';

interface ImageCropperProps {
  imageUri: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  visible: boolean;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageUri, onCropComplete, onCancel, visible }) => {
  const [zoom, setZoom] = useState(1);

  const handleConfirmCrop = async () => {
    try {
      // For simplicity, we'll crop to center with zoom applied
      // In a full implementation, you'd want a proper crop UI
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: 800 * zoom,
              height: 800 * zoom,
            },
          },
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!manipResult.base64) {
        throw new Error('Failed to get base64 data from cropped image');
      }

      const croppedImage = `data:image/jpeg;base64,${manipResult.base64}`;
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
      alert('Could not crop the image. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/80 items-center justify-center p-4">
        <View className="w-full max-w-2xl items-center mb-4">
          <Text className="text-2xl font-serif font-bold text-white">Crop Image</Text>
          <Text className="text-white/80">Focus on the food for the best results.</Text>
        </View>
        <View className="relative w-full max-w-2xl h-[60vh] bg-gray-900 rounded-lg overflow-hidden shadow-2xl items-center justify-center">
          <Image 
            source={{ uri: imageUri }} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
        <View className="w-full max-w-sm mt-4">
          <Text className="block mb-2 text-sm font-medium text-white text-center">Zoom</Text>
          <Slider
            value={zoom}
            onValueChange={setZoom}
            minimumValue={1}
            maximumValue={3}
            step={0.1}
            minimumTrackTintColor="#f59e0b"
            maximumTrackTintColor="#d1d5db"
          />
        </View>
        <View className="flex-row mt-6 space-x-4">
          <Pressable
            onPress={onCancel}
            className="px-6 py-3 bg-gray-600 rounded-lg"
          >
            <Text className="text-white font-semibold">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleConfirmCrop}
            className="px-6 py-3 bg-amber-500 rounded-lg"
          >
            <Text className="text-white font-semibold">Confirm Crop</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ImageCropper;

