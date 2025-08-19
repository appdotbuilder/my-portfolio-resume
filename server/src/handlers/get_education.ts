import { db } from '../db';
import { educationTable } from '../db/schema';
import { type Education } from '../schema';
import { desc } from 'drizzle-orm';

export const getEducation = async (): Promise<Education[]> => {
  try {
    const results = await db.select()
      .from(educationTable)
      .orderBy(desc(educationTable.start_date))
      .execute();

    // Convert gpa from real column back to number
    return results.map(education => ({
      ...education,
      gpa: education.gpa !== null ? education.gpa : null
    }));
  } catch (error) {
    console.error('Get education failed:', error);
    throw error;
  }
};