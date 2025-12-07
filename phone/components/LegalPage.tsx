import React from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { XIcon } from './icons';

interface LegalPageProps {
  title: string;
  onDismiss: () => void;
  children: React.ReactNode;
  visible: boolean;
}

const LegalPage: React.FC<LegalPageProps> = ({ title, onDismiss, children, visible }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable 
        className="flex-1 bg-black/60 items-center justify-center p-4"
        onPress={onDismiss}
      >
        <Pressable 
          className="bg-amber-50 rounded-2xl shadow-2xl p-6 max-w-3xl w-full max-h-[85vh]"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex flex-row justify-between items-center mb-4 pb-4 border-b border-amber-200">
            <Text className="text-3xl font-serif font-bold text-amber-900">{title}</Text>
            <Pressable
              onPress={onDismiss}
              className="p-1 rounded-full"
            >
              <XIcon size={24} />
            </Pressable>
          </View>
          <ScrollView 
            className="flex-1 pr-4" 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default LegalPage;

