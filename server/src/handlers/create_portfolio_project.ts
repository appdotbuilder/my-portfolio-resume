import { db } from '../db';
import { portfolioProjectsTable } from '../db/schema';
import { type CreatePortfolioProjectInput, type PortfolioProject } from '../schema';

export const createPortfolioProject = async (input: CreatePortfolioProjectInput): Promise<PortfolioProject> => {
  try {
    // Convert technologies array to JSON string for storage
    const technologiesJson = JSON.stringify(input.technologies);
    
    // Insert portfolio project record
    const result = await db.insert(portfolioProjectsTable)
      .values({
        title: input.title,
        description: input.description,
        image_url: input.image_url,
        demo_url: input.demo_url,
        github_url: input.github_url,
        technologies: technologiesJson,
        display_order: input.display_order || 0,
        is_featured: input.is_featured
      })
      .returning()
      .execute();

    const project = result[0];
    return {
      ...project,
      // Parse technologies JSON string back to ensure proper type
      technologies: project.technologies
    };
  } catch (error) {
    console.error('Portfolio project creation failed:', error);
    throw error;
  }
};