import * as ImageManipulator from 'expo-image-manipulator';
import { Area } from './types';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Crops an image using expo-image-manipulator
 * @param imageUri - The URI of the image to crop
 * @param cropArea - The area to crop (in pixels)
 * @returns A promise that resolves to the cropped image data URL
 */
export default async function getCroppedImg(
  imageUri: string,
  cropArea: CropArea
): Promise<string> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX: cropArea.x,
            originY: cropArea.y,
            width: cropArea.width,
            height: cropArea.height,
          },
        },
      ],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    if (!manipResult.base64) {
      throw new Error('Failed to get base64 data from cropped image');
    }

    // Return as data URL format
    return `data:image/jpeg;base64,${manipResult.base64}`;
  } catch (error) {
    console.error('Error cropping image:', error);
    throw error;
  }
}

