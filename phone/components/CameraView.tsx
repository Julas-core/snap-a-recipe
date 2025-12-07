import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, Alert } from 'react-native';
import { CameraView as ExpoCameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { XIcon, CameraOffIcon } from './icons';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
  visible: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel, visible }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible, permission]);

  const handleCapture = async () => {
    if (!permission?.granted) {
      Alert.alert('Camera Permission', 'Camera access is required to take photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const imageDataUrl = `data:image/jpeg;base64,${asset.base64}`;
          onCapture(imageDataUrl);
        } else {
          // Fallback: convert URI to base64 if needed
          onCapture(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center p-4">
          <View className="bg-amber-50 rounded-lg p-8 items-center">
            <CameraOffIcon size={64} />
            <Text className="text-2xl font-serif font-bold text-red-700 mb-3 mt-4">Camera Access Needed</Text>
            <Text className="text-amber-800">Requesting camera permission...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center p-4">
          <View className="bg-amber-50 rounded-lg p-8 items-center">
            <CameraOffIcon size={64} />
            <Text className="text-2xl font-serif font-bold text-red-700 mb-3 mt-4">Camera Access Needed</Text>
            <Text className="text-amber-800 mb-4">Camera access was denied. To take a photo, you'll need to grant permission in your device settings.</Text>
            <Pressable onPress={requestPermission} className="px-6 py-3 bg-amber-500 rounded-lg">
              <Text className="text-white font-semibold">Request Permission</Text>
            </Pressable>
            <Pressable onPress={onCancel} className="mt-4 px-6 py-3 bg-gray-600 rounded-lg">
              <Text className="text-white font-semibold">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/80">
        <Pressable
          onPress={onCancel}
          className="absolute top-4 right-4 z-10 bg-black/30 rounded-full p-2"
        >
          <XIcon size={32} />
        </Pressable>

        <View className="flex-1 items-center justify-center p-4">
          <View className="relative w-full max-w-2xl aspect-square rounded-lg overflow-hidden shadow-2xl">
            <ExpoCameraView
              style={{ flex: 1 }}
              facing={facing}
            />
          </View>
          <View className="mt-6 flex-row space-x-4">
            <Pressable
              onPress={handleCapture}
              className="w-20 h-20 bg-white rounded-full items-center justify-center"
            >
              <View className="w-16 h-16 bg-white rounded-full border-4 border-amber-600"></View>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CameraView;

