import React, { useState, useRef, useEffect } from 'react';
import { Recipe } from '../types';
import { XIcon } from './icons';

interface SavedRecipesGalleryProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onDelete: (recipeName: string) => void;
  onBackToHome?: () => void;
}

const SavedRecipesGallery: React.FC<SavedRecipesGalleryProps> = ({ recipes, onSelect, onDelete, onBackToHome }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if the gallery is scrolled to determine if arrows should appear
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollLeft > 0);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle swipe for mobile devices
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      if (touchStartX - touchEndX > 50) {
        // Swipe left
        container.scrollBy({ left: 200, behavior: 'smooth' });
      } else if (touchEndX - touchStartX > 50) {
        // Swipe right
        container.scrollBy({ left: -200, behavior: 'smooth' });
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (recipes.length === 0) {
    return null; // Don't render if there are no saved recipes
  }

  return (
    <div className="w-full max-w-4xl mt-8 no-print">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold font-serif text-amber-900">Recently Created</h2>
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-800 font-semibold rounded-lg shadow-sm hover:bg-amber-200 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </button>
        )}
      </div>

      <div className="relative">
        <style jsx>{`
          [data-scrollbar-hide] {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          [data-scrollbar-hide]::-webkit-scrollbar {
            display: none;  /* Chrome, Safari, Opera */
          }
        `}</style>
        {/* Left scroll arrow - only show if scrolled */}
        {isScrolled && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-amber-100 transition-all"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Right scroll arrow - always show if there's content to scroll */}
        {recipes.length > 0 && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-amber-100 transition-all"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        <div
          ref={containerRef}
          data-scrollbar-hide
          className="flex overflow-x-auto space-x-4 py-2 px-8 max-w-full"
          style={{
            WebkitOverflowScrolling: 'touch' // For smooth scrolling on iOS
          }}
        >
          {recipes.map((recipe, index) => (
            <div 
              key={recipe.recipeName + (recipe.timestamp || index)} 
              className="flex-shrink-0 w-64 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer"
              onClick={() => onSelect(recipe)}
            >
              <div className="relative">
                {recipe.imageUrl ? (
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.recipeName} 
                    className="w-full h-36 object-cover"
                  />
                ) : (
                  <div className="w-full h-36 bg-amber-200 flex items-center justify-center">
                    <span className="text-amber-700 font-medium">No Image</span>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(recipe.recipeName);
                  }}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow-md hover:bg-red-100 transition-colors"
                  aria-label={`Delete ${recipe.recipeName}`}
                >
                  <XIcon className="w-4 h-4 text-amber-800" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-amber-900 truncate">{recipe.recipeName}</h3>
                <p className="text-xs text-amber-700 mt-1">{formatDate(recipe.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedRecipesGallery;