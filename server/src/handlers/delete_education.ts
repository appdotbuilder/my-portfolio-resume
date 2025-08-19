import { db } from '../db';
import { educationTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteEducation = async (input: DeleteInput): Promise<void> => {
  try {
    // Delete the education entry by ID
    const result = await db.delete(educationTable)
      .where(eq(educationTable.id, input.id))
      .execute();

    // Note: PostgreSQL/Drizzle doesn't throw an error if the ID doesn't exist
    // The delete operation will complete successfully with 0 affected rows
  } catch (error) {
    console.error('Education deletion failed:', error);
    throw error;
  }
};