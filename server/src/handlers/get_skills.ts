import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type Skill } from '../schema';
import { asc } from 'drizzle-orm';

export const getSkills = async (): Promise<Skill[]> => {
  try {
    // Fetch all skills, ordered by category (technical first) then by name
    const results = await db.select()
      .from(skillsTable)
      .orderBy(
        asc(skillsTable.category),
        asc(skillsTable.name)
      )
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    throw error;
  }
};