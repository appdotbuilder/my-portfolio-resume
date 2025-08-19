import { db } from '../db';
import { workExperienceTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteWorkExperience = async (input: DeleteInput): Promise<void> => {
  try {
    // Delete the work experience record by ID
    const result = await db.delete(workExperienceTable)
      .where(eq(workExperienceTable.id, input.id))
      .returning()
      .execute();

    // If no rows were affected, the work experience doesn't exist
    if (result.length === 0) {
      throw new Error(`Work experience with ID ${input.id} not found`);
    }
  } catch (error) {
    console.error('Work experience deletion failed:', error);
    throw error;
  }
};