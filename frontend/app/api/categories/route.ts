import { NextResponse } from 'next/server';
import { getAvailableCategories, getEventsForCategory } from '../../../../backend/services/category.service';

/**
 * GET /api/categories
 * Returns list of available game categories with market counts
 */
export async function GET() {
  try {
    const categories = getAvailableCategories();

    // Fetch market counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        try {
          const events = await getEventsForCategory(category.key);
          return {
            ...category,
            marketCount: events.length,
          };
        } catch {
          return {
            ...category,
            marketCount: 0,
          };
        }
      })
    );

    return NextResponse.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
