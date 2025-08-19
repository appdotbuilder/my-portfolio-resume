import { db } from '../db';
import { workExperienceTable } from '../db/schema';
import { type CreateWorkExperienceInput, type WorkExperience } from '../schema';

export const createWorkExperience = async (input: CreateWorkExperienceInput): Promise<WorkExperience> => {
  try {
    // Insert work experience record
    const result = await db.insert(workExperienceTable)
      .values({
        company: input.company,
        title: input.title,
        start_date: input.start_date,
        end_date: input.end_date,
        responsibilities: input.responsibilities,
        is_current: input.is_current
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Work experience creation failed:', error);
    throw error;
  }
};