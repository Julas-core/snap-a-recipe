import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SparklesIcon } from './icons';

interface RecipeRemixProps {
  onRemix: (prompt: string) => Promise<void>;
  isRemixing: boolean;
}

const suggestionPrompts = [
    "Make it vegan",
    "Make it gluten-free",
    "Double the servings",
    "Make it healthier",
    "Add a spicy kick",
];

const RecipeRemix: React.FC<RecipeRemixProps> = ({ onRemix, isRemixing }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = () => {
        if (prompt.trim() && !isRemixing) {
            onRemix(prompt.trim());
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setPrompt(suggestion);
        if (!isRemixing) {
            onRemix(suggestion);
        }
    }

    return (
        <View className="mt-8 p-6 bg-amber-100/50 rounded-xl border border-amber-200">
            <Text className="text-xl font-semibold font-serif text-amber-900 mb-4 text-center">Remix this Recipe</Text>
            <View className="mb-4 flex-row flex-wrap justify-center gap-2">
                {suggestionPrompts.map((s) => (
                    <Pressable 
                        key={s} 
                        onPress={() => handleSuggestionClick(s)}
                        disabled={isRemixing}
                        className="px-3 py-1 bg-white border border-amber-300 rounded-full"
                    >
                        <Text className="text-sm text-amber-800">{s}</Text>
                    </Pressable>
                ))}
            </View>
            <View className="flex-col gap-3">
                <TextInput
                    value={prompt}
                    onChangeText={setPrompt}
                    editable={!isRemixing}
                    placeholder="e.g., make it for 2 people"
                    className="flex-grow px-4 py-2 bg-white border border-amber-300 rounded-lg"
                />
                <Pressable 
                    onPress={handleSubmit}
                    disabled={isRemixing || !prompt.trim()}
                    className="flex-row items-center justify-center gap-2 px-6 py-2 bg-amber-800 rounded-lg"
                >
                    {isRemixing ? (
                         <>
                            <ActivityIndicator size="small" color="white" />
                            <Text className="text-white font-semibold">Remixing...</Text>
                        </>
                    ) : (
                         <>
                            <SparklesIcon size={20} />
                            <Text className="text-white font-semibold">Remix</Text>
                        </>
                    )}
                </Pressable>
            </View>
        </View>
    );
};

export default RecipeRemix;

