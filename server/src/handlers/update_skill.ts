import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type UpdateSkillInput, type Skill } from '../schema';
import { eq } from 'drizzle-orm';

export const updateSkill = async (input: UpdateSkillInput): Promise<Skill> => {
  try {
    // Build the update values object, only including defined fields
    const updateValues: Partial<typeof skillsTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateValues.name = input.name;
    }

    if (input.category !== undefined) {
      updateValues.category = input.category;
    }

    if (input.proficiency_level !== undefined) {
      updateValues.proficiency_level = input.proficiency_level;
    }

    // Update the skill record
    const result = await db.update(skillsTable)
      .set(updateValues)
      .where(eq(skillsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Skill with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Skill update failed:', error);
    throw error;
  }
};