'use client';

import { Category } from '@/types';
import { CategoryCard } from './CategoryCard';
import { MIN_CATEGORIES_REQUIRED, MAX_CATEGORIES_ALLOWED } from '@/lib/utils/constants';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

export function CategorySelector({
  categories,
  selectedCategories,
  onCategoryToggle,
}: CategorySelectorProps) {
  const isMaxSelected = selectedCategories.length >= MAX_CATEGORIES_ALLOWED;

  const handleToggle = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);

    if (isSelected) {
      // Always allow deselection
      onCategoryToggle(categoryId);
    } else if (!isMaxSelected) {
      // Only allow selection if under max
      onCategoryToggle(categoryId);
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            selected={selectedCategories.includes(category.id)}
            onToggle={handleToggle}
          />
        ))}
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
