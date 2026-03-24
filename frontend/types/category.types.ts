export type CategoryId = string;
export type CategoryType = 'sports' | 'entertainment' | 'politics' | 'crypto' | 'custom';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  type: CategoryType;
  icon?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface CategoryOption {
  id: string;
  categoryId: CategoryId;
  label: string;
  description?: string;
}
