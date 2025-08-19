import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteSkill = async (input: DeleteInput): Promise<void> => {
  try {
    // Delete skill record by ID
    const result = await db.delete(skillsTable)
      .where(eq(skillsTable.id, input.id))
      .execute();

    // Check if any record was actually deleted
    if (result.rowCount === 0) {
      throw new Error(`Skill with ID ${input.id} not found`);
    }
  } catch (error) {
    console.error('Skill deletion failed:', error);
    throw error;
  }
};