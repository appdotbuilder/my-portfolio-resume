import { db } from '../db';
import { portfolioProjectsTable } from '../db/schema';
import { type PortfolioProject } from '../schema';
import { desc, asc } from 'drizzle-orm';

export const getPortfolioProjects = async (): Promise<PortfolioProject[]> => {
  try {
    // Fetch all portfolio projects ordered by:
    // 1. is_featured descending (featured first)
    // 2. display_order ascending
    // 3. created_at descending
    const results = await db.select()
      .from(portfolioProjectsTable)
      .orderBy(
        desc(portfolioProjectsTable.is_featured),
        asc(portfolioProjectsTable.display_order),
        desc(portfolioProjectsTable.created_at)
      )
      .execute();

    // Convert the results to match the schema format
    return results.map(project => ({
      ...project,
      technologies: project.technologies // Keep as string - will be parsed by client if needed
    }));
  } catch (error) {
    console.error('Failed to fetch portfolio projects:', error);
    throw error;
  }
};