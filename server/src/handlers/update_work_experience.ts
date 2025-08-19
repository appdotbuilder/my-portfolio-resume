import { db } from '../db';
import { workExperienceTable } from '../db/schema';
import { type UpdateWorkExperienceInput, type WorkExperience } from '../schema';
import { eq } from 'drizzle-orm';

export const updateWorkExperience = async (input: UpdateWorkExperienceInput): Promise<WorkExperience> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.company !== undefined) updateData.company = input.company;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.start_date !== undefined) updateData.start_date = input.start_date;
    if (input.end_date !== undefined) updateData.end_date = input.end_date;
    if (input.responsibilities !== undefined) updateData.responsibilities = input.responsibilities;
    if (input.is_current !== undefined) updateData.is_current = input.is_current;
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Update work experience record
    const result = await db.update(workExperienceTable)
      .set(updateData)
      .where(eq(workExperienceTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Work experience with ID ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Work experience update failed:', error);
    throw error;
  }
};