import { Category } from '@/types';
import { Card } from '@/components/ui/Card';
import clsx from 'clsx';

interface CategoryCardProps {
  category: Category;
  selected: boolean;
  onToggle: (categoryId: string) => void;
}

export function CategoryCard({ category, selected, onToggle }: CategoryCardProps) {
  return (
    <Card
      padding="md"
      hover
      className={clsx(
        'cursor-pointer transition-all',
        selected && 'ring-2 ring-blue-500 bg-blue-50'
      )}
      onClick={() => onToggle(category.id)}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{category.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
            {category.type}
          </span>
        </div>
        {selected && (
          <div className="flex-shrink-0 text-blue-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </Card>
  );
}
