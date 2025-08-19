import { db } from '../db';
import { workExperienceTable } from '../db/schema';
import { desc } from 'drizzle-orm';
import { type WorkExperience } from '../schema';

export const getWorkExperience = async (): Promise<WorkExperience[]> => {
  try {
    // Fetch all work experience entries ordered by start_date descending (most recent first)
    const results = await db.select()
      .from(workExperienceTable)
      .orderBy(desc(workExperienceTable.start_date))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch work experience:', error);
    throw error;
  }
};