import { db } from '../db';
import { portfolioProjectsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deletePortfolioProject = async (input: DeleteInput): Promise<void> => {
  try {
    // Delete portfolio project by ID
    const result = await db.delete(portfolioProjectsTable)
      .where(eq(portfolioProjectsTable.id, input.id))
      .execute();

    // Check if any rows were affected (project existed and was deleted)
    if (result.rowCount === 0) {
      throw new Error(`Portfolio project with ID ${input.id} not found`);
    }
  } catch (error) {
    console.error('Portfolio project deletion failed:', error);
    throw error;
  }
};