import { db } from '../db';
import { portfolioProjectsTable } from '../db/schema';
import { type UpdatePortfolioProjectInput, type PortfolioProject } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePortfolioProject = async (input: UpdatePortfolioProjectInput): Promise<PortfolioProject> => {
  try {
    // Prepare update values, only including fields that were provided
    const updateValues: any = {};
    
    if (input.title !== undefined) {
      updateValues.title = input.title;
    }
    if (input.description !== undefined) {
      updateValues.description = input.description;
    }
    if (input.image_url !== undefined) {
      updateValues.image_url = input.image_url;
    }
    if (input.demo_url !== undefined) {
      updateValues.demo_url = input.demo_url;
    }
    if (input.github_url !== undefined) {
      updateValues.github_url = input.github_url;
    }
    if (input.technologies !== undefined) {
      updateValues.technologies = JSON.stringify(input.technologies);
    }
    if (input.display_order !== undefined) {
      updateValues.display_order = input.display_order;
    }
    if (input.is_featured !== undefined) {
      updateValues.is_featured = input.is_featured;
    }

    // Always update the updated_at timestamp
    updateValues.updated_at = new Date();

    // Update the portfolio project record
    const result = await db.update(portfolioProjectsTable)
      .set(updateValues)
      .where(eq(portfolioProjectsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Portfolio project with id ${input.id} not found`);
    }

    // Parse technologies back to array format and return the updated project
    const updatedProject = result[0];
    return {
      ...updatedProject,
      technologies: updatedProject.technologies || '[]' // Ensure technologies is never null
    };
  } catch (error) {
    console.error('Portfolio project update failed:', error);
    throw error;
  }
};