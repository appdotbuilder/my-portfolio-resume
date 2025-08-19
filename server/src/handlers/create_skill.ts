import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type CreateSkillInput, type Skill } from '../schema';

export const createSkill = async (input: CreateSkillInput): Promise<Skill> => {
  try {
    // Insert skill record
    const result = await db.insert(skillsTable)
      .values({
        name: input.name,
        category: input.category,
        proficiency_level: input.proficiency_level
      })
      .returning()
      .execute();

    const skill = result[0];
    return skill;
  } catch (error) {
    console.error('Skill creation failed:', error);
    throw error;
  }
};