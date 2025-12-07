import React from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { XIcon } from './icons';

export interface ShoppingListItem {
  text: string;
  checked: boolean;
  recipeName: string;
}

interface ShoppingListProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingListItem[];
  onToggleItem: (itemText: string, recipeName: string) => void;
  onClear: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ isOpen, onClose, items, onToggleItem, onClear }) => {
  // Group items by recipe name
  const groupedItems: Record<string, ShoppingListItem[]> = {};
  for (const item of items) {
    const key = item.recipeName;
    if (!groupedItems[key]) {
      groupedItems[key] = [];
    }
    groupedItems[key].push(item);
  }

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/60 items-center justify-center p-4"
        onPress={onClose}
      >
        <Pressable
          className="bg-amber-50 rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[85vh]"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex flex-row justify-between items-center mb-4 pb-4 border-b border-amber-200">
            <Text className="text-3xl font-serif font-bold text-amber-900">Shopping List</Text>
            <Pressable
              onPress={onClose}
              className="p-1 rounded-full"
            >
              <XIcon size={24} />
            </Pressable>
          </View>
          
          <ScrollView 
            className="flex-1 pr-2" 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {items.length === 0 ? (
              <Text className="text-center text-amber-700 py-8">Your shopping list is empty. Add ingredients from a recipe!</Text>
            ) : (
              <View>
                {Object.entries(groupedItems).map(([recipeName, recipeItems], groupIndex) => (
                  <View key={recipeName} className={groupIndex > 0 ? "mt-6" : ""}>
                    <Text className="text-lg font-semibold text-amber-800 mb-2">{recipeName}</Text>
                    <View>
                      {recipeItems.map((item, index) => (
                        <Pressable
                          key={`${item.text}-${index}`}
                          onPress={() => onToggleItem(item.text, item.recipeName)}
                          className={`flex flex-row items-center gap-3 p-2 rounded-lg mb-3 ${
                            item.checked ? 'bg-amber-200/50' : ''
                          }`}
                        >
                          <View className={`w-5 h-5 rounded-md border-2 ${
                            item.checked ? 'bg-amber-600 border-amber-600' : 'border-amber-400'
                          } items-center justify-center flex-shrink-0`}>
                            {item.checked && (
                              <Text className="text-white text-xs">✓</Text>
                            )}
                          </View>
                          <Text className={`flex-grow ${
                            item.checked ? 'line-through text-amber-800/60' : 'text-amber-800'
                          }`}>
                            {item.text}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          
          {items.length > 0 && (
            <View className="mt-6 pt-4 border-t border-amber-200">
              <Pressable
                onPress={onClear}
                className="w-full py-2 px-4 bg-red-600 rounded-lg"
              >
                <Text className="text-white font-semibold text-center">Clear List</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ShoppingList;

