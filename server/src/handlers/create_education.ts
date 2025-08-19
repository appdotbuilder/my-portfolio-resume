import { db } from '../db';
import { educationTable } from '../db/schema';
import { type CreateEducationInput, type Education } from '../schema';

export const createEducation = async (input: CreateEducationInput): Promise<Education> => {
  try {
    // Insert education record
    const result = await db.insert(educationTable)
      .values({
        degree: input.degree,
        major: input.major,
        institution: input.institution,
        start_date: input.start_date,
        end_date: input.end_date,
        gpa: input.gpa, // Real column - no conversion needed
        is_current: input.is_current // Boolean column - no conversion needed
      })
      .returning()
      .execute();

    // Return the education record
    const education = result[0];
    return education;
  } catch (error) {
    console.error('Education creation failed:', error);
    throw error;
  }
};