import { db } from '../db';
import { educationTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateEducationInput, type Education } from '../schema';

export const updateEducation = async (input: UpdateEducationInput): Promise<Education> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof educationTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.degree !== undefined) updateData.degree = input.degree;
    if (input.major !== undefined) updateData.major = input.major;
    if (input.institution !== undefined) updateData.institution = input.institution;
    if (input.start_date !== undefined) updateData.start_date = input.start_date;
    if (input.end_date !== undefined) updateData.end_date = input.end_date;
    if (input.gpa !== undefined) updateData.gpa = input.gpa;
    if (input.is_current !== undefined) updateData.is_current = input.is_current;

    // Update education record
    const result = await db
      .update(educationTable)
      .set(updateData)
      .where(eq(educationTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Education record with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Education update failed:', error);
    throw error;
  }
};