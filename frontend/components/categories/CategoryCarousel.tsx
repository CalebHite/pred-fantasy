'use client';

import { Category } from '@/types';
import { useState, useRef } from 'react';
import clsx from 'clsx';
import { MIN_CATEGORIES_REQUIRED, MAX_CATEGORIES_ALLOWED } from '@/lib/utils/constants';

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

export function CategoryCarousel({
  categories,
  selectedCategories,
  onCategoryToggle,
}: CategoryCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const isMaxSelected = selectedCategories.length >= MAX_CATEGORIES_ALLOWED;

  const handleToggle = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);

    if (isSelected) {
      onCategoryToggle(categoryId);
    } else if (!isMaxSelected) {
      onCategoryToggle(categoryId);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of card + gap
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      // Update scroll button states after animation
      setTimeout(() => {
        checkScrollButtons();
      }, 300);
    }
  };

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Select {MIN_CATEGORIES_REQUIRED}-{MAX_CATEGORIES_ALLOWED} categories for your game.{' '}
          <span className="font-medium">
            {selectedCategories.length}/{MAX_CATEGORIES_ALLOWED} selected
          </span>
        </p>
      </div>

      <div className="relative">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Carousel container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);

            return (
              <div
                key={category.id}
                onClick={() => handleToggle(category.id)}
                className={clsx(
                  'flex-shrink-0 w-72 snap-start cursor-pointer rounded-lg border-2 transition-all overflow-hidden',
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                {/* Image placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-6xl">{category.icon}</div>
                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                  <span className="inline-block mt-3 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {category.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCategories.length < MIN_CATEGORIES_REQUIRED && (
        <p className="mt-4 text-sm text-amber-600">
          Please select at least {MIN_CATEGORIES_REQUIRED} categories to continue
        </p>
      )}

      {isMaxSelected && (
        <p className="mt-4 text-sm text-amber-600">
          Maximum {MAX_CATEGORIES_ALLOWED} categories reached. Deselect one to choose another.
        </p>
      )}
    </div>
  );
}
