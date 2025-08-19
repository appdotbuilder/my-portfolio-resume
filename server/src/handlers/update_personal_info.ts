import { db } from '../db';
import { personalInfoTable } from '../db/schema';
import { type UpdatePersonalInfoInput, type PersonalInfo } from '../schema';
import { sql } from 'drizzle-orm';

export const updatePersonalInfo = async (input: UpdatePersonalInfoInput): Promise<PersonalInfo> => {
  try {
    // Since there should only be one personal info record, we'll upsert
    // First, try to get existing record
    const existing = await db.select()
      .from(personalInfoTable)
      .limit(1)
      .execute();

    let result;

    if (existing.length === 0) {
      // No record exists, insert new one
      const insertResult = await db.insert(personalInfoTable)
        .values({
          name: input.name,
          email: input.email,
          phone: input.phone,
          linkedin_url: input.linkedin_url,
          github_url: input.github_url,
          professional_summary: input.professional_summary,
          photo_url: input.photo_url,
          updated_at: sql`NOW()`
        })
        .returning()
        .execute();
      
      result = insertResult[0];
    } else {
      // Record exists, update it
      const updateResult = await db.update(personalInfoTable)
        .set({
          name: input.name,
          email: input.email,
          phone: input.phone,
          linkedin_url: input.linkedin_url,
          github_url: input.github_url,
          professional_summary: input.professional_summary,
          photo_url: input.photo_url,
          updated_at: sql`NOW()`
        })
        .returning()
        .execute();
      
      result = updateResult[0];
    }

    return result;
  } catch (error) {
    console.error('Personal info update failed:', error);
    throw error;
  }
};