import React from 'react';
import { Recipe } from '../types';
import { TrashIcon } from './icons';

interface SavedRecipesProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onDelete: (recipeId: number) => void;
  activeRecipeName: string | null;
}

const SavedRecipes: React.FC<SavedRecipesProps> = ({ recipes, onSelect, onDelete, activeRecipeName }) => {
  return (
    <div className="w-full max-w-4xl bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg mt-8 animate-fade-in print:hidden">
      <h2 className="text-2xl font-semibold mb-4 font-serif text-center text-amber-900">Saved Recipes</h2>
      {recipes.length > 0 ? (
        <ul className="space-y-3">
          {recipes.map((recipe) => {
            const isActive = recipe.recipeName === activeRecipeName;
            return (
              <li
                key={recipe.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
                  isActive ? 'bg-amber-200/80 shadow-inner' : 'hover:bg-amber-100/70'
                }`}
              >
                <button
                  onClick={() => onSelect(recipe)}
                  className="flex-grow text-left min-w-0"
                >
                  <h3 className={`font-semibold ${isActive ? 'text-amber-900' : 'text-amber-800'}`}>{recipe.recipeName}</h3>
                  <p className={`text-sm truncate ${isActive ? 'text-amber-700' : 'text-amber-600'}`}>{recipe.description}</p>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (recipe.id) {
                      onDelete(recipe.id);
                    }
                  }}
                  aria-label={`Delete ${recipe.recipeName}`}
                  className="ml-4 p-2 rounded-full text-amber-600 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center text-amber-700 py-4">
          <p>You haven't saved any recipes yet.</p>
          <p className="text-sm">When you generate a recipe, click "Save Recipe" to add it here!</p>
        </div>
      )}
    </div>
  );
};

export default SavedRecipes;